// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from "../lib/supabase";
import { Session, User } from '@supabase/supabase-js';

export type AllowedRoutes = 
"/home" 
| "/login"
| "/activeAttendanceSession" 
| "/courseDetail" 
| "/courseDetail" 
| "/courseProgress" 
| "/courseAttendance" 
| "/dashboard" 
| "/deviceChangeRequest" 
| "/deviceRegistration" 
| "/forgotPassword" 
| "/lectureDashboard" 
| "/lecturerDeviceAuthorization" 
| "/scanQRCode" 
| "/profile";

interface AuthState {
  user: User | null;
  firstLaunch: boolean | null;
  session: Session | null;
  sessionLoading: boolean;

  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setSessionLoading: (loading: boolean) => void;

  initializeSession: () => Promise<void>;
  handleSessionChange: (params: { session: Session | null }) => Promise<{ route: AllowedRoutes; routeParams: object } | undefined>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
		user: null,
		firstLaunch: null,
		session: null,
		sessionLoading: true,

		setUser: (user) => set({ user }),
		setSession: (session) => set({ session }),
		setSessionLoading: (loading) => set({ sessionLoading: loading }),

		initializeSession: async () => {
			try {
				const { data: {session}, error } = await supabase.auth.getSession();

				if (error) throw error;

				set({ session });
				set({ sessionLoading: false });
			} catch (error) {
				console.log('initialize session error', (error as Error)?.message);
			}
		},

		handleSessionChange: async ({ session }) => {
			const state = get();
			if (state.sessionLoading) return;

			if (session) {
				try {
					console.log("🚀 ~ handleSessionChange: ~ session:", session);
					return {
						route: '/home',
						routeParams: {},
					};
				} catch (error) {
					console.log('Session error:', (error as Error)?.message);
					return {
						route: '/home',
						routeParams: {},
					};
				}
			} else {
				set({ user: null });
				return { route: '/login', routeParams: {} };
			}
		},

		logout: async () => {
			await supabase.auth.signOut();
			set({ user: null, session: null });
		}
		}),
		{
		name: 'auth-storage',
		storage: createJSONStorage(() => AsyncStorage),
		partialize: (state) => ({
			user: state.user,
			firstLaunch: state.firstLaunch,
		})
		}
	)
);