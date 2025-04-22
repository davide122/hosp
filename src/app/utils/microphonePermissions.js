/**
 * Utility per gestire le autorizzazioni del microfono in modo compatibile con tutti i browser
 */

/**
 * Richiede l'autorizzazione per il microfono e gestisce i casi specifici per Firefox
 * @returns {Promise<{stream: MediaStream|null, error: string|null}>}
 */
export const requestMicrophonePermission = async () => {
  // Verifica se il browser supporta mediaDevices
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      stream: null,
      error: "Il tuo browser non supporta l'accesso al microfono."
    };
  }

  try {
    // Richiedi esplicitamente l'autorizzazione per l'audio
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });

    return { stream, error: null };
  } catch (error) {
    console.error("Errore nell'accesso al microfono:", error);
    
    // Gestione specifica degli errori per Firefox
    let errorMessage = "Impossibile accedere al microfono.";
    
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      errorMessage = "Permesso per il microfono negato. Controlla le impostazioni del browser.";
    } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      errorMessage = "Nessun microfono trovato sul dispositivo.";
    } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      errorMessage = "Il microfono è in uso da un'altra applicazione.";
    } else if (error.name === "SecurityError") {
      errorMessage = "Errore di sicurezza nell'accesso al microfono. Verifica che stai usando HTTPS.";
    } else if (error.name === "AbortError") {
      errorMessage = "Operazione interrotta durante l'accesso al microfono.";
    }
    
    return { stream: null, error: errorMessage };
  }
};

/**
 * Verifica lo stato attuale delle autorizzazioni del microfono
 * @returns {Promise<string>} - Lo stato dell'autorizzazione: 'granted', 'denied', 'prompt' o 'unsupported'
 */
export const checkMicrophonePermissionStatus = async () => {
  // Verifica se l'API Permissions è supportata
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      return permissionStatus.state; // 'granted', 'denied', o 'prompt'
    } catch (error) {
      console.error("Errore nel controllo delle autorizzazioni:", error);
      return "unsupported";
    }
  }
  
  return "unsupported";
};

/**
 * Rilascia le risorse del microfono
 * @param {MediaStream} stream - Lo stream del microfono da rilasciare
 */
export const releaseMicrophoneStream = (stream) => {
  if (stream && stream.getTracks) {
    stream.getTracks().forEach(track => track.stop());
  }
};