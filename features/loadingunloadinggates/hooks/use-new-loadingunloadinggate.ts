import { create } from "zustand";

type NewLoadingunloadinggateState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewLoadingunloadinggate = create<NewLoadingunloadinggateState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
