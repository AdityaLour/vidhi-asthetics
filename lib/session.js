import crypto from "crypto";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function createSession(connection, userId) {
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    await connection.execute(
        `
    INSERT INTO sessions (user_id, session_token, expires_at)
    VALUES (?, ?, ?)
    `,
        [userId, sessionToken, expiresAt]
    );

    const cookieStore = await cookies();

    cookieStore.set({
        name: "session",
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
    });
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;


    if (!sessionToken) {
        return null;
    }

    let connection;

    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(
            `SELECT users.id, users.email, users.role, users.auth_provider
            FROM sessions
            INNER JOIN users
                ON sessions.user_id = users.id
            WHERE sessions.session_token = ?
            AND sessions.expires_at > NOW() `, [sessionToken]
        );

        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    } catch (error) {

        console.error("Get Current User Error:", error);
        return null;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

export async function requireAdmin() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    if (user.role !== "admin") {
        return null
    }

    return user;
}