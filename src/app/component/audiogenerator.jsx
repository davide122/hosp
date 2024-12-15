import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const AudioGenerator = () => {
  const [voiceStyle, setVoiceStyle] = useState("Professionale");
  const [behaviorMode, setBehaviorMode] = useState("Interattivo");
  const [text, setText] = useState("");
  const [audioSrc, setAudioSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("EXAVITQu4vr4xnSDxMaL");
  const waveSurferRef = useRef(null);
  const waveContainerRef = useRef(null);

  const voices = [
    { id: "Kq9pDHHIMmJsG9PEqOtv", name: "Sandra" },
    { id: "PSp7S6ST9fDNXDwEzX0m", name: "Marco" },
    { id: "13Cuh3NuYvWOVQtLbRN8", name: "Giovanni" },
  ];



  const generateAudio = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/openai/sendtoevenlab/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceStyle, behaviorMode, selectedVoice }),
      });

      const data = await response.json();

      if (data.audio) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],
          { type: "audio/mpeg" }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioSrc(audioUrl);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Errore durante la generazione dell'audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (audioSrc && waveContainerRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveContainerRef.current,
        waveColor: "rgba(173, 216, 230, 0.5)",
        progressColor: "#4c51bf",
        barWidth: 2,
        height: 80,
        cursorColor: "#ffffff",
        responsive: true,
      });

      waveSurferRef.current.load(audioSrc);

      waveSurferRef.current.on("ready", () => {
        waveSurferRef.current.play();
      });

      waveSurferRef.current.on("play", () => {
        waveSurferRef.current.setWaveColor("rgba(144, 238, 144, 0.7)");
        waveSurferRef.current.setProgressColor("rgba(255, 99, 71, 1)");
      });

      waveSurferRef.current.on("pause", () => {
        waveSurferRef.current.setWaveColor("rgba(173, 216, 230, 0.5)");
        waveSurferRef.current.setProgressColor("#4c51bf");
      });

      return () => waveSurferRef.current.destroy();
    }
  }, [audioSrc]);

  return (
    <section
      className="py-16 px-4 relative overflow-hidden min-h-[800px]"
      style={{
        background: "radial-gradient(circle, rgba(63,94,251,0.1) 0%, rgba(0,0,0,1) 70%)",
      }}
    >
      <div className="max-w-6xl mx-auto mb-20 relative z-10">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
          Personalizza il Tuo Assistente
        </h2>
        <p className="text-gray-400 text-xl text-center">
          Dai voce e carattere al tuo alleato virtuale.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Colonna di sinistra */}
        <div className="space-y-8">
          <div>
            <label className="block mb-2 text-gray-300 text-lg">Seleziona una Voce</label>
            <div className="flex gap-4">
              {voices.map((voice) => (
                <label key={voice.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="voice"
                    value={voice.id}
                    checked={selectedVoice === voice.id}
                    onChange={() => setSelectedVoice(voice.id)}
                    className="hidden peer"
                  />
                  <span className="w-6 h-6 rounded-full border-2 border-gray-300 peer-checked:border-purple-500 peer-checked:bg-purple-500"></span>
                  <span className="text-gray-300">{voice.name}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Altri input */}
          <div>
            <label className="block mb-2 text-gray-300 text-lg">Stile della Voce</label>
            <select
              className="w-full p-4 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={voiceStyle}
              onChange={(e) => setVoiceStyle(e.target.value)}
            >
              <option>Professionale</option>
              <option>Amichevole</option>
              <option>Casuale</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-gray-300 text-lg">Modalità di Comportamento</label>
            <select
              className="w-full p-4 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={behaviorMode}
              onChange={(e) => setBehaviorMode(e.target.value)}
            >
              <option>Interattivo</option>
              <option>Semplice</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-gray-300 text-lg">Testo</label>
            <textarea
              className="w-full p-4 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Inserisci il testo da trasformare in audio..."
            />
          </div>
          <button
            className="px-10 py-4 md:px-12 md:py-5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition-transform rounded-full font-semibold text-lg md:text-xl w-full"
            onClick={generateAudio}
            disabled={isLoading || !text}
          >
            {isLoading ? "Generazione in corso..." : "Genera Audio"}
          </button>
        </div>

        {/* Colonna di destra */}
        <div className="flex justify-center align-items-center ">
          <div
            className="relative w-[400px] h-[200px] md:w-[500px] md:h-[250px]  rounded-md  p-4"
          >
            {!audioSrc ? (
              <p className="text-white text-center">Genera l'audio per vedere l'onda sonora.</p>
            ) : (
              <div ref={waveContainerRef} className="w-full h-full"></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudioGenerator;
