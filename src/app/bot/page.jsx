"use client";
import ChatWithGP from "../component/ChatWithGP";

const Bot = () => {
  return (
    <div className="h-screen w-full flex flex-col lg:flex-row items-center justify-center bg-gray-900  ">
      {/* Chatbot Component */}
      <div className="w-full h-screen lg:w-1/2  rounded-3xl bg-gray-800/50 backdrop-blur-lg border border-gray-700 shadow-2xl relative">
        <ChatWithGP />
      </div>

      {/* Punti di Forza (Bot Configurator) */}
    
    </div>
  );
};

export default Bot;
