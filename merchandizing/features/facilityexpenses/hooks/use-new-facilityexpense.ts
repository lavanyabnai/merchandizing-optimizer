import { create } from "zustand";

type NewFacilityexpenseState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewFacilityexpense = create<NewFacilityexpenseState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
