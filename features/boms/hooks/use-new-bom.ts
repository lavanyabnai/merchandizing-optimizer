import { create } from "zustand";

type NewBomState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewBom = create<NewBomState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
