import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
    let connection;
    try {
        const body = await request.json();
        const { token, password, confirmPassword } = body;

        if (!token || !password || !confirmPassword) {
            return Response.json(
                {
                    success: false,
                    message: "All fields are required.",
                },
                {
                    status: 400,
                }
            );

        }

        if (password.lenth < 6) {
            return Response.json({
                success: false,
                message: "Password must be atleast 6 characters long"
            }, {
                status: 400
            })
        }

        if (password !== confirmPassword) {
            return Response.json({
                success: false,
                message: "Passwords do not match"
            })
        }

        connection = await pool.getConnection()

        const [rows] = await connection.execute(
            `SELECT user_id, expires_at FROM password_reset_tokens where reset_token = ?`, [token]
        )

        if (rows.length === 0) {
            return Response.json({
                success: false,
                message: "Invalid or expired reset link"
            }, {
                status: 400
            })
        }

        const resetData = rows[0]

        if (new Date(resetData.expires_at) < new Date()) {
            return Response.json(
                {
                    success: false,
                    message: "Reset link has expired.",
                },
                {
                    status: 400,
                }
            );
        }


        const user_id = resetData.user_id

        const hashedPassword = await bcrypt.hash(password, 12)

        await connection.execute(
            `UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, user_id]
        )

        await connection.execute(
            `DELETE FROM password_reset_tokens WHERE user_id = ?`,
            [user_id]
        );

        await connection.execute(
            `DELETE FROM sessions WHERE user_id = ?`,
            [user_id]
        );

        return Response.json(
            {
                success: true,
                message: "Password reset successfully.",
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