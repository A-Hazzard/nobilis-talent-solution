import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DashboardState = {
  // Dashboard state (keeping minimal structure for future use)
  initialized: boolean;
  
  // Actions
  setInitialized: (initialized: boolean) => void;
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // Initial state
      initialized: false,
      
      // Actions
      setInitialized: (initialized: boolean) => {
        set({ initialized });
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        initialized: state.initialized,
      }),
    }
  )
); 