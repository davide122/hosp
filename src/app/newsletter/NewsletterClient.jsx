"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function NewsletterClient() {
  const qs     = useSearchParams();
  const token  = qs.get("token");
  const router = useRouter();

  // loading | verified | error
  const [state, setState] = useState("loading");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    (async () => {
      setState("loading");
      try {
        const res  = await fetch(`/api/verify?token=${token}`);
        const data = await res.json();

        if (data.verified) {
          // marca come verificata
          localStorage.setItem("bot_email_verified", "true");
          setState("verified");

          // dopo 2s mando su /bot
          setTimeout(() => {
            router.push("/bot");
          }, 2000);
        } else {
          setState("error");
        }
      } catch (err) {
        console.error(err);
        setState("error");
      }
    })();
  }, [token, router]);

  let message;
  if (state === "loading") {
    message = (
      <p className="text-white text-center text-lg">
        🔄 Verifico la tua email...
      </p>
    );
  } else if (state === "verified") {
    message = (
      <p className="text-green-400 text-center text-lg">
        ✅ Email verificata con successo!<br />
        Reindirizzamento in corso…
      </p>
    );
  } else {
    message = (
      <p className="text-red-400 text-center text-lg">
        ❌ Verifica fallita. Token non valido o scaduto.
      </p>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#0e0e11] w-[90%] max-w-md p-8 rounded-3xl border border-purple-500/20 text-white">
        <h3 className="text-2xl font-bold mb-4 text-center">
          Verifica Email
        </h3>
        {message}
      </div>
    </div>
  );
}