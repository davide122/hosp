const Footer = () => {
    return (
      <footer
        className="relative py-16 px-6 bg-gradient-to-b from-[#07080d] via-[#0b0d13] to-black text-gray-300"
      >
        {/* Particelle di sfondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-10 blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-indigo-500 to-pink-500 opacity-10 blur-3xl"></div>
        </div>
  
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          {/* Logo e Descrizione */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"></div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                AI Hospitality
              </h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Un assistente virtuale progettato per trasformare l'esperienza dei tuoi ospiti e migliorare la gestione della tua struttura.
            </p>
          </div>
  
          {/* Collegamenti */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
              Collegamenti Rapidi
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#chatbot" className="hover:text-white transition-colors">
                  Chatbot
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Prezzi
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#info" className="hover:text-white transition-colors">
                  Team
                </a>
              </li>
            </ul>
          </div>
  
          {/* Contatti */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
              Contattaci
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="block">Email:</span>
                <a href="mailto:info@aihospitality.com" className="hover:text-white transition-colors">
                  info@aihospitality.com
                </a>
              </li>
              <li>
                <span className="block">Telefono:</span>
                <a href="tel:+390123456789" className="hover:text-white transition-colors">
                  +39 012 345 6789
                </a>
              </li>
              <li>
                <span className="block">Indirizzo:</span>
                <p>Via Esempio 123, Milano</p>
              </li>
            </ul>
          </div>
  
          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
              Seguici
            </h4>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-gray-800/40 hover:bg-purple-500 transition-all rounded-full"
              >
                <i className="fab fa-facebook-f text-white"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-gray-800/40 hover:bg-purple-500 transition-all rounded-full"
              >
                <i className="fab fa-twitter text-white"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-gray-800/40 hover:bg-purple-500 transition-all rounded-full"
              >
                <i className="fab fa-instagram text-white"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-gray-800/40 hover:bg-purple-500 transition-all rounded-full"
              >
                <i className="fab fa-linkedin-in text-white"></i>
              </a>
            </div>
          </div>
        </div>
  
        {/* Linea di separazione */}
        <div className="mt-16 border-t border-gray-700/50"></div>
  
        {/* Copyright */}
        <div className="mt-8 text-center text-sm text-gray-500">
          © 2024 AI Hospitality. Tutti i diritti riservati.
        </div>
      </footer>
    );
  };
  
  export default Footer;