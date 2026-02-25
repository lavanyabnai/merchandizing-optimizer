import { create } from "zustand";

type NewBomcomponentState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewBomcomponent = create<NewBomcomponentState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
