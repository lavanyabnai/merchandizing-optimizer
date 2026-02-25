import { create } from "zustand";

type NewDemandforecastState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewDemandforecast = create<NewDemandforecastState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
