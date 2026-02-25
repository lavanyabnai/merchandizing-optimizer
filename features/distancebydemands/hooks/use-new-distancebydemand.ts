import { create } from "zustand";

type NewDistancebydemandState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewDistancebydemand = create<NewDistancebydemandState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
