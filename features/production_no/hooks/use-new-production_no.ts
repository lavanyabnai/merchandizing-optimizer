import { create } from "zustand";

type NewProduction_noState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewProduction_no = create<NewProduction_noState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
