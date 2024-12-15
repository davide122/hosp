import { NextResponse } from 'next/server';
import axios from 'axios';

const DID_API_KEY = process.env.DID_API_KEY;
const BASE_URL = 'https://api.d-id.com/talks/streams';

const getAuthorizationHeader = () => `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`;

export async function POST(req, { params }) {
  const { streamId } = params;
  try {
    const { candidate, sdpMid, sdpMLineIndex, session_id } = await req.json();
    const response = await axios.post(
      `${BASE_URL}/${streamId}/ice`,
      { candidate, sdpMid, sdpMLineIndex, session_id },
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
