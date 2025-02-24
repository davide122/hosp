"use client";
import ChatWithGP from "../component/ChatWithGP";

const Bot = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="max-w-[1920px] mx-auto  lg:p-8">
      <div className="grid lg:grid-cols-[1fr_auto] gap-8">
        {/* Main Chat Component */}
        <div className=" overflow-hidden bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
          <ChatWithGP />
        </div>

        {/* Info Panel - Optional */}
        <div className="hidden lg:flex flex-col gap-6 w-80">
          {/* Status Card */}
          <div className="p-6 rounded-3xl bg-gray-800/30 backdrop-blur-xl border border-gray-700/30">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Virtual Assistant
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Online</span>
              </div>
              <p className="text-sm text-gray-400">
                Ready to assist you with any questions or tasks you may have.
              </p>
            </div>
          </div>

          {/* Features Card */}
          <div className="p-6 rounded-3xl bg-gray-800/30 backdrop-blur-xl border border-gray-700/30">
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
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Bot;
