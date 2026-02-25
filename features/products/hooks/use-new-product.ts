import { create } from "zustand";

type NewProductState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewProduct = create<NewProductState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
