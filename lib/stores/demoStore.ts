import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DemoStore = {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
};

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      isDemoMode: false,
      toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
      setDemoMode: (enabled: boolean) => set({ isDemoMode: enabled }),
    }),
    {
      name: 'demo-mode-storage',
    }
  )
); 