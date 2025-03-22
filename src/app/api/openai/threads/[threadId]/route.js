// /app/api/threads/[threadId]/route.js
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  const { threadId } = params;

  if (!threadId) {
    return NextResponse.json(
      { error: "ID del thread non fornito" },
      { status: 400 }
    );
  }

  // Poiché il thread è gestito sul client (in sessionStorage),
  // qui simula semplicemente l'eliminazione.
  return NextResponse.json(
    { id: threadId, object: "thread.deleted", deleted: true },
    { status: 200 }
  );
}
