import { create } from "zustand";

type NewProductgroupState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewProductgroup = create<NewProductgroupState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
