import pool from "@/lib/db";
import imagekit from "@/lib/imagekit";
import { requireAdmin } from "@/lib/session";

export async function POST(request, { params }) {
    let connection;
    const uploadedImages = [];

    try {
        const admin = await requireAdmin();

        if (!admin) {
            return Response.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const { id } = await params;
        const productId = Number(id);

        const formData = await request.formData();
        const images = formData.getAll("images");

        if (images.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Please select at least one image.",
                },
                {
                    status: 400,
                }
            );
        }

        connection = await pool.getConnection();

        const [currentImages] = await connection.execute(
            `
      SELECT COUNT(*) AS total
      FROM product_images
      WHERE product_id = ?
      `,
            [productId]
        );

        if (currentImages[0].total + images.length > 5) {
            return Response.json(
                {
                    success: false,
                    message: "Maximum 5 images allowed per product.",
                },
                {
                    status: 400,
                }
            );
        }

        const [lastOrder] = await connection.execute(
            `
      SELECT MAX(display_order) AS max_order
      FROM product_images
      WHERE product_id = ?
      `,
            [productId]
        );

        let imageDisplayOrder = (lastOrder[0].max_order || 0) + 1;

        for (const image of images) {
            const buffer = Buffer.from(
                await image.arrayBuffer()
            );

            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: image.name,
                folder: "/products",
                useUniqueFileName: true,
            });

            uploadedImages.push(uploadResponse);

            await connection.execute(
                `
                INSERT INTO product_images
                (
                product_id,
                image_url,
                storage_key,
                file_name,
                is_primary,
                display_order
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    productId,
                    uploadResponse.url,
                    uploadResponse.fileId,
                    uploadResponse.name,
                    false,
                    imageDisplayOrder,
                ]
            );

            imageDisplayOrder++;
        }

        return Response.json({
            success: true,
            message: "Images uploaded successfully.",
        });
    } catch (error) {
        console.error(error);

        for (const image of uploadedImages) {
            try {
                await imagekit.deleteFile(image.fileId);
            } catch { }
        }

        return Response.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

