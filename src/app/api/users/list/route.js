import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// Inizializza la connessione al database
const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Query per ottenere tutti gli utenti
    const { rows } = await sql`
      SELECT id, name, email, created_at
      FROM users
      ORDER BY id DESC
    `;

    return NextResponse.json({ success: true, users: rows });
  } catch (error) {
    console.error('Errore nel recupero degli utenti:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}