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
        console.log(body)

        connection = await pool.getConnection();


        return Response.json({
            success: true,
            message: "Close to complete"
        }, {
            status: 200,
        })
    } catch (error) {
        console.log(error);
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