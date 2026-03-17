import { create } from "zustand";

type NewPeriodState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewPeriod = create<NewPeriodState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
