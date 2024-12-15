import axios from 'axios';

const DID_API_KEY = process.env.DID_API_KEY;
const BASE_URL = 'https://api.d-id.com/talks/streams';

export async function POST(req) {
  try {
    const { sourceUrl } = await req.json();

    if (!sourceUrl) {
      return new Response(JSON.stringify({ error: "Il parametro 'sourceUrl' è obbligatorio." }), { status: 400 });
    }

    const response = await axios.post(
      BASE_URL,
      {
        source_url: sourceUrl,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${DID_API_KEY}:`).toString('base64')}`,
          'Content-Type': 'application/json',
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


