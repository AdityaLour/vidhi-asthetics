import pool from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function DELETE(request, { params }) {
    let connection;
    try {
        const admin = await requireAdmin()

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
        const categoryId = Number(id);

        if (Number.isNaN(categoryId) || categoryId <= 0) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid category id.",
                },
                {
                    status: 400,
                }
            );
        }



        connection = await pool.getConnection()

        const [rows] = await connection.execute(
            `
            SELECT id, name
            FROM categories
            WHERE id = ?
            LIMIT 1
            `,
            [categoryId]
        );

        if (rows.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Category not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const [countRows] = await connection.execute(
            `
            SELECT COUNT(*) AS total_products
            FROM product_categories
            WHERE category_id = ?
            `,
            [categoryId]
        );

        const totalProducts = countRows[0].total_products;


        if (totalProducts > 0) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Cannot delete this category. Please remove or reassign all assigned products before deleting it.",
                },
                {
                    status: 409,
                }
            );
        }

        await connection.execute(
            `
            DELETE FROM categories
            WHERE id = ?
            `,
            [categoryId]
        );


        return Response.json(
            {
                success: true,
                message: "Category deleted successfully.",
            },
            {
                status: 200,
            }
        );

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

        const { id } = await params;
        const categoryId = Number(id);

        if (Number.isNaN(categoryId) || categoryId <= 0) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid category id.",
                },
                {
                    status: 400,
                }
            );
        }

        const body = await request.json();
        const cleanName = body.name?.trim();

        if (!cleanName) {
            return Response.json(
                {
                    success: false,
                    message: "Category name is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (cleanName.length > 255) {
            return Response.json(
                {
                    success: false,
                    message: "Category name cannot exceed 255 characters.",
                },
                {
                    status: 400,
                }
            );
        }

        connection = await pool.getConnection();

        const [categoryRows] = await connection.execute(
            `
            SELECT id
            FROM categories
            WHERE id = ?
            LIMIT 1
            `,
            [categoryId]
        );

        if (categoryRows.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Category not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const [existingCategory] = await connection.execute(
            `
            SELECT id
            FROM categories
            WHERE name = ?
            AND id != ?
            LIMIT 1
            `,
            [cleanName, categoryId]
        );

        if (existingCategory.length > 0) {
            return Response.json(
                {
                    success: false,
                    message: "Category already exists.",
                },
                {
                    status: 409,
                }
            );
        }

        await connection.execute(
            `
            UPDATE categories
            SET name = ?
            WHERE id = ?
            `,
            [cleanName, categoryId]
        );

        return Response.json(
            {
                success: true,
                message: "Category updated successfully.",
            },
            {
                status: 200,
            }
        );
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