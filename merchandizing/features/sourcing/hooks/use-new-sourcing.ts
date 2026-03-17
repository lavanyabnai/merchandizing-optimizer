import { create } from "zustand";

type NewSourcingState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewSourcing = create<NewSourcingState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
