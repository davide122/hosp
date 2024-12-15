import React from "react";
import ChatbotDescription from "./ChatbotDescription";
import ChatbotVideo from "./ChatbotVideo";

const ChatbotSection = ({ title, subtitle, description, buttons }) => {
  return (
    <section
      id="chatbot"
      className="py-16 px-6 bg-gradient-to-b from-black via-[#0b0d13] to-[#07080d] text-white relative"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Colonna sinistra: Descrizione */}
        <ChatbotDescription
          title={title}
          subtitle={subtitle}
          description={description}
          buttons={buttons}
        />

        {/* Colonna destra: Video Chatbot */}
        <ChatbotVideo />
      </div>
    </section>
  );
};

export default ChatbotSection;
