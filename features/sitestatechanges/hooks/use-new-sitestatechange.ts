import { create } from "zustand";

type NewSitestatechangeState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewSitestatechange = create<NewSitestatechangeState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
