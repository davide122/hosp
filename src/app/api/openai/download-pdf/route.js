import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get('file');

  const pdfPath = path.join('/tmp', file);

  // Verifica che il file esista
  if (!fs.existsSync(pdfPath)) {
    return NextResponse.json({ error: 'File non trovato' }, { status: 404 });
  }

  // Restituisce il PDF come file scaricabile
  const fileStream = fs.createReadStream(pdfPath);
  return new Response(fileStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${file}"`,
    },
  });
}
