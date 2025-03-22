import { NextResponse } from 'next/server';

const EX_HUMAN_API_KEY = process.env.EX_HUMAN_API_KEY;
const CREATE_BOT_URL = 'https://api.exh.ai/animations/v3/create_bot';
const GENERATE_LIPSYNC_URL = 'https://api.exh.ai/animations/v3/generate_lipsync_from_audio';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const audio = formData.get('audio');

    if (!image || !audio) {
      return NextResponse.json(
        { error: 'Both image and audio files are required' },
        { status: 400 }
      );
    }

    // Step 1: Create idle animation
    const createBotFormData = new FormData();
    createBotFormData.append('image', image);

    const idleResponse = await fetch(CREATE_BOT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EX_HUMAN_API_KEY}`,
      },
      body: createBotFormData
    });

    if (!idleResponse.ok) {
      const error = await idleResponse.json();
      throw new Error(error.message || 'Failed to create idle animation');
    }

    const { idle_url } = await idleResponse.json();

    // Step 2: Generate lip-sync video
    const lipSyncFormData = new FormData();
    lipSyncFormData.append('idle_url', idle_url);
    lipSyncFormData.append('audio_file', audio);

    const lipSyncResponse = await fetch(GENERATE_LIPSYNC_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EX_HUMAN_API_KEY}`,
      },
      body: lipSyncFormData
    });

    if (!lipSyncResponse.ok) {
      const error = await lipSyncResponse.json();
      throw new Error(error.message || 'Failed to generate lip-sync video');
    }

    const result = await lipSyncResponse.json();

    return NextResponse.json({
      success: true,
      video_url: result.video_url
    });

  } catch (error) {
    console.error('Ex-Human API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process animation request' },
      { status: 500 }
    );
  }
}