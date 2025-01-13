"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { FiCopy, FiTrash, FiSend, FiSettings, FiRefreshCw } from "react-icons/fi";

const Dashboard = () => {
  const [currentSection, setCurrentSection] = useState("invitations");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Background Animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500 to-pink-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-row">
        <aside className="w-1/4 bg-gray-900 h-screen p-6">
          <h2 className="text-2xl font-bold text-purple-400 mb-8">Hotel Dashboard</h2>
          <ul className="space-y-4">
            {["invitations", "customizations", "info", "sync"].map((section) => (
              <motion.li
                key={section}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <button
                  onClick={() => setCurrentSection(section)}
                  className={`w-full text-left px-4 py-2 rounded-md hover:bg-purple-500 ${
                    currentSection === section && "bg-purple-700"
                  }`}
                >
                  {section === "invitations" && "Gestione Inviti"}
                  {section === "customizations" && "Personalizzazioni"}
                  {section === "info" && "Informazioni Aggiuntive"}
                  {section === "sync" && "Sincronizzazione"}
                </button>
                {currentSection === section && (
                  <motion.div
                    className="absolute top-0 left-0 h-full w-1 bg-purple-500 rounded-full"
                    layoutId="active-section"
                  />
                )}
              </motion.li>
            ))}
          </ul>
        </aside>

        {/* Content Section */}
        <main className="w-3/4 p-8">
          {currentSection === "invitations" && <Invitations />}
          {currentSection === "customizations" && <Customizations />}
          {currentSection === "info" && <AdditionalInfo />}
          {currentSection === "sync" && <SyncStatus />}
        </main>
      </div>
    </div>
  );
};

const Invitations = () => {
  const [email, setEmail] = useState("");
  const [links, setLinks] = useState([]);

  const handleCreateInvite = async () => {
    if (!email) return alert("Inserisci un'email valida!");

    const newLink = {
      id: uuidv4(),
      email,
      link: `https://example.com/invite/${uuidv4()}`,
      status: "Inviato",
    };

    setLinks([...links, newLink]);
    setEmail("");
  };

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    alert("Link copiato negli appunti!");
  };

  const handleDelete = (id) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const handleResend = (email) => {
    alert(`Invito reinviato a ${email}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold mb-4">Gestione degli Inviti</h3>
      <p className="text-gray-400 mb-6">Invia inviti agli utenti via email e gestisci i loro accessi.</p>

      {/* Creazione Inviti */}
      <div className="mb-8">
        <label htmlFor="email" className="block text-gray-400 mb-2">Email dell'Utente</label>
        <div className="flex items-center gap-4">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Inserisci email"
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleCreateInvite}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-md font-semibold hover:scale-105 transition"
          >
            Invia Invito
          </button>
        </div>
      </div>

      {/* Lista Inviti */}
      <ul className="space-y-4">
        {links.map(({ id, email, link, status }) => (
          <motion.li
            key={id}
            className="p-4 bg-gray-800 rounded-md flex justify-between items-center"
            whileHover={{ scale: 1.02 }}
          >
            <div>
              <p className="text-gray-400">
                <strong>Email:</strong> {email}
              </p>
              <p className="text-gray-400">
                <strong>Stato:</strong> {status}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleCopy(link)}
                className="text-indigo-500 hover:text-purple-500"
                title="Copia Link"
              >
                <FiCopy />
              </button>
              <button
                onClick={() => handleDelete(id)}
                className="text-red-500 hover:text-red-700"
                title="Elimina Invito"
              >
                <FiTrash />
              </button>
              <button
                onClick={() => handleResend(email)}
                className="text-green-500 hover:text-green-700"
                title="Reinvia Invito"
              >
                <FiSend />
              </button>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

const Customizations = () => {
  const [voice, setVoice] = useState("Femminile");
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold mb-4">Personalizzazioni</h3>
      <p className="text-gray-400 mb-4">Modifica le impostazioni dell'assistente, come voce e immagine.</p>
      <div className="mb-6">
        <label className="block text-gray-400 mb-2">Voce</label>
        <select
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
        >
          <option>Femminile</option>
          <option>Maschile</option>
          <option>Neutra</option>
        </select>
      </div>
      <div className="mb-6">
        <label className="block text-gray-400 mb-2">Immagine</label>
        <input type="file" onChange={handleImageUpload} className="text-gray-300" />
        {image && <img src={image} alt="Anteprima" className="mt-4 rounded-md" />}
      </div>
    </motion.div>
  );
};

const AdditionalInfo = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-xl font-bold mb-4">Informazioni Aggiuntive</h3>
    <p className="text-gray-400">
      Aggiungi e modifica descrizioni e dettagli dell'hotel. La mappa interattiva ti permette di aggiornare la posizione.
    </p>
  </motion.div>
);

const SyncStatus = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-xl font-bold mb-4">Sincronizzazione</h3>
    <p className="text-gray-400 mb-4">Controlla lo stato delle integrazioni API.</p>
    <button className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md">
      <FiRefreshCw className="mr-2" />
      Riconnetti
    </button>
  </motion.div>
);

export default Dashboard;