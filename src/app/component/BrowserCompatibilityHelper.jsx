"use client";
import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

/**
 * Componente che mostra suggerimenti di compatibilità specifici per browser
 * Particolarmente utile per risolvere problemi con Firefox e le autorizzazioni del microfono
 */
const BrowserCompatibilityHelper = () => {
  const [isFirefox, setIsFirefox] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Rileva se il browser è Firefox
    const isFirefoxBrowser = typeof window !== 'undefined' && 
      navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    
    setIsFirefox(isFirefoxBrowser);
    
    // Mostra l'aiuto solo se è Firefox e non è stato già chiuso dall'utente
    const alreadyDismissed = localStorage.getItem('firefoxMicHelpDismissed') === 'true';
    setDismissed(alreadyDismissed);
    setShowHelp(isFirefoxBrowser && !alreadyDismissed);
  }, []);

  const dismissHelp = () => {
    setShowHelp(false);
    localStorage.setItem('firefoxMicHelpDismissed', 'true');
    setDismissed(true);
  };

  const resetHelp = () => {
    localStorage.removeItem('firefoxMicHelpDismissed');
    setDismissed(false);
    setShowHelp(isFirefox);
  };

  if (!isFirefox || !showHelp) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0 text-amber-500">
          <FiAlertTriangle size={24} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">Suggerimento per Firefox</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              Se riscontri problemi con l'accesso al microfono su Firefox:
            </p>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>Clicca sull'icona del lucchetto nella barra degli indirizzi</li>
              <li>Verifica che l'autorizzazione "Microfono" sia impostata su "Consenti"</li>
              <li>Se hai già negato l'accesso, clicca su "Rimuovi autorizzazione" e ricarica la pagina</li>
              <li>Assicurati che nessun'altra applicazione stia utilizzando il microfono</li>
            </ol>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              type="button"
              onClick={dismissHelp}
              className="inline-flex items-center px-3 py-1.5 border border-amber-300 text-xs font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <FiX className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
              Non mostrare più
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserCompatibilityHelper;