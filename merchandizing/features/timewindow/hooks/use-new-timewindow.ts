import { create } from "zustand";

type NewTimewindowState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewTimewindow = create<NewTimewindowState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
