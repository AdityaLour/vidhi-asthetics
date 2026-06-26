import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

export async function POST(request) {
  const body = await request.json();
  let connection;

  try {
    const cleanEmail = body.email?.trim();
    const cleanPass = body.password?.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      return Response.json(
        {
          success: false,
          message: "Email is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!cleanPass) {
      return Response.json(
        {
          success: false,
          message: "Password is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!emailRegex.test(cleanEmail)) {
      return Response.json(
        {
          success: false,
          message: "Please enter a valid email",
        },
        {
          status: 400,
        },
      );
    }

    if (cleanPass.length < 6) {
      return Response.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        {
          status: 400,
        },
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [cleanEmail],
    );

    if (rows.length > 0) {
      await connection.rollback();

      return Response.json(
        {
          success: false,
          message: "Email already exists",
        },
        {
          status: 409,
        },
      );
    }

    const hashedPassword = await bcrypt.hash(cleanPass, 12);

    const [result] = await connection.execute(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [cleanEmail, hashedPassword],
    );

    await createSession(connection, result.insertId);

    await connection.commit();

    return Response.json(
      {
        success: true,
        message: "Signup successful",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    return Response.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
