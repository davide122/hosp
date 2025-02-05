import { NextResponse } from "next/server";
import sql from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Schema di validazione con Zod
const registerSchema = z.object({
    name: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
    email: z.string().email("Email non valida"),
    password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

export async function POST(req) {
    try {
        console.log("🔵 Richiesta ricevuta per la registrazione");

        const body = await req.json();
        const { name, email, password } = body;

        // Validazione input
        const validation = registerSchema.safeParse({ name, email, password });
        if (!validation.success) {
            console.error("🔴 Errore di validazione:", validation.error.format());
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        console.log("🟢 Validazione OK, controllo se l'utente esiste...");

        // Controlla se l'utente esiste già
        const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (existingUser.length > 0) {
            console.error("🔴 Email già registrata.");
            return NextResponse.json({ error: "L'email è già in uso" }, { status: 400 });
        }

        console.log("🟢 Utente non esiste, hashing della password...");

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("🟢 Password hashata, inserimento nel database...");

        // Inserimento nel database
        await sql`
            INSERT INTO users (name, email, password)
            VALUES (${name}, ${email}, ${hashedPassword})
        `;

        console.log("✅ Registrazione completata con successo!");

        return NextResponse.json({ message: "Registrazione avvenuta con successo!" }, { status: 201 });
    } catch (error) {
        console.error("❌ Errore nella registrazione:", error);
        return NextResponse.json({ error: "Errore del server" }, { status: 500 });
    }
}
