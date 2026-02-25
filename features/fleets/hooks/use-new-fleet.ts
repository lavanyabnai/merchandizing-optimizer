import { create } from "zustand";

type NewFleetState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewFleet = create<NewFleetState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
