// src/app/api/users/list/route.js
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // 1) Eseguo la query
    const result = await sql`
      SELECT
        id,
        name,
        email,
        created_at
      FROM users
      ORDER BY id DESC
    `;
    
    // 2) Estraggo la lista di utenti: se il driver restituisce un object con .rows, lo uso,
    //    altrimenti assumo che result sia già un array di righe
    const users = Array.isArray(result)
      ? result
      : result.rows ?? [];

    // 3) Restituisco JSON con total basato sulla lunghezza dell'array
    return NextResponse.json({
      success: true,
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Errore nel recupero degli utenti:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
