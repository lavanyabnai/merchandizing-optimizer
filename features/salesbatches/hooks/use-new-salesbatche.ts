import { create } from "zustand";

type NewSalesbatcheState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewSalesbatche = create<NewSalesbatcheState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
