import pool from "@/lib/db";

export async function getAllProducts() {
    let connection;

    try {
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
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    AND pi.is_primary = 1
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

        const [images] = await connection.execute(
            `
            SELECT
                id,
                image_url,
                storage_key,
                file_name,
                is_primary,
                display_order
            FROM product_images
            WHERE product_id = ?
            ORDER BY display_order ASC
            `,
            [id]
        );

        product.images = images;

        product.primary_image =
            images.find(image => image.is_primary)?.image_url || null;

        return product;

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