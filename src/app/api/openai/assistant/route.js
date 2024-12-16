import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

// Configurazione OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // Inserisci la tua API Key
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { hotelName, hotelAddress, partnerships, description, voiceStyle, behaviorMode } = body;

    // Validazione dei dati
    if (!hotelName || !hotelAddress || !description) {
      return new Response(JSON.stringify({ error: "Dati mancanti" }), { status: 400 });
    }

    // Prompt personalizzato
    const prompt = `
Sei un assistente virtuale per un hotel chiamato "${hotelName}" situato a "${hotelAddress}".
Descrizione dell'hotel: ${description}.
Tono di voce: ${voiceStyle}.
Modalità di comportamento: ${behaviorMode}.
Partnerships: ${partnerships || "Nessuna"}.
Rispondi in modo professionale, utile e amichevole.
`;

    // Richiesta ad OpenAI per generare l'assistente
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    // Genera un ID univoco per l'assistente
    const assistantId = uuidv4();

    // Dati da salvare o restituire
    const assistantData = {
      id: assistantId,
      hotelName,
      hotelAddress,
      partnerships,
      description,
      voiceStyle,
      behaviorMode,
    };

    return new Response(JSON.stringify({ id: assistantId, assistantData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Errore durante la creazione dell'assistente:", error);
    return new Response(JSON.stringify({ error: "Errore interno del server" }), { status: 500 });
  }
}