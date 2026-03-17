import { create } from "zustand";

type NewCo2facilitieState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewCo2facilitie = create<NewCo2facilitieState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
