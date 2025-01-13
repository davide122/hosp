
export const metadata = {
    title: "Duci Duci - Il Panettone con un Sorriso",
    description: "Scopri il gusto unico dei nostri panettoni artigianali e sblocca sorprese esclusive! Usa il barcode per un’esperienza interattiva e trova la tua frase di fortuna.",
    canonical: "www.duci-duci.com",
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url: 'www.duci-duci.com',
      title: "Duci Duci - Panettoni e Sorpresa",
      description: "Panettoni artigianali con un tocco di magia. Scansiona il barcode e lasciati sorprendere con frasi di fortuna e premi esclusivi!",
      image: 'https://duci-ducibucket.s3.eu-north-1.amazonaws.com/meta/duci_duci_panettoni.png'  // Sostituisci con l'URL dell'immagine specifica per Duci Duci
    }
  }
  
export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
};