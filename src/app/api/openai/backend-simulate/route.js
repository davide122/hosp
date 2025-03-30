import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Body completo ricevuto dal backend:", JSON.stringify(body));

    const { functionName, ...args } = body; // Estrai functionName e gli argomenti

    let query = args.query; // Estrai la query, se presente

    // Gestisci il formato errato (ricostruisci la stringa)
    if (!query && Object.keys(args).some(key => !isNaN(parseInt(key)))) {
      const chars = [];
      for (let i = 0; i < Object.keys(args).length; i++) {
        if (args[i] !== undefined) {
          chars.push(args[i]);
        }
      }
      const reconstructedString = chars.join('');
      console.log("Stringa ricostruita:", reconstructedString);

      try {
        const parsed = JSON.parse(reconstructedString);
        query = parsed.query;
        console.log("Query estratta dalla stringa ricostruita:", query);
      } catch (e) {
        console.error("Errore nel parsing della stringa ricostruita:", e);
      }
    }

    switch (functionName) {
      case 'open_activity_card': {
        if (!query) {
          return NextResponse.json({
            success: false,
            error: 'Query mancante o non valida'
          }, { status: 400 });
        }

        console.log("Cercando attività con query:", query);

        const [activity] = await sql`
          SELECT a.*,
                  json_agg(ai.image_url) AS images
          FROM activities a
          LEFT JOIN activity_images ai ON a.id = ai.activity_id
          WHERE a.name ILIKE ${'%' + query + '%'}
          GROUP BY a.id
        `;

        if (!activity) {
          return NextResponse.json({
            success: false,
            error: 'Attività non trovata'
          }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: activity });
      }
      // Aggiungi altri casi per altre funzioni
      case 'create_map': {
        // Implementa la logica per create_activity qui
        // Puoi importare funzioni da file separati se necessario
        return NextResponse.json({ success: false, error: 'Funzione create_map non implementata' }, { status: 501 });
      }
      default:
        return NextResponse.json({
          success: false,
          error: 'Funzione non supportata'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Errore nel backend:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore nel backend',
      details: error.message
    }, { status: 500 });
  }
}