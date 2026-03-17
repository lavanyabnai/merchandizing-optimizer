import { create } from "zustand";

type NewOrderingruleState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewOrderingrule = create<NewOrderingruleState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
