import { create } from "zustand";

type NewobjectivememberState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewobjectivemember = create<NewobjectivememberState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
