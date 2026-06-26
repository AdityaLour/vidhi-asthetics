import crypto from "crypto";
import { cookies } from "next/headers";

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