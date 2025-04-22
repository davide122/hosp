# Checklist Pre-Deploy

## Configurazione Ambiente

- [ ] Verificare che tutte le variabili d'ambiente siano configurate nel server di produzione
- [ ] Assicurarsi che il file `.env` contenga tutte le variabili elencate in `.env.example`
- [ ] Controllare che `NEXT_PUBLIC_BASE_URL` sia impostato correttamente con il dominio di produzione

## Database

- [ ] Verificare che la connessione al database di produzione funzioni correttamente
- [ ] Controllare che tutte le tabelle necessarie siano create (`emailnova`, `email_sequence_sent`, ecc.)
- [ ] Eseguire backup del database prima del deploy

## Email

- [ ] Verificare che le credenziali SMTP siano valide e funzionanti
- [ ] Testare l'invio di email di verifica
- [ ] Controllare che i template email in `emailTemplates.js` siano aggiornati con i link corretti
- [ ] Verificare che lo scheduler per l'invio automatico delle email funzioni correttamente

## API

- [ ] Testare tutte le API, in particolare:
  - [ ] `/api/verify-email`
  - [ ] `/api/verify`
  - [ ] API di OpenAI
  - [ ] API di D-ID
  - [ ] API di ElevenLabs

## Frontend

- [ ] Verificare che tutti i componenti React siano ottimizzati per la produzione
- [ ] Controllare che il form di newsletter funzioni correttamente
- [ ] Testare il flusso completo di verifica email
- [ ] Verificare che il bot funzioni correttamente dopo la verifica email

## Performance

- [ ] Eseguire test di carico
- [ ] Ottimizzare le immagini e altri asset statici
- [ ] Verificare i tempi di risposta delle API

## Sicurezza

- [ ] Controllare che non ci siano credenziali hardcoded nel codice
- [ ] Verificare che tutte le API siano protette adeguatamente
- [ ] Controllare che i token JWT siano configurati correttamente

## Deployment

- [ ] Eseguire `npm run build` e verificare che non ci siano errori
- [ ] Configurare correttamente il server di produzione
- [ ] Impostare HTTPS con certificato SSL valido
- [ ] Configurare i redirect necessari