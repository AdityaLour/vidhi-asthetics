import pool from "@/lib/db";
import imagekit from "@/lib/imagekit";
import { requireAdmin } from "@/lib/session";

export async function PATCH(request, { params }) {
    let connection;

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

        const { id, imageId } = await params;

        const productId = Number(id);
        const imageIdNumber = Number(imageId);

        connection = await pool.getConnection();
        await connection.beginTransaction();

        await connection.execute(
            `
      UPDATE product_images
      SET is_primary = FALSE
      WHERE product_id = ?
      `,
            [productId]
        );

        await connection.execute(
            `
      UPDATE product_images
      SET is_primary = TRUE
      WHERE id = ?
      `,
            [imageIdNumber]
        );

        await connection.commit();

        return Response.json({
            success: true,
            message: "Primary image updated.",
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(error);

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

export async function DELETE(request, { params }) {
    let connection;

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

        const { id, imageId } = await params;

        const productId = Number(id);
        const imageIdNumber = Number(imageId);


        connection = await pool.getConnection();

        const [images] = await connection.execute(
            `
      SELECT *
      FROM product_images
      WHERE product_id = ?
      `,
            [productId]
        );

        if (images.length <= 1) {
            return Response.json(
                {
                    success: false,
                    message:
                        "A product must have at least one image.",
                },
                {
                    status: 400,
                }
            );
        }

        const image = images.find(
            (img) => img.id === imageIdNumber
        );

        if (!image) {
            return Response.json(
                {
                    success: false,
                    message: "Image not found.",
                },
                {
                    status: 404,
                }
            );
        }

        await connection.beginTransaction();

        await imagekit.deleteFile(image.storage_key);

        await connection.execute(
            `
      DELETE FROM product_images
      WHERE id = ?
      `,
            [imageIdNumber]
        );

        if (image.is_primary) {
            const [remaining] = await connection.execute(
                `
        SELECT id
        FROM product_images
        WHERE product_id = ?
        ORDER BY display_order
        LIMIT 1
        `,
                [productId]
            );

            if (remaining.length > 0) {
                await connection.execute(
                    `
          UPDATE product_images
          SET is_primary = TRUE
          WHERE id = ?
          `,
                    [remaining[0].id]
                );
            }
        }

        await connection.commit();

        return Response.json({
            success: true,
            message: "Image deleted successfully.",
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(error);

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