import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

export async function POST(request) {
  let connection;

  try {
    const body = await request.json();

    const cleanEmail = body.email?.trim();
    const cleanPass = body.password?.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return Response.json(
        {
          success: false,
          message: "Please provide a valid email",
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
          message: "Please enter the password",
        },
        {
          status: 400,
        },
      );
    }

    connection = await pool.getConnection();

    const [rows] = await connection.execute(
      `
      SELECT id, password, role
      FROM users
      WHERE email = ?
  `,
      [cleanEmail],
    );

    if (rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        {
          status: 401,
        },
      );
    }

    const user = rows[0];

    const isPasswordCorrect = await bcrypt.compare(
      cleanPass,
      user.password,
    );

    if (!isPasswordCorrect) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        {
          status: 401,
        },
      );
    }


    await connection.beginTransaction();

    await createSession(connection, user.id);

    await connection.commit();
    return Response.json(
      {
        success: true,
        message: "Login successful",
        role: user.role,

      },
      {
        status: 200,
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
