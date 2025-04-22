# Guida al Deploy

## Prerequisiti

- Node.js 18+ installato sul server
- Database PostgreSQL (consigliato Neon.tech per compatibilità con @neondatabase/serverless)
- Account SMTP per l'invio di email (es. Gmail con password per app)
- Account per le API necessarie (OpenAI, D-ID, ElevenLabs)

## Configurazione

1. **Clona il repository**

```bash
git clone <repository-url>
cd bothospitality
```

2. **Installa le dipendenze**

```bash
npm install
```

3. **Configura le variabili d'ambiente**

Crea un file `.env` nella root del progetto basandoti sul file `.env.example`:

```
# Copia il file di esempio
cp .env.example .env

# Modifica il file con i tuoi valori
nano .env
```

4. **Verifica la configurazione pre-deploy**

Esegui lo script di verifica per controllare che tutto sia configurato correttamente:

```bash
node scripts/verify-deploy.js
```

5. **Configura il database**

Assicurati che il database sia configurato con le tabelle necessarie:

- `emailnova` - per la gestione delle email e verifica
- `email_sequence_sent` - per tracciare le email inviate dallo scheduler

## Build e Deploy

1. **Esegui la build del progetto**

```bash
npm run build
```

2. **Avvia l'applicazione in produzione**

```bash
npm start
```

Per mantenere l'applicazione in esecuzione, usa un process manager come PM2:

```bash
# Installa PM2 globalmente
npm install -g pm2

# Avvia l'applicazione con PM2
pm2 start npm --name "bothospitality" -- start

# Configura l'avvio automatico
pm2 startup
pm2 save
```

## Configurazione dello Scheduler

Per l'invio automatico delle email, configura un cron job che esegua lo script scheduler:

```bash
# Esegui manualmente
node src/lib/scheduler.mjs

# Oppure configura un cron job
# Esempio: esegui ogni ora
0 * * * * cd /path/to/bothospitality && node src/lib/scheduler.mjs
```

## Verifica del Deploy

Dopo il deploy, verifica che:

1. La pagina principale sia accessibile
2. Il form di newsletter funzioni correttamente
3. Le email di verifica vengano inviate
4. Il bot sia accessibile dopo la verifica dell'email
5. Lo scheduler invii le email automatiche

## Troubleshooting

### Problemi con l'invio delle email

- Verifica le credenziali SMTP
- Controlla che il server non blocchi le connessioni SMTP in uscita
- Verifica che l'indirizzo email mittente sia autorizzato a inviare email

### Problemi con il database

- Verifica la connessione al database
- Controlla che le tabelle necessarie siano create
- Verifica i permessi dell'utente database

### Problemi con le API esterne

- Verifica che le chiavi API siano valide
- Controlla i limiti di utilizzo delle API
- Verifica che il server possa raggiungere gli endpoint API esterni