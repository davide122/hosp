import { NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_KEY;
const EX_HUMAN_API_KEY = process.env.EX_HUMAN_API_KEY;

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const CREATE_BOT_URL = 'https://api.exh.ai/animations/v3/create_bot';
const GENERATE_LIPSYNC_URL = 'https://api.exh.ai/animations/v3/generate_lipsync_from_audio';

export async function POST(request) {
  try {
    const { text, voiceStyle, behaviorMode, selectedVoice, image } = await request.json();

    // Step 1: Generate speech using ElevenLabs
    const voiceSettings = {
      stability: voiceStyle === 'Professionale' ? 0.7 : voiceStyle === 'Amichevole' ? 0.5 : 0.3,
      similarity_boost: behaviorMode === 'Interattivo' ? 0.4 : 0.2,
      latency_optimization: 4,
    };

    const speechResponse = await fetch(`${ELEVENLABS_API_URL}/${selectedVoice}/stream`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings,
      }),
    });

    if (!speechResponse.ok) {
      throw new Error('Failed to generate speech');
    }

    // Convert audio stream to buffer
    const reader = speechResponse.body.getReader();
    const audioChunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      audioChunks.push(value);
    }
    const audioBuffer = Buffer.concat(audioChunks);

    // Step 2: Create idle animation using Ex-Human
    const createBotFormData = new FormData();
    createBotFormData.append('image', new Blob([Buffer.from(image, 'base64')], { type: 'image/jpeg' }));

    const idleResponse = await fetch(CREATE_BOT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EX_HUMAN_API_KEY}`,
      },
      body: createBotFormData
    });

    if (!idleResponse.ok) {
      throw new Error('Failed to create idle animation');
    }

    const { idle_url } = await idleResponse.json();

    // Step 3: Generate lip-sync video
    const lipSyncFormData = new FormData();
    lipSyncFormData.append('idle_url', idle_url);
    lipSyncFormData.append('audio_file', new Blob([audioBuffer], { type: 'audio/mpeg' }));

    const lipSyncResponse = await fetch(GENERATE_LIPSYNC_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EX_HUMAN_API_KEY}`,
      },
      body: lipSyncFormData
    });

    if (!lipSyncResponse.ok) {
      throw new Error('Failed to generate lip-sync video');
    }

    const result = await lipSyncResponse.json();

    return NextResponse.json({
      success: true,
      video_url: result.video_url,
      audio: audioBuffer.toString('base64')
    });

  } catch (error) {
    console.error('Avatar Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate avatar video' },
      { status: 500 }
    );
  }
}