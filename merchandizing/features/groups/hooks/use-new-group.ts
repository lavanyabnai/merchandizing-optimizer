import { create } from "zustand";

type NewGroupState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewGroup = create<NewGroupState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
