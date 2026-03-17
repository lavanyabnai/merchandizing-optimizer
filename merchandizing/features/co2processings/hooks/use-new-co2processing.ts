import { create } from "zustand";

type NewCo2processingState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewCo2processing = create<NewCo2processingState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
