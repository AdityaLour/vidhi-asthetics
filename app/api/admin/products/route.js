import pool from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function POST(request) {
    let connection;
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

        const body = await request.json()

        const cleanName = body.name?.trim()
        const cleanDescription = body.description?.trim()

        const price = Number(body.price)
        const discount = Number(body.discount_percentage || 0);
        const stock = Number(body.stock)
        const lowStockThreshold = Number(body.low_stock_threshold)


        const featured = body.featured
        const displayOrder = Number(body.display_order || 0)
        const status = body.status;

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
            await connection.rollback();
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