// File: pages/api/book-room.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    // Estrai i dati della prenotazione dal corpo della richiesta
    const { checkInDate, checkOutDate, numberOfGuests, roomType } = await req.json();

    // Controlla se i dati richiesti sono presenti
    if (!checkInDate || !checkOutDate || !numberOfGuests || !roomType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Simula una risposta di prenotazione riuscita
    const reservation = {
      id: Date.now(),
      checkInDate,
      checkOutDate,
      numberOfGuests,
      roomType,
      status: "Confirmed"
    };

    // Mostra la prenotazione nel server
    console.log("Prenotazione confermata:", reservation);

    // Invia la risposta
    return NextResponse.json({ message: "Reservation confirmed", reservation }, { status: 200 });
  } catch (error) {
    console.error("Errore nella creazione della prenotazione:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
