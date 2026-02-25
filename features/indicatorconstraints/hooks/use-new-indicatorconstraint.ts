import { create } from "zustand";

type NewIndicatorconstraintState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewIndicatorconstraint = create<NewIndicatorconstraintState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
