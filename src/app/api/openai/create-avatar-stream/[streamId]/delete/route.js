import { NextResponse } from 'next/server';
import axios from 'axios';

const DID_API_KEY = process.env.DID_API_KEY;
const BASE_URL = 'https://api.d-id.com/talks/streams';

const getAuthorizationHeader = () => `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`;

export async function DELETE(req, { params }) {
  const { streamId } = params;
  try {
    const { session_id } = await req.json();
    const response = await axios.delete(
      `${BASE_URL}/${streamId}`,
      {
        headers: {
          Authorization: getAuthorizationHeader(),
          'Content-Type': 'application/json',
        },
        data: { session_id },
      }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
