import { create } from "zustand";

type NewProductflowState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewProductflow = create<NewProductflowState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
