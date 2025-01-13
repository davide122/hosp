import { useState } from "react";
import { motion } from "framer-motion";
import { FiCopy, FiTrash, FiSend } from "react-icons/fi";

const Invitations = () => {
  const [email, setEmail] = useState("");
  const [links, setLinks] = useState([]);

  const handleCreateInvite = () => {
    if (!email) return alert("Inserisci un'email valida!");

    const newLink = {
      id: Date.now(),
      email,
      link: `https://example.com/invite/${Date.now()}`,
      status: "Inviato",
    };

    setLinks([...links, newLink]);
    setEmail("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold mb-4">Gestione degli Inviti</h3>
      <div className="mb-8">
        <input
          type="email"
          placeholder="Inserisci email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleCreateInvite}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-md"
        >
          Invia Invito
        </button>
      </div>

      <ul className="space-y-4">
        {links.map(({ id, email, link, status }) => (
          <motion.li
            key={id}
            className="p-4 bg-gray-800 rounded-md flex justify-between items-center"
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
                onClick={() => navigator.clipboard.writeText(link)}
                className="text-indigo-500 hover:text-purple-500"
              >
                <FiCopy />
              </button>
              <button
                onClick={() => setLinks(links.filter((item) => item.id !== id))}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash />
              </button>
              <button className="text-green-500 hover:text-green-700">
                <FiSend />
              </button>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Invitations;