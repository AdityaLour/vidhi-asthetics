import pool from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import imagekit from "@/lib/imagekit";


export async function GET() {
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

        connection = await pool.getConnection();

        const [products] = await connection.execute(`
            SELECT
                p.id,
                p.name,
                p.slug,
                p.description,
                p.price,
                p.discount_percentage,
                p.stock,
                p.low_stock_threshold,
                p.featured,
                p.display_order,
                p.status,

                GROUP_CONCAT(
                    DISTINCT c.name
                    ORDER BY c.name
                    SEPARATOR ', '
                ) AS categories,

                (
                    SELECT image_url
                    FROM product_images
                    WHERE product_id = p.id
                    AND is_primary = TRUE
                    LIMIT 1
                ) AS primary_image

            FROM products p

            LEFT JOIN product_categories pc
                ON p.id = pc.product_id

            LEFT JOIN categories c
                ON pc.category_id = c.id

            GROUP BY p.id

            ORDER BY
                p.display_order ASC,
                p.id DESC
        `);

        return Response.json({
            success: true,
            products,
        });

    } catch (error) {
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

export async function POST(request) {
    let connection;
    const uploadedImages = [];
    try {
        const admin = await requireAdmin();

        if (!admin) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, {
                status: 401,
            })
        };

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

        if (images.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Please upload at least one image.",
                },
                {
                    status: 400,
                }
            );
        }

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


        const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

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

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

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
            WHERE slug = ?
            LIMIT 1
            `,
            [slug]
        );

        if (existingProduct.length > 0) {
            return Response.json(
                {
                    success: false,
                    message: "A product with this name already exists."
                },
                {
                    status: 409
                }
            );
        }

        const uniqueCategories = [...new Set(categories)];

        const placeholders = uniqueCategories.map(() => "?").join(",");

        const [validCategories] = await connection.execute(
            `
            SELECT id
            FROM categories
            WHERE id IN (${placeholders})
            `,
            uniqueCategories
        );

        if (validCategories.length !== uniqueCategories.length) {
            for (const image of uploadedImages) {
                await imagekit.deleteFile(image.fileId);
            }
            return Response.json(
                {
                    success: false,
                    message: "One or more selected categories are invalid.",
                },
                {
                    status: 400,
                }
            );
        }

        for (const image of images) {
            const arrayBuffer = await image.arrayBuffer();

            const buffer = Buffer.from(arrayBuffer);

            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: image.name,
                folder: "/products",
                useUniqueFileName: true,
            });;

            uploadedImages.push(uploadResponse);
        }

        await connection.beginTransaction()

        const [result] = await connection.execute(
            `INSERT INTO products
                (name, slug, description, price, discount_percentage, stock, low_stock_threshold, featured, display_order, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                status
            ]
        )

        const productId = result.insertId

        for (const categoryId of uniqueCategories) {
            await connection.execute(
                `
                INSERT INTO product_categories (product_id, category_id)
                VALUES (?, ?)
                `,
                [productId, categoryId]
            );

        }

        let imageDisplayOrder = 1;
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
                    imageDisplayOrder === 1,
                    imageDisplayOrder,
                ]
            );

            imageDisplayOrder++;
        }

        await connection.commit()

        return Response.json(
            {
                success: true,
                message: "Product created successfully.",
                productId
            },
            {
                status: 201
            }
        );
    } catch (error) {
        console.log(error);

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

        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500,
        })
    } finally {
        if (connection) {
            connection.release()
        }
    }
}