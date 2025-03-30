import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL);

export default async function openActivityCard(args) {
  try {
    const { query } = args;

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query mancante' }, { status: 400 });
    }

    const [activity] = await sql`
      SELECT a.*,
              json_agg(ai.image_url) AS images
      FROM activities a
      LEFT JOIN activity_images ai ON a.id = ai.activity_id
      WHERE a.name ILIKE ${'%' + query + '%'}
      GROUP BY a.id
    `;

    if (!activity) {
      return NextResponse.json({ success: false, error: 'Attività non trovata' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error('Errore in openActivityCard:', error);
    return NextResponse.json({ success: false, error: 'Errore nel database', details: error.message }, { status: 500 });
  }
}