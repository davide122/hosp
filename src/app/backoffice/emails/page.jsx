"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiMail, FiRefreshCw, FiSearch, FiFilter, FiCheck, FiX } from 'react-icons/fi';

export default function EmailsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState('all'); // 'all', 'verified', 'unverified'

  // Carica le email dal database
  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emails/list');
      
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle email');
      }
      
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Errore nel recupero delle email:', error);
      setError('Impossibile caricare le email. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Filtra le email in base alla ricerca e allo stato di verifica
  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterVerified === 'all') return matchesSearch;
    if (filterVerified === 'verified') return matchesSearch && email.is_verified;
    if (filterVerified === 'unverified') return matchesSearch && !email.is_verified;
    
    return matchesSearch;
  });

  // Invia email di verifica
  const sendVerificationEmail = async (emailAddress) => {
    try {
      setLoading(true);
      const response = await fetch('/api/emails/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailAddress }),
      });
      
      if (!response.ok) {
        throw new Error('Errore nell\'invio dell\'email di verifica');
      }
      
      alert(`Email di verifica inviata a ${emailAddress}`);
      fetchEmails(); // Aggiorna la lista
    } catch (error) {
      console.error('Errore:', error);
      setError('Impossibile inviare l\'email di verifica. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Elimina un'email
  const deleteEmail = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questa email?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/emails/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione dell\'email');
      }
      
      // Rimuovi l'email dalla lista locale
      setEmails(emails.filter(email => email.id !== id));
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      setError('Impossibile eliminare l\'email. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">Gestione Email</h1>
          <Link href="/backoffice" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
            Indietro
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Filtri e ricerca */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cerca per email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
            >
              <option value="all">Tutte le email</option>
              <option value="verified">Verificate</option>
              <option value="unverified">Non verificate</option>
            </select>
          </div>
          
          <button
            onClick={fetchEmails}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-12">
            <FiMail className="mx-auto text-4xl text-gray-500 mb-4" />
            <p className="text-xl text-gray-400">Nessuna email trovata</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Domande Rimaste</th>
                  <th className="py-3 px-4 text-left">Data Registrazione</th>
                  <th className="py-3 px-4 text-left">Verificata</th>
                  <th className="py-3 px-4 text-left">Lingua</th>
                  <th className="py-3 px-4 text-left">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4">{email.id}</td>
                    <td className="py-3 px-4">{email.email}</td>
                    <td className="py-3 px-4">{email.questions_left}</td>
                    <td className="py-3 px-4">{new Date(email.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {email.is_verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                          <FiCheck className="mr-1" /> Verificata
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                          <FiX className="mr-1" /> Non verificata
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{email.language || 'Non specificata'}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {!email.is_verified && (
                          <button
                            onClick={() => sendVerificationEmail(email.email)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                            title="Invia email di verifica"
                          >
                            Verifica
                          </button>
                        )}
                        <button
                          onClick={() => deleteEmail(email.id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                          title="Elimina email"
                        >
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Informazioni</h2>
            <p className="text-gray-300 mb-4">
              Questa sezione mostra tutte le email registrate nel sistema. Le email verificate possono ricevere newsletter e aggiornamenti.
            </p>
            <p className="text-gray-300">
              Per inviare una newsletter a tutte le email verificate, utilizza la funzione di invio newsletter nella dashboard principale.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}