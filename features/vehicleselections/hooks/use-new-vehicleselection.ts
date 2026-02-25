import { create } from "zustand";

type NewVehicleselectionState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewVehicleselection = create<NewVehicleselectionState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
