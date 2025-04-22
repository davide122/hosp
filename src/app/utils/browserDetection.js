/**
 * Utility per il rilevamento del browser e la gestione della compatibilità
 */

/**
 * Rileva il browser corrente
 * @returns {Object} Informazioni sul browser
 */
export const detectBrowser = () => {
  if (typeof window === 'undefined') {
    return { name: 'unknown', isFirefox: false };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  
  // Rileva Firefox
  if (userAgent.indexOf('firefox') > -1) {
    return { name: 'firefox', isFirefox: true };
  }
  
  // Rileva Chrome
  if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edg') === -1) {
    return { name: 'chrome', isChrome: true };
  }
  
  // Rileva Edge
  if (userAgent.indexOf('edg') > -1) {
    return { name: 'edge', isEdge: true };
  }
  
  // Rileva Safari
  if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
    return { name: 'safari', isSafari: true };
  }
  
  return { name: 'unknown', isUnknown: true };
};

/**
 * Verifica se il browser supporta completamente le API audio necessarie
 * @returns {boolean} True se il browser supporta tutte le API necessarie
 */
export const checkAudioSupport = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Verifica SpeechRecognition
  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  
  // Verifica MediaDevices API
  const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  // Verifica AudioContext
  const hasAudioContext = !!(window.AudioContext || window.webkitAudioContext);
  
  return hasSpeechRecognition && hasMediaDevices && hasAudioContext;
};

/**
 * Ottiene suggerimenti specifici per il browser per risolvere problemi con il microfono
 * @param {string} browserName - Il nome del browser
 * @returns {Array<string>} Lista di suggerimenti
 */
export const getMicrophoneTroubleshootingTips = (browserName) => {
  const commonTips = [
    "Assicurati che il microfono sia correttamente collegato al dispositivo",
    "Verifica che nessun'altra applicazione stia utilizzando il microfono",
    "Ricarica la pagina e prova nuovamente"
  ];
  
  const browserSpecificTips = {
    firefox: [
      "Clicca sull'icona del lucchetto nella barra degli indirizzi",
      "Verifica che l'autorizzazione 'Microfono' sia impostata su 'Consenti'",
      "Se hai già negato l'accesso, clicca su 'Rimuovi autorizzazione' e ricarica la pagina",
      "Vai su about:preferences#privacy, cerca 'Autorizzazioni' e verifica le impostazioni del microfono"
    ],
    chrome: [
      "Clicca sull'icona del lucchetto nella barra degli indirizzi",
      "Verifica che l'impostazione 'Microfono' sia su 'Consenti'",
      "Vai su chrome://settings/content/microphone per gestire le autorizzazioni del sito"
    ],
    edge: [
      "Clicca sui tre puntini in alto a destra, poi su 'Impostazioni'",
      "Vai su 'Cookie e autorizzazioni sito', poi su 'Autorizzazioni' e 'Microfono'",
      "Verifica che il sito sia nell'elenco dei siti consentiti"
    ],
    safari: [
      "Clicca su 'Safari' nel menu in alto, poi su 'Preferenze'",
      "Vai sulla scheda 'Siti web', poi su 'Microfono' nella barra laterale",
      "Assicurati che il sito sia impostato su 'Consenti'"
    ]
  };
  
  return [...commonTips, ...(browserSpecificTips[browserName] || [])];
};