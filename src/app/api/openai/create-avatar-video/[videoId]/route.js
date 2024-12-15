// /pages/api/openai/check-video-status/[videoId].js

import { NextResponse } from 'next/server';
import axios from 'axios';

const DID_API_KEY = process.env.DID_API_KEY;
const BASE_URL = 'https://api.d-id.com/talks';

export async function GET(req, { params }) {
  const { videoId } = params;
  const encodedCredentials = `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`;

  try {
    const response = await axios.get(`${BASE_URL}/${videoId}`, {
      headers: {
        Authorization: encodedCredentials,
        Accept: 'application/json',
      },
    });

    if (response.data.status === "done") {
      return NextResponse.json({ videoUrl: response.data.result_url }, { status: 200 });
    }
    return NextResponse.json({ videoUrl: null }, { status: 200 });
  } catch (error) {
    console.error("Errore nel controllo dello stato del video:", error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data || error.message }, { status: 500 });
  }
}
