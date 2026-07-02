import pool from "@/lib/db";
import crypto from "crypto";
import transporter from "@/lib/mail";
import { error } from "console";

export async function POST(request) {
    let connection;
    try {
        const body = await request.json();
        const email = body.email?.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex) {
            return Response.json({
                success: false,
                message: "Please provide a valid email"
            }, {
                status: 400,
            })
        }

        connection = await pool.getConnection();

        const [rows] = await connection.execute(
            `SELECT id FROM users WHERE email = ?`, [email]
        );

        if (rows.length === 0) {
            return Response.json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent"
            }, {
                status: 200
            })
        }

        const userId = rows[0].id
        await connection.execute(`DELETE FROM password_reset_tokens WHERE user_id = ?`, [userId])

        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await connection.execute(`INSERT INTO password_reset_tokens (user_id, reset_token, expires_at) VALUES(?, ?, ?)`,
            [userId, resetToken, expiresAt])


        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset Your Password",
            html: `
            <h2>Password Reset</h2>

            <p>You requested to reset your password.</p>

            <p>
                <a href="${resetLink}">
                    Click here to reset your password
                </a>
            </p>

            <p>This link will expire in 15 minutes.</p>

            <p>If you didn't request this, you can safely ignore this email.</p>    `,
        })

        return Response.json(
            {
                success: true,
                message:
                    "If an account with that email exists, a password reset link has been sent.",
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.error(error)
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