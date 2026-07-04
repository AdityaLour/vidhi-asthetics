import pool from "@/lib/db";

export async function getAllCategories() {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.execute(
            `SELECT
                c.id,
                c.name,
                COUNT(pc.product_id) AS total_products
                FROM categories c
                LEFT JOIN product_categories pc
                ON c.id = pc.category_id
                GROUP BY c.id, c.name
                ORDER BY c.name ASC`
        );

        return rows;
    } finally {
        connection.release();
    }
}