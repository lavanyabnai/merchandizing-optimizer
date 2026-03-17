import { create } from "zustand";

type NewLinearrangeState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewLinearrange = create<NewLinearrangeState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
