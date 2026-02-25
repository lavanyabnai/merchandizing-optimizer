import { create } from "zustand";

type NewProcessingtimeState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewProcessingtime = create<NewProcessingtimeState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
