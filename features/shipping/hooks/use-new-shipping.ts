import { create } from "zustand";

type NewShippingState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewShipping = create<NewShippingState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
