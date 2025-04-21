"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const NewsletterForm = () => {
  const qs = useSearchParams();
  const token = qs.get("token");

  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | sent | error | verified
  const [show, setShow] = useState(true);

  // 1) Nascondi se già verificato
  useEffect(() => {
    if (localStorage.getItem("bot_email_verified") === "true") {
      setShow(false);
      setState("verified");
    }
  }, []);

  // 2) Se token in URL, chiamo /api/verify
  useEffect(() => {
    if (!token) return;
    (async () => {
      setState("loading");
      const res  = await fetch(`/api/verify?token=${token}`);
      const data = await res.json();
      if (data.verified) {
        localStorage.setItem("bot_email_verified", "true");
        setState("verified");
      } else {
        setState("error");
      }
    })();
  }, [token]);

  // 3) Invio email di verifica
  const handleSubmit = async (e) => {
    e.preventDefault();
    setState("loading");
    const res = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setState(res.ok ? "sent" : "error");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#0e0e11] w-[90%] max-w-lg p-8 rounded-3xl border border-purple-500/20 text-white">
        <h3 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Verifica la tua email per usare il Bot
        </h3>

        {state === "verified" ? (
          <p className="text-green-400 text-center text-lg">
            ✅ Email verificata con successo! Ora puoi usare il Bot.
          </p>
        ) : state === "sent" ? (
          <p className="text-green-400 text-center text-lg">
            ✅ Email inviata! Controlla la posta e clicca sul link per confermare.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="la-tua@email.it"
              required
              className="p-4 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="py-3 rounded-full font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition"
            >
              {state === "loading" ? "Invio in corso..." : "Invia link di verifica"}
            </button>
            {state === "error" && (
              <p className="text-red-400 text-center">❌ Errore. Riprova.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default NewsletterForm;
