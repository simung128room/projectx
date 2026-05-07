import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  cart: any[];
  theme: 'light' | 'dark';
  addToCart: (item: any) => void;
  clearCart: () => void;
  toggleTheme: () => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      theme: 'light',
      addToCart: (item) => set({ cart: [...get().cart, item] }),
      clearCart: () => set({ cart: [] }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      resetAll: () => set({ cart: [], theme: 'light' }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => null,
          removeItem: () => null,
        };
      }),
      version: 1,
    }
  )
);
