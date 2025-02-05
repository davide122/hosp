// app/api/conversations/route.js

import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(request) {
  try {
    // Leggiamo il corpo della richiesta in formato JSON
    const body = await request.json();
    const { threadId, messages, selectedImage, selectedVoice } = body;

    // Validazione minima: threadId e messages sono obbligatori
    if (!threadId || !messages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Inseriamo la conversazione nel database.
    // Notare che usiamo JSON.stringify per salvare i messaggi come stringa JSON.
    const result = await sql`
      INSERT INTO conversations (thread_id, messages, selected_image, selected_voice, created_at)
      VALUES (${threadId}, ${JSON.stringify(messages)}, ${selectedImage}, ${selectedVoice}, NOW())
      RETURNING id
    `;

    // Se tutto va bene, rispondiamo con lo stato 201 e l'ID della conversazione appena creata
    return NextResponse.json(
      { success: true, conversationId: result[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving conversation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
