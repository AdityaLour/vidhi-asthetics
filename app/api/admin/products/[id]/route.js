import pool from "@/lib/db";
import imagekit from "@/lib/imagekit";
import { requireAdmin } from "@/lib/session";

export async function PATCH(request, { params }) {
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

        if (Number.isNaN(productId) || productId <= 0) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid product id.",
                },
                {
                    status: 400,
                }
            );
        }

        const formData = await request.formData();

        const cleanName = formData.get("name")?.trim();
        const cleanDescription = formData.get("description")?.trim();

        const price = Number(formData.get("price"));
        const discount = Number(formData.get("discount_percentage") || 0);
        const stock = Number(formData.get("stock"));
        const lowStockThreshold = Number(formData.get("low_stock_threshold"));

        const featured = formData.get("featured") === "true";
        const displayOrder = Number(formData.get("display_order") || 0);
        const status = formData.get("status");

        const categories = formData
            .getAll("categories")
            .map(Number);

        const images = formData.getAll("images");
        const deletedImages = formData
            .getAll("deletedImages")
            .map(Number);

        if (!cleanName) {
            return Response.json(
                {
                    success: false,
                    message: "Product name is required."
                },
                {
                    status: 400
                }
            );
        }

        if (cleanName.length > 255) {
            return Response.json(
                {
                    success: false,
                    message: "Product name cannot exceed 255 characters."
                },
                {
                    status: 400
                }
            );
        }

        if (!cleanDescription) {
            return Response.json(
                {
                    success: false,
                    message: "Description is required."
                },
                {
                    status: 400
                }
            );
        }

        if (Number.isNaN(price) || price <= 0) {
            return Response.json(
                {
                    success: false,
                    message: "Please enter a valid price."
                },
                {
                    status: 400
                }
            );
        }

        if (Number.isNaN(discount) || discount < 0 || discount > 100) {
            return Response.json(
                {
                    success: false,
                    message: "Discount must be between 0 and 100."
                },
                {
                    status: 400
                }
            );
        }

        if (Number.isNaN(stock) || stock < 0) {
            return Response.json(
                {
                    success: false,
                    message: "Stock cannot be negative."
                },
                {
                    status: 400
                }
            );
        }

        if (Number.isNaN(lowStockThreshold) || lowStockThreshold < 0) {
            return Response.json(
                {
                    success: false,
                    message: "Low stock threshold cannot be negative."
                },
                {
                    status: 400
                }
            );
        }

        if (Number.isNaN(displayOrder) || displayOrder < 0) {
            return Response.json(
                {
                    success: false,
                    message: "Display order cannot be negative."
                },
                {
                    status: 400
                }
            );
        }

        const validStatus = [
            "active",
            "inactive",
            "out_of_stock"
        ];

        if (!validStatus.includes(status)) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid product status."
                },
                {
                    status: 400
                }
            );
        }

        if (!Array.isArray(categories) || categories.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Please select at least one category.",
                },
                {
                    status: 400,
                }
            );
        }


        const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (images.length > 0) {

            if (images.length > 5) {
                return Response.json(
                    {
                        success: false,
                        message: "You can upload a maximum of 5 images.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            for (const image of images) {
                if (image.size > MAX_IMAGE_SIZE) {
                    return Response.json(
                        {
                            success: false,
                            message: "Each image must be smaller than 10 MB.",
                        },
                        {
                            status: 400,
                        }
                    );
                }
            }

            for (const image of images) {
                if (!allowedTypes.includes(image.type)) {
                    return Response.json(
                        {
                            success: false,
                            message: "Only JPG, PNG and WEBP images are allowed.",
                        },
                        {
                            status: 400,
                        }
                    );
                }
            }


        }


        const slug = cleanName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-");


        connection = await pool.getConnection();

        const [existingProduct] = await connection.execute(
            `
            SELECT id
            FROM products
            WHERE id = ?
            LIMIT 1
            `,
            [productId]
        );

        if (existingProduct.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Product not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const [duplicateProduct] = await connection.execute(
            `
            SELECT id
            FROM products
            WHERE slug = ?
            AND id != ?
            LIMIT 1               
            `,
            [slug, productId]
        );

        if (duplicateProduct.length > 0) {
            return Response.json(
                {
                    success: false,
                    message: "A product with this name already exists.",
                },
                {
                    status: 409,
                }
            );
        }


        if (images.length > 0) {
            for (const image of images) {
                const arrayBuffer = await image.arrayBuffer();

                const buffer = Buffer.from(arrayBuffer);

                const uploadResponse = await imagekit.upload({
                    file: buffer,
                    fileName: image.name,
                    folder: "/products",
                    useUniqueFileName: true,
                });

                uploadedImages.push(uploadResponse);
            }
        }


        const [[{ totalImages }]] = await connection.execute(
            `
            SELECT COUNT(*) AS totalImages
            FROM product_images
            WHERE product_id = ?
            `,
            [productId]
        );

        let imagesToDelete = [];

        if (deletedImages.length > 0) {
            const placeholders = deletedImages.map(() => "?").join(",");

            const [rows] = await connection.execute(
                `
                SELECT
                    id,
                    storage_key
                FROM product_images
                WHERE product_id = ?
                AND id IN (${placeholders})
                `,
                [productId, ...deletedImages]
            );

            imagesToDelete = rows;
        }

        const remainingImages =
            totalImages -
            imagesToDelete.length +
            uploadedImages.length;

        const [[{ maxDisplayOrder }]] = await connection.execute(
            `
            SELECT COALESCE(MAX(display_order), 0) AS maxDisplayOrder
            FROM product_images
            WHERE product_id = ?
            `,
            [productId]
        );

        let imageDisplayOrder = maxDisplayOrder + 1;

        if (remainingImages < 1) {

            for (const image of uploadedImages) {
                await imagekit.deleteFile(image.fileId);
            }

            return Response.json(
                {
                    success: false,
                    message: "A product must have at least one image.",
                },
                {
                    status: 400,
                }
            );
        }

        await connection.beginTransaction();

        await connection.execute(
            `
            UPDATE products
            SET
                name = ?,
                slug = ?,
                description = ?,
                price = ?,
                discount_percentage = ?,
                stock = ?,
                low_stock_threshold = ?,
                featured = ?,
                display_order = ?,
                status = ?
                WHERE id = ?
            `,
            [
                cleanName,
                slug,
                cleanDescription,
                price,
                discount,
                stock,
                lowStockThreshold,
                featured,
                displayOrder,
                status,
                productId,
            ]
        );


        await connection.execute(
            `
            DELETE FROM product_categories
            WHERE product_id = ?
            `,
            [productId]
        );


        const uniqueCategories = [...new Set(categories)];

        for (const categoryId of uniqueCategories) {
            await connection.execute(
                `
                INSERT INTO product_categories
                (product_id, category_id)
                VALUES (?, ?)
                `,
                [productId, categoryId]
            );
        }

        for (const image of uploadedImages) {
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
                    image.url,
                    image.fileId,
                    image.name,
                    false,
                    imageDisplayOrder,
                ]
            );
            imageDisplayOrder++;
        }


        if (imagesToDelete.length > 0) {
            const placeholders = imagesToDelete.map(() => "?").join(",");

            await connection.execute(
                `
                DELETE FROM product_images
                WHERE product_id = ?
                AND id IN (${placeholders})
                `,
                [productId, ...imagesToDelete.map(image => image.id)]
            );
        }

        const [[primaryImage]] = await connection.execute(
            `
            SELECT id
            FROM product_images
            WHERE product_id = ?
            AND is_primary = TRUE
            LIMIT 1
            `,
            [productId]
        );

        if (!primaryImage) {
            await connection.execute(
                `
                UPDATE product_images
                SET is_primary = TRUE
                WHERE product_id = ?
                ORDER BY display_order
                LIMIT 1
                `,
                [productId]
            );
        }

        await connection.commit();

        for (const image of imagesToDelete) {
            try {
                await imagekit.deleteFile(image.storage_key);
            } catch (error) {
                console.error(
                    "Failed to delete ImageKit file:",
                    error
                );
            }
        }

        return Response.json(
            {
                success: true,
                message: "Product updated successfully.",
            },
            {
                status: 200,
            }
        );


    } catch (error) {
        console.error(error);

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }

        for (const image of uploadedImages) {
            try {
                await imagekit.deleteFile(image.fileId);
            } catch (error) {
                console.error(
                    "Failed to delete uploaded image:",
                    error
                );
            }
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

        const { id } = await params;
        const productId = Number(id);

        if (Number.isNaN(productId) || productId <= 0) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid product id.",
                },
                {
                    status: 400,
                }
            );
        }

        connection = await pool.getConnection();

        const [existingProduct] = await connection.execute(
            `
            SELECT id
            FROM products
            WHERE id = ?
            LIMIT 1
            `,
            [productId]
        );

        if (existingProduct.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Product not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const [productImages] = await connection.execute(
            `
            SELECT storage_key
            FROM product_images
            WHERE product_id = ?
            `,
            [productId]
        );


        await connection.beginTransaction()

        await connection.execute(
            `
            DELETE FROM products
            WHERE id = ?
            `,
            [productId]
        );

        await connection.commit()

        for (const image of productImages) {
            try {
                await imagekit.deleteFile(image.storage_key);
            } catch (error) {
                console.error(
                    "Failed to delete ImageKit file:",
                    error
                );
            }
        }

        return Response.json(
            {
                success: true,
                message: "Product deleted successfully.",
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.error("Delete Product Error:", error);

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
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