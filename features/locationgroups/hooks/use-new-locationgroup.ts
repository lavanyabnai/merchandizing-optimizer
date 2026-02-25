import { create } from "zustand";

type NewLocationgroupState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewLocationgroup = create<NewLocationgroupState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
