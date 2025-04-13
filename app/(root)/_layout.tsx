// ./app/_layout.tsx
import React, { useEffect } from 'react';
import { Slot, useSegments, Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import handleAdmin from '@/api/handleAdmin';
// import { useAuthStore } from '../lib/useAuthStore'; // Adjust path if needed
import * as NavigationBar from 'expo-navigation-bar';
import { colors } from '@/utilities/colors';

export default function RootLayout() {

	const segments = useSegments(); // Get current route segments

	// Zustand state selectors
	const session = useAuthStore((state) => state.session);
	const setSession = useAuthStore((state) => state.setSession);
	const setUser = useAuthStore((state) => state.setUser);
	const isFirstLaunch = useAuthStore((state) => state.isFirstLaunch);
	const signOut = useAuthStore((state) => state.signOut);
	const initialized = useAuthStore((state) => state.initialized); // Use store's initialized flag
	const setInitialized = useAuthStore((state) => state.setInitialized);

	// --- Effect 1: Handle Supabase Auth Listener ---
	useEffect(() => {
		// console.log('Setting up Supabase auth listener...');
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				// console.log('Auth state changed:', event, !!session);
				setSession(session); // Update Zustand store with the session
				if (session?.user) {
					handleAdmin.getAdminById(session?.user?.id).then(adminResponse => {
						console.log("🚀 ~ handleAdmin.getAdminById ~ adminResponse:", adminResponse)
						if (adminResponse.data) {
							setUser({...adminResponse.data, isAdmin: true})
						}
					})
				} else {
					setUser(null)
				}
				// If user signs out, ensure isFirstLaunch doesn't block login screen
				if (event === 'SIGNED_OUT') {
					// Clear store explicitly (though listener also sets session to null)
					signOut();
					// Redirect is handled by Effect 2
				}

				// Mark initialization complete after first auth event (or initial null session)
				if (!initialized) {
					setInitialized(true);
					// console.log('Auth listener initialized.');
				}
			}
		);

		// Initial session check (sometimes onAuthStateChange doesn't fire immediately on load)
		// Supabase client's internal storage usually handles this, but belt-and-suspenders
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (!initialized) { // Only if listener hasn't fired yet
				// console.log('Initial getSession result:', !!session);
				setSession(session);
				if (session?.user) {
					handleAdmin.getAdminById(session?.user?.id).then(adminResponse => {
						console.log("🚀 ~ handleAdmin.getAdminById ~ adminResponse:", adminResponse)
						if (adminResponse.data) {
							setUser({...adminResponse.data, isAdmin: true})
						}
					})
				} else {
					setUser(null)
				}
				setInitialized(true);
				// console.log('Initial getSession check complete.');
			}
		});


		return () => {
			// console.log('Cleaning up Supabase auth listener.');
			authListener?.subscription?.unsubscribe();
		};
		// Run only once on mount, depend on functions from store
	}, []);

	// useEffect(() => {
	// 	if (!session) return;

	// 	(async () => {
	// 		// console.log('Session changed:', session);
	// 		// const { data: { user } } = await supabase.auth.getUser();
	// 		// setUser(user);
	// 		try {
	// 			const adminResponse = await handleAdmin.getAdminById(session.user.id);
	// 			console.log("🚀 ~ adminResponse:", adminResponse)

	// 		} catch (error: any) {
	// 			console.log('error', error?.message)
	// 		}
	// 	})()

	// }, [session])

    // set system navigation bar color
    useEffect(() => {
        (async () => {
            try {
                if (Platform.OS === 'android') {
                    // position navigation bar
                    await NavigationBar.setPositionAsync('relative');

                    // set system navigation bar color
                    await NavigationBar.setBackgroundColorAsync(colors.white); 
                }
                    console.log("🚀 ~ colors.white:", colors.white)
            } catch (error: any) {
                console.log('navigation bar error', error?.message)
            } 
        })();
    }, []);

	// Render loading indicator until initialization is complete
	if (!initialized) {
		// console.log('Rendering loading indicator...');
		return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color="black" />
		</View>
		);
	}



	// Hide splash screen now that we're initialized
    // SplashScreen.hideAsync();

	const inAuthGroup = segments[1] === '(auth)';
	const inAppGroup = segments[1] === '(app)';

	// --- Declarative Routing ---

	// 1. First Launch? -> Force to index
	if (isFirstLaunch) {
        // If we are NOT already on the index screen, redirect there.
        // Check segments length to avoid redirecting from the root '/' itself.
		if (segments.length > 0) {
			return (
				<SafeAreaProvider>
					<Slot />
				</SafeAreaProvider>
			);
		}
        // Otherwise, stay on index (render Slot)
	}

	// 2. Not First Launch, No Session? -> Force to Auth Group (login)
	if (!isFirstLaunch && !session) {
		// If we are not already somewhere in the auth group, redirect to login.
		if (!inAuthGroup) {
			// return router.replace("/(root)/(auth)/login")
			return <Redirect href={'/(root)/(auth)/login'} />
		}
        // Otherwise, stay in auth group (render Slot)
	}

	// 3. Not First Launch, Has Session? -> Force to App Group (home)
	if (!isFirstLaunch && session) {
		// If we are not already somewhere in the app group, redirect to home.
		if (!inAppGroup) {
			// return router.replace("/(root)/(app)/(tabs)/home");
			return <Redirect href={'/(root)/(app)/(tabs)/home'} />
		}
        // Otherwise, stay in app group (render Slot)
	}

	// Render the child route using Slot once initialized
	// console.log('Rendering Slot...');
	return (
		<SafeAreaProvider>
			<Slot />
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
		backgroundColor: 'white',
    }
})