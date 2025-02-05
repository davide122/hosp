import { useState } from 'react';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Invio email al server (da configurare)
      setMessage('Grazie per esserti iscritto!');
    } catch {
      setMessage('Ops, qualcosa è andato storto!');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-500 flex items-center justify-center">
      <div className="text-center text-white space-y-6">
        <h1 className="text-4xl font-bold">Tuki sta arrivando...</h1>
        <p className="text-lg">La rivoluzione è alle porte. Non perdere l'occasione di scoprirlo per primo.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Inserisci la tua email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 w-72 rounded-lg text-gray-800"
          />
          <button
            type="submit"
            className="bg-white text-purple-600 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
          >
            Avvisami al lancio
          </button>
        </form>
        {message && <p className="text-sm mt-4">{message}</p>}
      </div>
    </div>
  );
}
