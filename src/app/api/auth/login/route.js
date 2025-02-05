import { NextResponse } from "next/server";
import sql from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { z } from "zod";

// Schema di validazione con Zod
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

export async function POST(req) {
    try {
        console.log("🔵 Richiesta ricevuta per il login");

        const body = await req.json();
        const { email, password } = body;

        // Validazione input
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
            console.error("🔴 Errore di validazione:", validation.error.format());
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        console.log("🟢 Validazione OK, controllo utente nel database...");

        // Controlla se l'utente esiste
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        console.log("🔵 Risultato query utenti:", user);

        if (!user || user.length === 0) {
            console.error("🔴 Nessun utente trovato con questa email.");
            return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
        }

        // Verifica la password
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            console.error("🔴 Password errata.");
            return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
        }

        console.log("🟢 Password corretta, generazione token JWT...");

        // Genera il token JWT
        if (!process.env.JWT_SECRET) {
            console.error("🔴 ERRORE: `JWT_SECRET` non è definito nelle variabili di ambiente!");
            return NextResponse.json({ error: "Errore di configurazione server" }, { status: 500 });
        }

        const token = jwt.sign(
            { id: user[0].id, email: user[0].email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        console.log("🟢 Token JWT generato correttamente.");

        // Imposta il cookie HTTP-only
        const cookie = serialize("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        console.log("🟢 Login completato, invio la risposta.");

        return new NextResponse(
            JSON.stringify({ message: "Login riuscito!" }),
            {
                status: 200,
                headers: { "Set-Cookie": cookie },
            }
        );
    } catch (error) {
        console.error("❌ Errore nel login:", error);
        return NextResponse.json({ error: "Errore del server" }, { status: 500 });
    }
}
