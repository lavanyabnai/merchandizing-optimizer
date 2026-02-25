import { create } from "zustand";

type NewEventState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewEvent = create<NewEventState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
