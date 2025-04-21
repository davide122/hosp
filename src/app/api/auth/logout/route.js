import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  try {
    // Crea un cookie con lo stesso nome ma con valore vuoto e scadenza immediata
    const cookie = serialize("authToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0), // Data nel passato per far scadere immediatamente il cookie
    });

    return new NextResponse(
      JSON.stringify({ message: "Logout effettuato con successo" }),
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );
  } catch (error) {
    console.error("Errore durante il logout:", error);
    return NextResponse.json({ error: "Errore del server" }, { status: 500 });
  }
}