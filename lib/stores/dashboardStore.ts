import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  // Fake data toggle state
  isFakeDataEnabled: boolean;
  
  // Actions
  toggleFakeData: () => void;
  setFakeDataEnabled: (enabled: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // Initial state
      isFakeDataEnabled: false,
      
      // Actions
      toggleFakeData: () => {
        set((state) => ({ 
          isFakeDataEnabled: !state.isFakeDataEnabled 
        }));
      },
      
      setFakeDataEnabled: (enabled: boolean) => {
        set({ isFakeDataEnabled: enabled });
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        isFakeDataEnabled: state.isFakeDataEnabled,
      }),
    }
  )
); 