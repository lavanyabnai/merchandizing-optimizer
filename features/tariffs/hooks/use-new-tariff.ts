import { create } from "zustand";

type NewTariffState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewTariff = create<NewTariffState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
