// ./lib/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isFirstLaunch: boolean; // Defaults to true
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setIsFirstLaunch: (isFirst: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      isFirstLaunch: true, // Initialize as true
      setSession: (session) => set(() => ({ session })),
      setUser: (user) => set(() => ({ user })),
      setIsFirstLaunch: (isFirst) => set(() => ({ isFirstLaunch: isFirst })),
      signOut: () => set(() => ({ session: null, user: null })), // Clear session/user on sign out
    }),
    {
      name: 'auth-storage', // Unique name for storage
      storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for persistence
      partialize: (state) => ({
          // Only persist isFirstLaunch. Session comes from Supabase listener/storage.
          // Re-evaluation: Let's persist session too for quicker initial checks,
          // but rely on the listener for the most up-to-date state.
          isFirstLaunch: state.isFirstLaunch,
          session: state.session,
        }),
      // Optional: Handle hydration errors if necessary
      // onRehydrateStorage: (state) => {
      //   console.log("Hydration finished");
      //   return (state, error) => {
      //     if (error) {
      //       console.error("An error happened during hydration", error);
      //     } else {
      //       // You could potentially trigger session refresh here if needed
      //     }
      //   };
      // },
    }
  )
);