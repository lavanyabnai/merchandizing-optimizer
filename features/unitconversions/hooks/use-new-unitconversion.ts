import { create } from "zustand";

type NewUnitconversionState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewUnitconversion = create<NewUnitconversionState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
