import React from "react";

export default function SectionDivider({ from = "#6a5acd", to = "#ff69b4", position = "bottom" }) {
  return (
    <div className={`relative w-full ${position === "top" ? "-mb-1" : "-mt-1"} overflow-hidden`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className={`absolute ${position === "top" ? "top-0" : "bottom-0"} left-0 w-full h-full`}
        preserveAspectRatio="none"
      >
        <path
          d="M0,224L60,192C120,160,240,96,360,74.7C480,53,600,75,720,101.3C840,128,960,160,1080,160C1200,160,1320,128,1380,112L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          fill={`url(#gradient-${from}-${to})`}
        />
        <defs>
          <linearGradient id={`gradient-${from}-${to}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}