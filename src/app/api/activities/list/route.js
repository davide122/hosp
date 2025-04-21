import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// Inizializza la connessione al database
const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Query per ottenere tutte le attività con le relative immagini principali
    const { rows } = await sql`
      SELECT a.*, 
             (SELECT image_url FROM activity_images 
              WHERE activity_id = a.id AND is_main = true 
              LIMIT 1) as main_image
      FROM activities a
      ORDER BY a.id DESC
    `;

    return NextResponse.json({ success: true, activities: rows });
  } catch (error) {
    console.error('Errore nel recupero delle attività:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}