// src/app/api/emails/list/route.js
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function GET() {
  try {
    // 1) Prelevo tutte le email ordinate per ID decrescente
    const emails = await sql`
      SELECT
        id,
        email,
        questions_left,
        created_at,
        token,
        is_verified,
        registered_at,
        language
      FROM emailnova
      ORDER BY id DESC
    `
    // 2) Costruisco la risposta
    return NextResponse.json({
      success: true,
      emails,                 // array di oggetti { id, email, ... }
      total: emails.length    // numero totale
    })
  } catch (err) {
    console.error('API /api/emails/list error:', err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
