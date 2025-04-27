// src/app/api/activities/list/route.js
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // 1) Conteggio totale
    const countRes = await sql`
      SELECT COUNT(*)::text AS total
      FROM activities
    `;
    // countRes è un array di righe, quindi:
    const total = parseInt(countRes[0]?.total ?? "0", 10);

    // 2) Prelevo tutte le attività con l'immagine principale
    const activities = await sql`
      SELECT
        a.*,
        (
          SELECT image_url
          FROM activity_images
          WHERE activity_id = a.id
            AND is_main = true
          LIMIT 1
        ) AS main_image
      FROM activities a
    `;

    return NextResponse.json({ success: true, total, activities });
  } catch (err) {
    console.error("API /api/activities/list error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
