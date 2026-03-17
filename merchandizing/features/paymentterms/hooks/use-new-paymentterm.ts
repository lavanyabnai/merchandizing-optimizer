import { create } from "zustand";

type NewPaymenttermState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewPaymentterm = create<NewPaymenttermState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
