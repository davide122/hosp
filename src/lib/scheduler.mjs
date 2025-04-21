import cron from "node-cron";
import nodemailer from "nodemailer";
import { neon } from "@neondatabase/serverless";
import { templates } from "./emailTemplates";

const sql = neon(process.env.DATABASE_URL);

// In dev puoi switchare su Ethereal o MailHog, qui di esempio il prod‑SMTP:
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendDripEmails() {
  const now = new Date();

  for (const tpl of templates) {
    // calcola l’intervallo in secondi
    const minAgo = tpl.delayMinutes * 60;
    const maxAgo = (tpl.delayMinutes + 1) * 60;

    // seleziona chi si è registrato esattamente tra minAgo e maxAgo secondi fa
    const users = await sql`
      SELECT email
      FROM emailnova e
      WHERE extract(epoch FROM now() - e.registered_at) >= ${minAgo}
        AND extract(epoch FROM now() - e.registered_at) < ${maxAgo}
        AND NOT EXISTS (
          SELECT 1
          FROM email_sequence_sent s
          WHERE s.email = e.email
            AND s.week = ${tpl.week}
        )
    `;

    for (const { email } of users) {
      const info = await transporter.sendMail({
        from: `"BotIA Team" <${process.env.SMTP_USER}>`,
        to: email,
        subject: tpl.subject,
        html: tpl.html,
      });
      console.log(`Mail week${tpl.week} inviata a ${email}`);

      await sql`
        INSERT INTO email_sequence_sent (email, week, sent_at)
        VALUES (${email}, ${tpl.week}, NOW())
      `;
    }
  }
}

// Cron ogni 2 minuti
cron.schedule("*/2 * * * *", () => {
  console.log("🔄 Check drip‑campaign alle", new Date().toISOString());
  sendDripEmails().catch(console.error);
});

// Esporta per eventuali test manuali
export { sendDripEmails };
