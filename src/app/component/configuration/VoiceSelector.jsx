import { useState } from "react";
import { useBotConfigStore } from "../../../../store/useBotConfigStore";

const VoiceSelector = () => {
  const { setBotConfig, nextStep, prevStep } = useBotConfigStore();
  const [selectedVoice, setSelectedVoice] = useState("Femminile");

  const voices = ["Femminile", "Maschile", "Neutro"];

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-white text-xl font-bold">Seleziona la voce del bot</h2>
      <select
        className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
        value={selectedVoice}
        onChange={(e) => {
          setSelectedVoice(e.target.value);
          setBotConfig({ voice: e.target.value });
        }}
      >
        {voices.map((voice) => (
          <option key={voice} value={voice}>{voice}</option>
        ))}
      </select>

      <div className="flex space-x-4 mt-6">
        <button onClick={prevStep} className="px-6 py-3 bg-gray-500 rounded-lg">Indietro</button>
        <button onClick={nextStep} className="px-6 py-3 bg-purple-500 rounded-lg">Avanti</button>
      </div>
    </div>
  );
};

export default VoiceSelector;
