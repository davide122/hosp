import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Ottieni il cookie di autenticazione
    const cookieStore = cookies();
    const authToken = cookieStore.get("authToken");

    if (!authToken) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Verifica il token JWT
    try {
      const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
      return NextResponse.json({ authenticated: true, user: { id: decoded.id, email: decoded.email } });
    } catch (error) {
      console.error("Errore nella verifica del token:", error);
      return NextResponse.json({ error: "Token non valido" }, { status: 401 });
    }
  } catch (error) {
    console.error("Errore nel controllo dell'autenticazione:", error);
    return NextResponse.json({ error: "Errore del server" }, { status: 500 });
  }
}