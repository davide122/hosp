import validator from 'validator';

export async function POST(req) {
    const { email } = await req.json(); // Parsing del corpo della richiesta
  
    try {
      // Verifica se l'utente esiste già
      const existingUser = await pool.query("SELECT * FROM emailnova WHERE email = $1", [email]);
  
      if (existingUser.rows.length === 0) {
        // Crea un nuovo utente con 5 domande residue
        await pool.query("INSERT INTO emailnova (email, questions_left) VALUES ($1, $2)", [email, 5]);
      }
  
      // Risposta JSON di successo
      return new Response(
        JSON.stringify({ message: "Email registrata con successo" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Errore durante la registrazione:", error);
      return new Response(
        JSON.stringify({ message: "Errore del server" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }