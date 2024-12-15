import { NextResponse } from 'next/server';
import axios from 'axios';

const DID_API_KEY = process.env.DID_API_KEY;
const BASE_URL = 'https://api.d-id.com/talks/streams';

const getAuthorizationHeader = () => `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`;

export async function POST(req, { params }) {
  const { streamId } = params;

  try {
    const { session_id, script } = await req.json(); // session_id e script (configurazione) provengono dal frontend

    // Esegui la richiesta a D-ID per avviare lo streaming video
    const response = await axios.post(
      `${BASE_URL}/${streamId}`,
      {
        session_id,
        script,
      },
      {
        headers: {
          Authorization: getAuthorizationHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Errore durante l'avvio dello streaming:", error.response?.data || error.message);
    return NextResponse.json({ error: error.message || 'Errore generico' }, { status: 500 });
  }
}
