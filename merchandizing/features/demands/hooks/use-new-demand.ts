import { create } from "zustand";

type NewDemandState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewDemand = create<NewDemandState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
