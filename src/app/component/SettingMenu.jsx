"use client";
import React from "react";

const SettingsMenu = ({ selectedImage, setSelectedImage, selectedVoice, setSelectedVoice, imageOptions, voiceOptions }) => {
  return (
    <aside className="w-full md:w-1/4 bg-gray-800 p-6 border-b md:border-b-0 md:border-r border-gray-700 overflow-y-auto">
      <h3 className="text-xl font-semibold mb-3">Impostazioni</h3>

      {/* Selezione Immagine */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold mb-2">Seleziona Immagine</h4>
        {imageOptions.map((option) => (
          <label key={option.id} className="flex items-center mb-2 cursor-pointer">
            <input
              type="radio"
              name="image"
              value={option.url}
              checked={selectedImage === option.url}
              onChange={() => setSelectedImage(option.url)}
              className="mr-2"
            />
            <img src={option.url} alt={option.label} className="w-10 h-10 rounded-full mr-2 object-cover" />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Selezione Voce */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold mb-2">Seleziona Voce</h4>
        {voiceOptions.map((option) => (
          <label key={option.id} className="flex items-center mb-2 cursor-pointer">
            <input
              type="radio"
              name="voice"
              value={option.value}
              checked={selectedVoice === option.value}
              onChange={() => setSelectedVoice(option.value)}
              className="mr-2"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </aside>
  );
};

export default SettingsMenu;
