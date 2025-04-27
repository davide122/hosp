"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiUser,
  FiRefreshCw,
  FiSearch,
  FiEdit,
  FiTrash,
  FiUserCheck,
  FiUserX,
  FiSave,
  FiX
} from 'react-icons/fi';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    is_verified: false
  });

  // 1) Carica utenti
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users/list');
      if (!res.ok) throw new Error('Errore nel caricamento degli utenti');
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (err) {
      console.error(err);
      setError('Impossibile caricare gli utenti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2) Filtro live
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3) Editing handlers
  const startEditing = u => {
    setEditingUser(u.id);
    setEditForm({
      name: u.name,
      email: u.email,
      is_verified: u.is_verified
    });
  };
  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', is_verified: false });
  };
  const handleEditChange = e => {
    const { name, value, type, checked } = e.target;
    setEditForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // 4) Salva modifiche
  const saveUserChanges = async id => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error();
      setUsers(us =>
        us.map(u => (u.id === id ? { ...u, ...editForm } : u))
      );
      cancelEditing();
    } catch {
      setError('Errore nell’aggiornamento.');
    } finally {
      setLoading(false);
    }
  };

  // 5) Elimina utente
  const deleteUser = async id => {
    if (!confirm('Eliminare utente?')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setUsers(us => us.filter(u => u.id !== id));
    } catch {
      setError('Errore nell’eliminazione.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-400">Gestione Utenti</h1>
        <Link href="/backoffice" className="bg-gray-700 px-4 py-2 rounded-md">
          Indietro
        </Link>
      </header>

      <main className="container mx-auto py-8 px-4">
        {error && <div className="bg-red-500 p-3 rounded mb-6">{error}</div>}

        {/* ricerca + refresh */}
        <div className="flex mb-6 gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca nome o email..."
              className="pl-10 pr-4 py-2 w-full bg-gray-800 rounded focus:outline-none focus:ring-purple-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            <FiRefreshCw className={`${loading ? 'animate-spin' : ''} mr-2`} /> Aggiorna
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-t-purple-500 rounded-full" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FiUser className="mx-auto mb-4 text-4xl" />
            Nessun utente trovato
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Registrato</th>
                  <th className="px-4 py-2 text-left">Verificato</th>
                  <th className="px-4 py-2 text-left">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-700">
                    <td className="px-4 py-2">{u.id}</td>
                    <td className="px-4 py-2">
                      {editingUser === u.id ? (
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 bg-gray-700 rounded"
                        />
                      ) : (
                        u.name
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingUser === u.id ? (
                        <input
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 bg-gray-700 rounded"
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(u.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {editingUser === u.id ? (
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="is_verified"
                            checked={editForm.is_verified}
                            onChange={handleEditChange}
                            className="form-checkbox text-purple-500"
                          />
                          <span className="ml-2 text-sm">Verificato</span>
                        </label>
                      ) : u.is_verified ? (
                        <span className="inline-flex items-center bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs">
                          <FiUserCheck className="mr-1" /> Sì
                        </span>
                      ) : (
                        <span className="inline-flex items-center bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs">
                          <FiUserX className="mr-1" /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingUser === u.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveUserChanges(u.id)}
                            className="p-1 bg-green-600 rounded"
                          >
                            <FiSave size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 bg-gray-600 rounded"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(u)}
                            className="p-1 bg-blue-600 rounded"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1 bg-red-600 rounded"
                          >
                            <FiTrash size={16} />
                          </button>
                        </div>
                      )}
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
