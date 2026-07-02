import pool from "@/lib/db";
import { cookies } from "next/headers";

export async function POST() {
    let connection;
    try {
        connection = await pool.getConnection();

        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session")?.value;

        if (!sessionToken) {
            return Response.json(
                {
                    success: false,
                    message: "Not logged in"
                }, {
                status: 401
            }
            )
        }

        await connection.execute(
            `DELETE FROM sessions
             WHERE session_token = ?`, [sessionToken]
        )

        cookieStore.delete("session")

        return Response.json({
            success: true,
            message: "Logged out Successfully",

        }, {
            status: 200,
        })
    } catch (error) {
        console.error(error);
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        })
    } finally {
        if (connection) {
            connection.release();
        }
    }
}