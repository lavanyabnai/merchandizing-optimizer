import { create } from "zustand";

type NewcustomconstraintState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewcustomconstraint = create<NewcustomconstraintState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
