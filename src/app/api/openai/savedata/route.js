import { NextResponse } from 'next/server';

export async function POST(req) {
    if (req.method !== 'POST') {
        // Restituisce un errore se il metodo non è POST
        return new NextResponse(null, { status: 405 });
    }

    try {
        const { domanda } = await req.json();  // Estrae la domanda dal corpo della richiesta

        if (!domanda) {
            // Restituisce un errore se la domanda è vuota
            return new NextResponse(JSON.stringify({ message: 'La domanda è obbligatoria' }), { status: 400 });
        }

        // Inserisci la domanda nella tabella del database
        const queryText = 'INSERT INTO domande_utenti (domanda) VALUES ($1) RETURNING *';
        const queryParams = [domanda];
        const { rows } = await pool.query(queryText, queryParams);

        // Restituisce la domanda inserita
        return new NextResponse(JSON.stringify(rows[0]), { status: 201 });

    } catch (error) {
        // Log dell'errore e restituzione di un Internal Server Error
        console.error('Errore durante l’operazione sul database:', error);
        return new NextResponse(JSON.stringify({ message: 'Errore interno del server', error: error.message }), { status: 500 });
    }
}