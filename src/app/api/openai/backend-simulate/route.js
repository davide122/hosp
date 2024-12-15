import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, reservationNumber, reservationDate, roomDetails } = await req.json();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Sfondo per la carta di prenotazione
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 600,
      height: 400,
      color: rgb(0.9, 0.9, 0.9),
    });

    // Titolo
    page.drawText("Conferma Prenotazione", {
      x: 50,
      y: 350,
      size: 24,
      font: timesRomanFont,
      color: rgb(0.2, 0.4, 0.6),
    });

    // Informazioni sul cliente
    page.drawText(`Nome Cliente: ${name}`, {
      x: 50,
      y: 300,
      size: 18,
      font: timesRomanFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Numero di prenotazione
    page.drawText(`Numero Prenotazione: ${reservationNumber}`, {
      x: 50,
      y: 270,
      size: 18,
      font: timesRomanFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Data di prenotazione
    page.drawText(`Data Prenotazione: ${reservationDate}`, {
      x: 50,
      y: 240,
      size: 18,
      font: timesRomanFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Dettagli della stanza
    page.drawText(`Dettagli Stanza: ${roomDetails}`, {
      x: 50,
      y: 210,
      size: 18,
      font: timesRomanFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Footer con messaggio finale
    page.drawText("Grazie per aver prenotato con noi!", {
      x: 50,
      y: 50,
      size: 16,
      font: timesRomanFont,
      color: rgb(0.2, 0.4, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`;

    return NextResponse.json({
      success: true,
      data: {
        pdfLink: pdfDataUrl,
      },
    });
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
    return NextResponse.json({ success: false, error: "Errore durante la generazione del PDF" }, { status: 500 });
  }
}
