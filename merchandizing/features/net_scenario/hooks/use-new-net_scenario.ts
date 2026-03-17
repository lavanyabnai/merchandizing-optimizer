import { create } from "zustand";

type NewNetScenarioState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewNetScenario = create<NewNetScenarioState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
