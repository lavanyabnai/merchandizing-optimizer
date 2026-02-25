import { create } from "zustand";

type NewSupplierState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewSupplier = create<NewSupplierState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
