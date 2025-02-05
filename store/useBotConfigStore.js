import { create } from "zustand";

export const useBotConfigStore = create((set) => ({
  step: 1,
  botConfig: {
    avatar: null,
    voice: "Femminile",
  },

  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

  setBotConfig: (data) => set((state) => ({
    botConfig: { ...state.botConfig, ...data },
  })),
}));
