import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Body completo ricevuto dal backend:", JSON.stringify(body));
    
    const { functionName } = body;
    // Estrai la query in modo più flessibile
    let query = body.query;
    
    // Se la query non esiste ma ci sono caratteri numerici come chiavi
    if (!query && Object.keys(body).some(key => !isNaN(parseInt(key)))) {
      // Ricostruiamo la stringa originale
      const chars = [];
      for (let i = 0; i < Object.keys(body).length; i++) {
        if (body[i] !== undefined) {
          chars.push(body[i]);
        }
      }
      
      // Tentiamo di parsare la stringa ricostruita
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
    
    if (functionName === 'open_activity_card') {
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
    
    return NextResponse.json({ 
      success: false, 
      error: 'Funzione non supportata' 
    }, { status: 400 });
  } catch (error) {
    console.error('Errore nel backend:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore nel backend', 
      details: error.message 
    }, { status: 500 });
  }
}