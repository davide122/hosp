import React from "react";
import ChatWithGP from "./ChatWithGP";

const ChatbotVideo = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-full md:w-[80%] lg:w-[70%] aspect-square rounded-3xl bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-lg relative">
        {/* Integrazione di ChatWithGP */}
        <ChatWithGP />

        {/* Decorazioni */}
        <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-30 blur-xl"></div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 opacity-30 blur-xl"></div>
      </div>
    </div>
  );
};

export default ChatbotVideo;
