import { create } from "zustand";

type NewLocationState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewLocation = create<NewLocationState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
