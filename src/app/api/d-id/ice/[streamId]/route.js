import axios from 'axios';

const DID_API_KEY = process.env.DID_API_KEY;
const BASE_URL = 'https://api.d-id.com/talks/streams';

export async function POST(req, { params }) {
  const { streamId } = params;

  try {
    const { candidate, sdpMid, sdpMLineIndex, session_id } = await req.json();

    if (!candidate || !session_id) {
      return new Response(JSON.stringify({ error: "I parametri 'candidate' e 'session_id' sono obbligatori." }), { status: 400 });
    }

    const payload = {
      candidate,
      sdpMid,
      sdpMLineIndex,
      session_id,
    };

    const response = await axios.post(
      `${BASE_URL}/${streamId}/ice`,
      payload,
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