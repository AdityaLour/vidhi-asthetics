import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.execute("SELECT 1");

    return Response.json({
      success: true,
      message: "Database connected",
      rows,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
