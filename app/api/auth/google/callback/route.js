import pool from "@/lib/db";
import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return NextResponse.json(
            {
                success: false,
                message: "Authorization code not found",
            },
            {
                status: 400,
            }
        );
    }

    const tokenResponse = await fetch(
        "https://oauth2.googleapis.com/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        }
    );

    const tokenData = await tokenResponse.json();
    const profileResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        },
    );



    const profile = await profileResponse.json();

    let connection;

    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(
            `
            SELECT id, auth_provider
            FROM users
            WHERE email = ?
            `,
            [profile.email]
        );


        await connection.beginTransaction();

        let userId;

        if (rows.length === 0) {
            const [result] = await connection.execute(
                ` INSERT INTO users (email, password, auth_provider) VALUES (?, ?, ?)`,
                [profile.email, null, "google"]
            );
            userId = result.insertId;
        } else {
            userId = rows[0].id;

            if (rows[0].auth_provider === "email") {
                await connection.execute(
                    `UPDATE users SET auth_provider = ? WHERE id = ?`,
                    ["both", userId]
                );
            }
        }

        await createSession(connection, userId);
        await connection.commit();

        return NextResponse.redirect(new URL("/", request.url));

    } catch (error) {
        console.error(error);
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }
        return NextResponse.json(
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