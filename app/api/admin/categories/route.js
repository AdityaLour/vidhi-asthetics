import pool from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function POST(request) {
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

        const [existingCategory] = await connection.execute(
            `
            SELECT id
            FROM categories
            WHERE name = ?
            LIMIT 1
            `,
            [cleanName]
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

        const [result] = await connection.execute(
            `
            INSERT INTO categories(name)
            VALUES(?)
            `,
            [cleanName]
        );

        return Response.json(
            {
                success: true,
                message: "Category created successfully.",
                categoryId: result.insertId,
            },
            {
                status: 201,
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

        const [rows] = await connection.execute(`
            SELECT
                id,
                name,
                created_at
            FROM categories
            ORDER BY name ASC
        `);

        return Response.json(
            {
                success: true,
                categories: rows,
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