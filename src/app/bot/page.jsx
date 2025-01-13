"use client";
import ChatWithGP from "../component/ChatWithGP";

const Bot = () => {
  return (
    <div className="h-screen w-full flex flex-col lg:flex-row items-center justify-center bg-gray-900 p-4 gap-8">
      {/* Chatbot Component */}
      <div className="w-full h-auto lg:w-1/2 p-8 rounded-3xl bg-gray-800/50 backdrop-blur-lg border border-gray-700 shadow-2xl relative">
        <ChatWithGP />
        <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 blur-lg opacity-30"></div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 blur-lg opacity-30"></div>
      </div>

      {/* Punti di Forza (Bot Configurator) */}
    
    </div>
  );
};

export default Bot;
