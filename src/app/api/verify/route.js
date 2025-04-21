import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ verified: false });

  const rows = await sql`
    UPDATE emailnova
    SET is_verified = true
    WHERE token = ${token} AND is_verified = false
    RETURNING email
  `;

  if (rows.length === 0) {
    return NextResponse.json({ verified: false });
  }

  return NextResponse.json({ verified: true, email: rows[0].email });
}
