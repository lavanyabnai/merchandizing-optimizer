import { create } from "zustand";

type NewPeriodsgroupState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewPeriodsgroup = create<NewPeriodsgroupState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
