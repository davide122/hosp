import { motion } from "framer-motion";

const Sidebar = ({ currentSection, setCurrentSection }) => {
  return (
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
  );
};

export default Sidebar;