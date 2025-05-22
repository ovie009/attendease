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
// import MQTTService from '@/api/MQTTService';
import { useAppStore } from '@/stores/useAppStore';
import handleLecturers from '@/api/handleLecturers';

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

	// Track if component is currently connecting to MQTT
	const isConnecting = useRef(false);
	// Track connection status
	const isConnected = useRef(false);

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
							setUser({...adminResponse.data, is_admin: true})
						}
					})
					handleLecturers.getById(session?.user?.id).then(lecturerResponse => {
						// console.log("🚀 ~ handleAdmin.getAdminById ~ lecturerResponse:", lecturerResponse)
						if (lecturerResponse.data) {
							setUser({...lecturerResponse.data, is_admin: false})
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
							setUser({...adminResponse.data, is_admin: true})
						}
					})
					handleLecturers.getById(session?.user?.id).then(lecturerResponse => {
						// console.log("🚀 ~ handleAdmin.getAdminById ~ lecturerResponse:", lecturerResponse)
						if (lecturerResponse.data) {
							setUser({...lecturerResponse.data, is_admin: false})
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
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             if (Platform.OS === 'android') {
    //                 // position navigation bar
    //                 await NavigationBar.setPositionAsync('relative');

    //                 // set system navigation bar color
    //                 await NavigationBar.setBackgroundColorAsync(colors.white); 
    //             }
    //         } catch (error: any) {
    //             console.log('navigation bar error', error?.message)
    //         } 
    //     })();
    // }, []);



	// Render loading indicator until initialization is complete
	if (!initialized) {
		// console.log('Rendering loading indicator...');
		return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color="black" />
		</View>
		);
	}

	// Define topics to subscribe to
	const topicsToSubscribe = useMemo(() => [
		'attendease/register', 
		'attendease/session', 
		'attendease/attendance'
	], []);

	// Define the message handler using useCallback to keep its identity stable
	const handleMqttMessage = useCallback((message: string, topic: string) => {
		console.log("[App] Received MQTT Message:");
		console.log("  Topic:", topic);
		console.log("  Message:", message);

		setScannedCardTopic(topic);
		
		if (message.includes('card_uid')) {
		try {
			const payload = JSON.parse(message);
			const payloadObject = JSON.parse(payload);
			setScannedCard(payloadObject);
		} catch (error) {
			console.error("[App] Error parsing MQTT message:", error);
		}
		}

		// Auto-clear scanned card after timeout
		setTimeout(() => {
		setScannedCardTopic(null);
		setScannedCard(null);
		}, 6000);
	}, []);
	
	// useEffect(() => {
	// 	// Connection monitor effect - handles initial connection and reconnection
	// 	let isMounted = true;
		
	// 	// Setup connection health check
	// 	const checkConnectionInterval = setInterval(() => {
	// 	if (isMounted && !isConnecting.current) {
	// 		// If we think we're connected but actually aren't, try to reconnect
	// 		if (isConnected.current && !MQTTService.isConnected()) {
	// 		console.log("[App] Connection health check: Detected disconnection, attempting to reconnect");
	// 		connectMqtt();
	// 		}
	// 	}
	// 	}, 30000); // Check every 30 seconds
		
	// 	// Connect to MQTT
	// 	const connectMqtt = async () => {
	// 	if (isConnecting.current) {
	// 		console.log("[App] Already attempting to connect. Skipping request.");
	// 		return;
	// 	}
		
	// 	isConnecting.current = true;
		
	// 	try {
	// 		console.log("[App] Connecting to MQTT service...");
	// 		await MQTTService.connect(topicsToSubscribe);
			
	// 		if (!isMounted) {
	// 		console.log("[App] Component unmounted after MQTT connect resolved, disconnecting.");
	// 		MQTTService.disconnect();
	// 		return;
	// 		}
			
	// 		isConnected.current = true;
	// 		console.log("[App] MQTT Connected. Setting message callback...");
	// 		MQTTService.setMessageCallback(handleMqttMessage);
	// 	} catch (error) {
	// 		console.error("[App] Error connecting to MQTT:", error);
	// 		isConnected.current = false;
	// 	} finally {
	// 		if (isMounted) {
	// 		isConnecting.current = false;
	// 		}
	// 	}
	// 	};
    
	// 	// Initial connection
	// 	connectMqtt();

	// 	// Cleanup function
	// 	return () => {
	// 		console.log("[App] Effect cleanup running.");
	// 		isMounted = false;
	// 		isConnecting.current = false;
	// 		isConnected.current = false;
	// 		clearInterval(checkConnectionInterval);
			
	// 		console.log("[App] Performing MQTT disconnect in cleanup.");
	// 		MQTTService.disconnect();
	// 	};
	// }, [handleMqttMessage, topicsToSubscribe]);


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
		backgroundColor: '#6F8197',
    }
})