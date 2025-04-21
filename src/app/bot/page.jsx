"use client";
import ChatWithGP from "../component/ChatWithGP";
import { TokenUsageDisplay } from "../components/TokenUsageDisplay";
import { useState } from "react";
import dynamic from "next/dynamic";

const NewsletterForm = dynamic(
  () => import("../component/newsletter/NewsletterForm"),
  { ssr: false }
);
const Bot = () => {
  const [tokenUsage, setTokenUsage] = useState(null);

  const handleTokenUsageUpdate = (usage) => {
    setTokenUsage(usage);
  };

  return (
    <div className=" bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen md:flex md:items-center md:justify-center">
      <NewsletterForm></NewsletterForm>
    <div className="mx-auto md:container md:max-w-3xl md:h-[80vh] md:overflow-hidden">
      <div className="w-full">
        {/* Main Chat Component */}
        <div className="overflow-hidden bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 shadow-2xl md:rounded-xl md:h-[80vh]">
          <ChatWithGP onTokenUsageUpdate={handleTokenUsageUpdate} />
        </div>

        {/* Info Panel - Optional */}
        <div className="flex flex-col gap-4 lg:gap-6 w-full lg:w-80 sticky top-4">
          {/* Status Card */}
          
          {/* Token Usage Display */}
          {/* <TokenUsageDisplay tokenUsage={tokenUsage} /> */}

          {/* Features Card */}
          {/* <div className="p-4 lg:p-6 rounded-3xl bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-300">Voice Recognition</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-300">Real-time Responses</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-300">Customizable Avatar</span>
              </li>
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  </div>
  );
};

export default Bot;
