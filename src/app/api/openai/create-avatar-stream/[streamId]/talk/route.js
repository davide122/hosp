import { NextResponse } from 'next/server';
import axios from 'axios';

const DID_API_KEY = process.env.DID_API_KEY;
const BASE_URL = 'https://api.d-id.com/talks/streams';

const getAuthorizationHeader = () => `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`;

export async function POST(req, { params }) {
  const { streamId } = params;
  try {
    const { session_id, inputText, voiceId, language } = await req.json();
    const response = await axios.post(
      `${BASE_URL}/${streamId}`,
      {
        session_id,
        script: {
          type: "text",
          input: inputText,
          provider: { type: "elevenlabs", voice_id: voiceId || "default", lang: language || "it" }
        }
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
