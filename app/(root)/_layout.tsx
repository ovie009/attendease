// ./app/_layout.tsx
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Slot, useSegments, Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import handleAdmin from '@/api/handleAdmin';
// import { useAuthStore } from '../lib/useAuthStore'; // Adjust path if needed
import * as NavigationBar from 'expo-navigation-bar';
import { colors } from '@/utilities/colors';
import MQTTService from '@/api/MQTTService';
import { useAppStore } from '@/stores/useAppStore';

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

	const {
		setScannedCard,
		setScannedCardTopic,
	} = useAppStore.getState();

    const isConnecting = useRef<boolean>(false); // Prevent duplicate connect calls

	// --- Effect 1: Handle Supabase Auth Listener ---
	useEffect(() => {
		// console.log('Setting up Supabase auth listener...');
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				// console.log('Auth state changed:', event, !!session);
				setSession(session); // Update Zustand store with the session
				if (session?.user) {
					handleAdmin.getAdminById(session?.user?.id).then(adminResponse => {
						// console.log("🚀 ~ handleAdmin.getAdminById ~ adminResponse:", adminResponse)
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
						// console.log("🚀 ~ handleAdmin.getAdminById ~ adminResponse:", adminResponse)
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

	// Define the message handler using useCallback to keep its identity stable
	const handleMqttMessage = useCallback((message: string, topic: string) => {
		console.log("[App] Received MQTT Message:");
		console.log("  Topic:", topic);
		console.log("  Message:", message);

		setScannedCardTopic(topic);
		// setSc
		if (message.includes('card_uid')) {
			// const processedMessage = message.split('/').join('');
			const payload = JSON.parse(message);
			const payloadObject = JSON.parse(payload);
			setScannedCard(payloadObject)
		}

		setTimeout(() => {
			setScannedCardTopic(null)
			setScannedCard(null)
		}, 6000)
		// Add your logic to handle the message based on topic/content
		// handleScannedCard(topic, message); // Your original handler
	}, []); // Add dependencies if handleScannedCard relies on props/state

	const topicsToSubscribe = useMemo(() => ['attendease/register', 'attendease/session', 'attendease/attendance'], [])


	useEffect(() => {
		let isMounted = true;
		const connectAndSetupMqtt = async () => {
			// ... (isConnecting check, etc.) ...
	
			try {
				await MQTTService.connect(topicsToSubscribe);
	
				if (!isMounted) {
					console.log("[App] Component unmounted after MQTT connect resolved, disconnecting.");
					MQTTService.disconnect();
					return;
				}
	
				// *** NEW: Subscribe AFTER successful connect await ***
				if (MQTTService.connected) { // Double-check connection state
					console.log("[App] MQTT Connected. Setting message callback and subscribing...");
					MQTTService.setMessageCallback(handleMqttMessage);
					topicsToSubscribe.forEach(topic => MQTTService.subscribe(topic));
				} else {
					 // This case shouldn't happen if connect resolved successfully, but good to log
					 console.warn("[App] MQTT connect promise resolved, but service is not marked as connected. Cannot subscribe.");
				}
	
			} catch (error) {
				// ... error handling ...
			} finally {
				 if (isMounted) {
					 isConnecting.current = false;
				 }
			}
		};
	
		connectAndSetupMqtt();
	
		return () => {
			console.log("[App] Effect cleanup running.");
			isMounted = false;
			isConnecting.current = false;
			// Consider delaying disconnect slightly ONLY if debugging race conditions,
			// but generally direct disconnect is correct here.
			// setTimeout(() => { // TEMPORARY DEBUGGING ONLY
			console.log("[App] Performing MQTT disconnect in cleanup.");
			MQTTService.disconnect();
			// MQTTService.setMessageCallback(null);
			// }, 0);
		};
	}, [handleMqttMessage]); // <-- Use the stable value



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
		// console.log("🚀 ~ RootLayout ~ session:", session)
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