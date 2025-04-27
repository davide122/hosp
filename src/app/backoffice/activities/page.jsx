"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // → punto qui:
        const res = await fetch('/api/activities/list');
        if (!res.ok) throw new Error('Errore nel caricamento delle attività');

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || 'API returned success: false');
        }

        setActivities(data.activities || []);
      } catch (err) {
        console.error('Errore nel recupero delle attività:', err);
        setError('Impossibile caricare le attività. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questa attività?')) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Errore nell\'eliminazione');
      setActivities((a) => a.filter((x) => x.id !== id));
    } catch (err) {
      console.error('Errore nell\'eliminazione:', err);
      setError('Impossibile eliminare l\'attività. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">Gestione Attività</h1>
          <div className="flex space-x-4">
            <Link href="/backoffice" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
              Indietro
            </Link>
            <Link href="/backoffice/activities/new" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
              Nuova Attività
            </Link>
          </div>
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
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">Nessuna attività trovata</p>
            <Link href="/backoffice/activities/new" className="mt-4 inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
              Aggiungi la prima attività
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Nome</th>
                  <th className="py-3 px-4 text-left">Categoria</th>
                  <th className="py-3 px-4 text-left">Indirizzo</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-700">
                    <td className="py-3 px-4">{activity.id}</td>
                    <td className="py-3 px-4">{activity.name}</td>
                    <td className="py-3 px-4">{activity.category || '-'}</td>
                    <td className="py-3 px-4">{activity.address || '-'}</td>
                    <td className="py-3 px-4">{activity.email || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/backoffice/activities/edit/${activity.id}`}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        >
                          Modifica
                        </Link>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
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
      </main>
    </div>
  );
}
