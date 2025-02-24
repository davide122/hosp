"use client";
import { useState, useCallback } from "react";
import axios from "axios";

/**
 * Gestisce la logica di generazione dell'avatar video
 * e relativo polling.
 */
export default function useVideoGenerator() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [secondVideoUrl, setSecondVideoUrl] = useState(null);
  const [firstVideoEnded, setFirstVideoEnded] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);

  // Funzione per splittare testo in due parti
  const splitTextIntoTranches = useCallback((text, minLength = 80) => {
    if (text.length <= minLength) return [text];
    const target = Math.floor(text.length * 0.3);
    let splitIndex = text.lastIndexOf(".", target);
    if (splitIndex === -1) splitIndex = text.lastIndexOf(";", target);
    if (splitIndex === -1) splitIndex = text.lastIndexOf(",", target);
    if (splitIndex === -1) splitIndex = text.lastIndexOf(" ", target);
    if (splitIndex === -1) splitIndex = target;
    const firstTranche = text.substring(0, splitIndex + 1).trim();
    const secondTranche = text.substring(splitIndex + 1).trim();
    return [firstTranche, secondTranche];
  }, []);

  const pollForVideoUrl = useCallback(async (videoId) => {
    for (let i = 0; i < 120; i++) {
      try {
        await new Promise((res) => setTimeout(res, 500));
        const res = await axios.get(`/api/openai/create-avatar-video/${videoId}`);
        if (res.data.videoUrl) {
          return res.data.videoUrl;
        }
      } catch (error) {
        console.error("Errore nel polling del video:", error);
      }
    }
    throw new Error("Il video non è pronto dopo diversi tentativi.");
  }, []);

  // Funzione principale
  const generateAvatarVideo = useCallback(
    async ({ inputText, sourceUrl, voiceId }) => {
      setIsVideoGenerating(true);
      setErrorMessage(null);
      setVideoUrl(null);
      setSecondVideoUrl(null);
      setFirstVideoEnded(false);

      const tranches = splitTextIntoTranches(inputText, 80);

      if (tranches.length === 1) {
        // Singola tranche
        try {
          const res = await axios.post("/api/openai/create-avatar-video", {
            sourceUrl,
            inputText: tranches[0],
            voiceId,
            language: "it",
          });
          const videoId = res.data.videoId;
          if (!videoId) throw new Error("ID del video non ricevuto.");
          const url = await pollForVideoUrl(videoId);
          setVideoUrl(url);
        } catch (error) {
          console.error("Errore nella generazione del video:", error);
          setErrorMessage("Errore nella generazione del video.");
        } finally {
          setIsVideoGenerating(false);
        }
      } else {
        // 2 tranche
        const firstPromise = axios
          .post("/api/openai/create-avatar-video", {
            sourceUrl,
            inputText: tranches[0],
            voiceId,
            language: "it",
          })
          .then(async (res) => {
            const videoId = res.data.videoId;
            if (!videoId)
              throw new Error("ID del video non ricevuto (prima tranche).");
            return await pollForVideoUrl(videoId);
          });

        const secondPromise = axios
          .post("/api/openai/create-avatar-video", {
            sourceUrl,
            inputText: tranches[1],
            voiceId,
            language: "it",
          })
          .then(async (res) => {
            const videoId = res.data.videoId;
            if (!videoId)
              throw new Error("ID del video non ricevuto (seconda tranche).");
            return await pollForVideoUrl(videoId);
          });

        Promise.allSettled([firstPromise, secondPromise]).then((results) => {
          const [firstRes, secondRes] = results;
          if (firstRes.status === "fulfilled") {
            setVideoUrl(firstRes.value);
          } else {
            console.error("Errore nella prima tranche:", firstRes.reason);
            setErrorMessage("Errore nella generazione del video (prima tranche).");
          }
          if (secondRes.status === "fulfilled") {
            setSecondVideoUrl(secondRes.value);
          } else {
            console.error("Errore nella seconda tranche:", secondRes.reason);
            setErrorMessage("Errore nella generazione del video (seconda tranche).");
          }
          setIsVideoGenerating(false);
        });
      }
    },
    [pollForVideoUrl, splitTextIntoTranches]
  );

  const handleVideoEnded = useCallback(() => {
    setFirstVideoEnded(true);
    if (secondVideoUrl) {
      setVideoUrl(secondVideoUrl);
      setSecondVideoUrl(null);
    }
  }, [secondVideoUrl]);

  return {
    videoUrl,
    secondVideoUrl,
    firstVideoEnded,
    isVideoGenerating,
    errorMessage,
    generateAvatarVideo,
    handleVideoEnded,
  };
}
