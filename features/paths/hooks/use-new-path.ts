import { create } from "zustand";

type NewPathState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewPath = create<NewPathState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
