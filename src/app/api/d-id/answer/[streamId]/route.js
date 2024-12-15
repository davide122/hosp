import axios from 'axios';

const DID_API_KEY = process.env.DID_API_KEY;
const BASE_URL = 'https://api.d-id.com/talks/streams';

export async function POST(req, { params }) {
  try {
    const streamId = params.streamId;
    const { answer, session_id } = await req.json();

    if (!streamId || !answer || !session_id) {
      return new Response(JSON.stringify({ error: "Parametri mancanti." }), { status: 400 });
    }

    const response = await axios.post(
      `https://api.d-id.com/talks/streams/${streamId}/sdp`,
      { answer },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${DID_API_KEY}:`).toString('base64')}`,
          'Content-Type': 'application/json',
          Cookie: session_id, // Includi il session_id nei cookie della richiesta
        },
      }
    );

    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.response?.data || 'Errore interno del server' }),
      { status: 500 }
    );
  }
}