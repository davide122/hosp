"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Carica gli utenti dal database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/list');
        
        if (!response.ok) {
          throw new Error('Errore nel caricamento degli utenti');
        }
        
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Errore nel recupero degli utenti:', error);
        setError('Impossibile caricare gli utenti. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">Gestione Utenti</h1>
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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">Nessun utente trovato</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Nome</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Data Registrazione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700">
                    <td className="py-3 px-4">{user.id}</td>
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{new Date(user.created_at).toLocaleString()}</td>
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
              Questa sezione mostra tutti gli utenti registrati nel sistema. Gli utenti possono accedere al backoffice solo se hanno i permessi di amministratore.
            </p>
            <p className="text-gray-300">
              Per aggiungere un nuovo amministratore, è necessario registrare un nuovo utente e poi assegnargli i permessi di amministratore direttamente nel database.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}