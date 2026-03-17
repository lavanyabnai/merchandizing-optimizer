import { create } from "zustand";

type useNewvehicleTypeState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewvehicleType = create<useNewvehicleTypeState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
