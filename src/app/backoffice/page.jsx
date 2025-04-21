"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BackofficePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verifica se l'utente è autenticato
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Reindirizza alla pagina di login se non autenticato
          router.push('/backoffice/login');
        }
      } catch (error) {
        console.error('Errore nella verifica dell\'autenticazione:', error);
        router.push('/backoffice/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">Backoffice Amministrativo</h1>
          <button 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/backoffice/login');
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card per gestione attività */}
          <Link href="/backoffice/activities" className="block">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-700 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">Gestione Attività</h2>
              <p className="text-gray-300">Aggiungi, modifica ed elimina le attività disponibili nel sistema.</p>
            </div>
          </Link>

          {/* Card per gestione immagini */}
          <Link href="/backoffice/images" className="block">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-700 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">Gestione Immagini</h2>
              <p className="text-gray-300">Gestisci le immagini associate alle attività.</p>
            </div>
          </Link>

          {/* Card per gestione utenti */}
          <Link href="/backoffice/users" className="block">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-700 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">Gestione Utenti</h2>
              <p className="text-gray-300">Amministra gli utenti registrati nel sistema.</p>
            </div>
          </Link>

          {/* Card per gestione email */}
          <Link href="/backoffice/emails" className="block">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-700 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">Gestione Email</h2>
              <p className="text-gray-300">Monitora le email inviate e gestisci le newsletter.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}