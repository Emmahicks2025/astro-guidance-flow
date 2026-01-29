import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalkthroughState {
  hasCompletedWalkthrough: boolean;
  isWalkthroughOpen: boolean;
  setWalkthroughComplete: () => void;
  openWalkthrough: () => void;
  closeWalkthrough: () => void;
  resetWalkthrough: () => void;
}

export const useWalkthroughStore = create<WalkthroughState>()(
  persist(
    (set) => ({
      hasCompletedWalkthrough: false,
      isWalkthroughOpen: false,
      setWalkthroughComplete: () => set({ hasCompletedWalkthrough: true, isWalkthroughOpen: false }),
      openWalkthrough: () => set({ isWalkthroughOpen: true }),
      closeWalkthrough: () => set({ isWalkthroughOpen: false }),
      resetWalkthrough: () => set({ hasCompletedWalkthrough: false, isWalkthroughOpen: false }),
    }),
    {
      name: 'astroguru-walkthrough',
    }
  )
);
