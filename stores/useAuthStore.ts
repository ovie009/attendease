// ./stores/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/api';
import { Semester } from '@/types/general';
import { supabase } from '@/lib/supabase';

interface AuthState {
	session: Session | null;
	semester: Semester,
	numberOfSemesterWeeks: number;
	academicSession: string,
	user: User | null;
	isFirstLaunch: boolean; // Defaults to true
	initialized: boolean; // Track if initial auth check is done
	setNumberOfSemesterWeeks: (value: number ) => void;
	setSemester: (value: Semester ) => void;
	setAcademicSession: (value: string ) => void;
	setSession: (session: Session | null) => void;
	setUser: (user: User | null) => void;
	setIsFirstLaunch: (isFirst: boolean) => void;
	setInitialized: (init: boolean) => void;
	signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
		session: null,
		semester: 1,
		academicSession: '',
		numberOfSemesterWeeks: 13,
		user: null,
		isFirstLaunch: true, // Initialize as true
		initialized: false, // Start as false
		setNumberOfSemesterWeeks: (value) => set(() => ({ numberOfSemesterWeeks: value })),
		setSemester: (value) => set(() => ({ semester: value })),
		setAcademicSession: (value) => set(() => ({ academicSession: value })),
		setSession: (session) => set(() => ({ session })),
		setUser: (user) => set(() => ({ user })),
		setIsFirstLaunch: (isFirst) => set(() => ({ isFirstLaunch: isFirst })),
		setInitialized: (init) => set({ initialized: init }),
		signOut: async () => {
			try {
				const {error} = await supabase.auth.signOut();
				console.log("🚀 ~ error:", error)
				if (error) {
					throw error
				}
			} catch (error) {
				console.log("🚀 ~ error:", error)
				throw error;				
			}
		}
		// signOut: () => set(() => ({ session: null, user: null })), // Clear session/user on sign out
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
      		user: state.user,
			semester: state.semester,
			academicSession: state.academicSession,
   		 }),
		onRehydrateStorage: () => (state) => {
			// Set initialized to true once persisted state is loaded
			// This happens AFTER the initial getSession call in _layout might run
			// but it's a good indicator that persisted data is ready.
			if (state) state.setInitialized(true);
			console.log("Zustand hydration finished.");
		}
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