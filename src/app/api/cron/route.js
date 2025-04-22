import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import nodemailer from "nodemailer";
import { templates } from "../../../lib/emailTemplates";

const sql = neon(process.env.DATABASE_URL);

// Funzione per inviare le email programmate
async function sendDripEmails() {
  // Configurazione del trasporto email
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let emailsInviate = 0;
  let errori = [];

  for (const tpl of templates) {
    try {
      // Calcola l'intervallo in giorni (una settimana = 7 giorni)
      const giorniPassati = tpl.week * 7;
      
      // Seleziona gli utenti che si sono registrati esattamente giorniPassati fa
      // e che non hanno ancora ricevuto questa email della sequenza
      const users = await sql`
        SELECT email
        FROM emailnova e
        WHERE e.is_verified = true
          AND e.registered_at <= NOW() - INTERVAL '${giorniPassati} days'
          AND e.registered_at > NOW() - INTERVAL '${giorniPassati + 1} days'
          AND NOT EXISTS (
            SELECT 1
            FROM email_sequence_sent s
            WHERE s.email = e.email
              AND s.week = ${tpl.week}
          )
      `;

      // Invia email a ciascun utente trovato
      for (const { email } of users) {
        await transporter.sendMail({
          from: `"BotIA Team" <${process.env.SMTP_USER}>`,
          to: email,
          subject: tpl.subject,
          html: tpl.html,
        });

        // Registra l'invio nel database
        await sql`
          INSERT INTO email_sequence_sent (email, week, sent_at)
          VALUES (${email}, ${tpl.week}, NOW())
        `;

        emailsInviate++;
      }
    } catch (error) {
      console.error(`Errore nell'invio email week ${tpl.week}:`, error);
      errori.push(`Week ${tpl.week}: ${error.message}`);
    }
  }

  return { emailsInviate, errori };
}

// Endpoint API per il cron job di Vercel
export async function GET(request) {
  // Verifica l'autorizzazione (opzionale, puoi implementare un sistema di sicurezza)
  const { searchParams } = new URL(request.url);
  const authToken = searchParams.get("cron_secret");
  
  // Se vuoi proteggere l'endpoint, verifica il token
  if (process.env.CRON_SECRET && authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    // Esegui l'invio delle email programmate
    const risultato = await sendDripEmails();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...risultato
    });
  } catch (error) {
    console.error("Errore nell'esecuzione del cron job:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}