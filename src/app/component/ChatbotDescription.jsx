import React from "react";

const ChatbotDescription = ({ title, subtitle, description, buttons }) => {
  return (
    <div className="space-y-6">
      {/* Titolo */}
      <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
        {title}
      </h2>

      {/* Sottotitolo */}
      {subtitle && (
        <h3 className="text-xl md:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
          {subtitle}
        </h3>
      )}

      {/* Descrizione */}
      <p className="text-gray-400 text-sm md:text-base leading-relaxed">
        {description}
      </p>

      {/* Pulsanti */}
      <div className="flex flex-col sm:flex-row gap-4">
        {buttons.map((button, index) => (
          <button
            key={index}
            className={`${button.style} px-6 py-3 rounded-full font-semibold shadow-md`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatbotDescription;
