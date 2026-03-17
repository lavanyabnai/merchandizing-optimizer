import { create } from "zustand";

type NewProcessingcostState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewProcessingcost = create<NewProcessingcostState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
