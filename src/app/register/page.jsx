"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleForm = () => {
    setIsRegister(!isRegister);
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante l'autenticazione");
      }

      alert(isRegister ? "Registrazione completata!" : "Login riuscito!");
      window.location.href = "/dashboard"; // Reindirizza alla dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden">
      {/* Animazione di sfondo */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-800 opacity-60 blur-3xl animate-pulse-slow top-1/4 left-1/5"></div>
        <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-indigo-900 via-gray-700 to-purple-900 opacity-50 blur-3xl animate-pulse-slow bottom-1/4 right-1/5"></div>
      </div>

      {/* Contenitore principale */}
      <div className="relative z-10 w-full max-w-xl bg-gray-900/90 rounded-3xl shadow-2xl p-8 border border-gray-800 backdrop-blur-lg md:px-12">
        {/* Tabs */}
        <div className="flex justify-center space-x-8 mb-6">
          <button
            onClick={() => setIsRegister(true)}
            className={`text-lg font-semibold pb-2 transition border-b-2 ${
              isRegister ? "border-purple-500 text-white" : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            Registrati
          </button>
          <button
            onClick={() => setIsRegister(false)}
            className={`text-lg font-semibold pb-2 transition border-b-2 ${
              !isRegister ? "border-purple-500 text-white" : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            Accedi
          </button>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? "register" : "login"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Inserisci il tuo nome"
                    required
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Inserisci la tua email"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Inserisci la tua password"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-lg text-white font-semibold hover:scale-105 transform transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Attendere..." : isRegister ? "Registrati" : "Accedi"}
              </button>
            </form>

            <p className="mt-4 text-gray-500 text-center">
              {isRegister ? "Hai già un account?" : "Non hai un account?"}{" "}
              <button
                type="button"
                onClick={toggleForm}
                className="text-purple-500 hover:underline"
              >
                {isRegister ? "Accedi" : "Registrati"}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stile dell'animazione */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s infinite;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
