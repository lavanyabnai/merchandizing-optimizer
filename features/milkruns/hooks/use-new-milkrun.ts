import { create } from "zustand";

type NewMilkrunState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewMilkrun = create<NewMilkrunState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
