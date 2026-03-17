import { create } from "zustand";

type NewProductstorageState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewProductstorage = create<NewProductstorageState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
