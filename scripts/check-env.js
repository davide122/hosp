#!/usr/bin/env node

/**
 * Script per verificare le variabili d'ambiente necessarie
 * 
 * Esegui questo script prima del deploy per assicurarti che tutte le
 * variabili d'ambiente necessarie siano configurate.
 */

require('dotenv').config();

// Colori per output console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[ATTENZIONE]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERRORE]${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.magenta}=== ${msg} ===${colors.reset}`)
};

// Variabili d'ambiente richieste
const requiredEnvVars = [
  'DATABASE_URL',
  'SMTP_USER',
  'SMTP_PASS',
  'NEXT_PUBLIC_BASE_URL',
  'OPENAI_API_KEY',
  'D_ID_API_KEY',
  'ELEVENLABS_API_KEY',
  'JWT_SECRET',
  'CRON_SECRET'
];

// Verifica se una variabile d'ambiente è vuota o non definita
function isEmptyOrUndefined(value) {
  return value === undefined || value === null || value === '';
}

// Funzione principale
function main() {
  log.title('Verifica Variabili d\'Ambiente');
  
  let missingVars = 0;
  let totalVars = requiredEnvVars.length;
  
  for (const envVar of requiredEnvVars) {
    if (isEmptyOrUndefined(process.env[envVar])) {
      log.error(`Manca la variabile d'ambiente: ${envVar}`);
      missingVars++;
    } else {
      log.success(`Variabile d'ambiente presente: ${envVar}`);
    }
  }
  
  log.title('Riepilogo');
  if (missingVars === 0) {
    log.success(`Tutte le variabili d'ambiente (${totalVars}) sono configurate correttamente!`);
  } else {
    log.error(`Mancano ${missingVars} variabili d'ambiente su ${totalVars} totali.`);
    log.info('Configura le variabili mancanti nel file .env prima del deploy.');
    process.exit(1);
  }
}

// Esecuzione
try {
  main();
} catch (error) {
  log.error(`Errore durante la verifica: ${error.message}`);
  process.exit(1);
}