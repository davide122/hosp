import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// Inizializza la connessione al database
const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    // Estrae i dati dal body della richiesta
    const {
      name,
      email,
      menu,
      prices,
      address,
      phone_number,
      website,
      description,
      category,
      // images è un array opzionale di oggetti contenenti: image_url, description e is_main
      images
    } = await req.json();

    // Inserimento nella tabella activities
    const result = await sql`
      INSERT INTO activities (name, email, menu, prices, address, phone_number, website, description, category)
      VALUES (${name}, ${email}, ${menu}, ${prices}, ${address}, ${phone_number}, ${website}, ${description}, ${category})
      RETURNING id
    `;
    const activityId = result[0].id;

    // Se vengono fornite immagini, inseriscile nella tabella activity_images
    if (images && Array.isArray(images)) {
      // Puoi anche usare una transazione per raggruppare le inserzioni
      for (const img of images) {
        const { image_url, description: imgDescription, is_main } = img;
        await sql`
          INSERT INTO activity_images (activity_id, image_url, description, is_main)
          VALUES (${activityId}, ${image_url}, ${imgDescription ?? null}, ${is_main ?? false})
        `;
      }
    }

    return NextResponse.json({ success: true, activityId });
  } catch (error) {
    console.error('Errore nell’inserimento:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
