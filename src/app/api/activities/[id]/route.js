import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// Inizializza la connessione al database
const sql = neon(process.env.DATABASE_URL);

// Ottieni una singola attività con le sue immagini
export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    // Query per ottenere l'attività
    const activity = await sql`
      SELECT a.*
      FROM activities a
      WHERE a.id = ${id}
    `;
    
    if (!activity || activity.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Attività non trovata' },
        { status: 404 }
      );
    }
    
    // Query per ottenere le immagini dell'attività
    const images = await sql`
      SELECT * FROM activity_images
      WHERE activity_id = ${id}
      ORDER BY is_main DESC
    `;
    
    return NextResponse.json({ 
      success: true, 
      activity: activity[0],
      images: images || []
    });
  } catch (error) {
    console.error('Errore nel recupero dell\'attività:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Aggiorna un'attività esistente
export async function PUT(req, { params }) {
  try {
    const { id } = params;
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
      images
    } = await req.json();
    
    // Verifica se l'attività esiste
    const existingActivity = await sql`SELECT id FROM activities WHERE id = ${id}`;
    if (!existingActivity || existingActivity.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Attività non trovata' },
        { status: 404 }
      );
    }
    
    // Aggiorna l'attività
    await sql`
      UPDATE activities
      SET name = ${name},
          email = ${email},
          menu = ${menu},
          prices = ${prices},
          address = ${address},
          phone_number = ${phone_number},
          website = ${website},
          description = ${description},
          category = ${category}
      WHERE id = ${id}
    `;
    
    // Gestisci le immagini se fornite
    if (images && Array.isArray(images)) {
      // Prima elimina tutte le immagini esistenti
      await sql`DELETE FROM activity_images WHERE activity_id = ${id}`;
      
      // Poi inserisci le nuove immagini
      for (const img of images) {
        const { image_url, description: imgDescription, is_main } = img;
        await sql`
          INSERT INTO activity_images (activity_id, image_url, description, is_main)
          VALUES (${id}, ${image_url}, ${imgDescription ?? null}, ${is_main ?? false})
        `;
      }
    }
    
    return NextResponse.json({ success: true, message: 'Attività aggiornata con successo' });
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'attività:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Elimina un'attività
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    // Verifica se l'attività esiste
    const existingActivity = await sql`SELECT id FROM activities WHERE id = ${id}`;
    if (!existingActivity || existingActivity.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Attività non trovata' },
        { status: 404 }
      );
    }
    
    // Elimina prima le immagini associate (per mantenere l'integrità referenziale)
    await sql`DELETE FROM activity_images WHERE activity_id = ${id}`;
    
    // Poi elimina l'attività
    await sql`DELETE FROM activities WHERE id = ${id}`;
    
    return NextResponse.json({ success: true, message: 'Attività eliminata con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'attività:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}