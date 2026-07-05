import pool from "@/lib/db";

export async function getAllProducts() {
    let connection;

    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(`
            SELECT
                p.id,
                p.name,
                p.slug,
                p.price,
                p.discount_percentage,
                p.stock,
                p.featured,
                p.status,
                GROUP_CONCAT(
                    c.name
                    ORDER BY c.name
                    SEPARATOR ', '
                ) AS categories
            FROM products p

            LEFT JOIN product_categories pc
                ON p.id = pc.product_id

            LEFT JOIN categories c
                ON pc.category_id = c.id

            GROUP BY
                p.id,
                p.name,
                p.slug,
                p.price,
                p.discount_percentage,
                p.stock,
                p.featured,
                p.status

            ORDER BY p.created_at DESC
        `);

        const products = rows.map((product) => ({
            ...product,
            categories: product.categories
                ? product.categories.split(", ")
                : [],
        }));

        return products;
    } catch (error) {
        console.error("Get All Products Error:", error);
        return [];
    } finally {
        if (connection) {
            connection.release();
        }
    }
}


export async function getProductById(id) {
    let connection;

    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(
            `
            SELECT
                id,
                name,
                slug,
                description,
                price,
                discount_percentage,
                stock,
                low_stock_threshold,
                featured,
                display_order,
                status
            FROM products
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (rows.length === 0) {
            return null;
        }

        const product = rows[0];

        const [categories] = await connection.execute(
            `
            SELECT
                c.id,
                c.name
            FROM product_categories pc

            INNER JOIN categories c
                ON pc.category_id = c.id

            WHERE pc.product_id = ?

            ORDER BY c.name ASC
            `,
            [id]
        );

        product.categories = categories;

        return product;

    } catch (error) {
        console.error("Get Product By Id Error:", error);
        return null;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}