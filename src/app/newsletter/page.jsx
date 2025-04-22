import { Suspense } from "react";
import NewsletterClient from "./NewsletterClient";

export default function NewsletterPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#0e0e11] w-[90%] max-w-md p-8 rounded-3xl border border-purple-500/20 text-white">
        <h3 className="text-2xl font-bold mb-4 text-center">Verifica Email</h3>
        <p className="text-white text-center text-lg">🔄 Caricamento...</p>
      </div>
    </div>}>
      <NewsletterClient />
    </Suspense>
  );
}
