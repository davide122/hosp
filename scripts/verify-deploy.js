#!/usr/bin/env node

/**
 * Script di verifica pre-deploy
 * 
 * Questo script controlla che tutte le configurazioni necessarie siano presenti
 * prima del deploy in produzione.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const nodemailer = require('nodemailer');

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
  'JWT_SECRET'
];

async function main() {
  log.title('Verifica Pre-Deploy');
  
  // 1. Controllo variabili d'ambiente
  log.title('Controllo Variabili d\'Ambiente');
  let allEnvVarsPresent = true;
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      log.error(`Manca la variabile d'ambiente: ${envVar}`);
      allEnvVarsPresent = false;
    } else {
      log.success(`Variabile d'ambiente presente: ${envVar}`);
    }
  }
  
  if (!allEnvVarsPresent) {
    log.error('Alcune variabili d\'ambiente necessarie non sono configurate!');
  }
  
  // 2. Verifica connessione SMTP
  log.title('Verifica Configurazione SMTP');
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    await transporter.verify();
    log.success('Connessione SMTP verificata con successo');
  } catch (error) {
    log.error(`Errore nella configurazione SMTP: ${error.message}`);
  }
  
  // 3. Verifica build
  log.title('Verifica Build');
  try {
    log.info('Esecuzione di "next build" per verificare errori...');
    execSync('npm run build', { stdio: 'inherit' });
    log.success('Build completata con successo');
  } catch (error) {
    log.error('Errore durante la build');
  }
  
  log.title('Verifica Completata');
  log.info('Controlla eventuali errori sopra prima di procedere con il deploy');
}

main().catch(err => {
  log.error(`Errore generale: ${err.message}`);
  process.exit(1);
});