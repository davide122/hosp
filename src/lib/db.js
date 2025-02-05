import { neon } from '@neondatabase/serverless';

// Inizializza la connessione
const sql = neon(process.env.DATABASE_URL);

export default sql;
