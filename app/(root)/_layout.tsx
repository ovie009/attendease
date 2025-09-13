// ./app/_layout.tsx
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Slot, useSegments, Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import handleAdmin from '@/api/handleAdmin';
import MQTTService from '@/api/MQTTService';
import { useAppStore } from '@/stores/useAppStore';
import handleLecturers from '@/api/handleLecturers';
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from 'react-native-reanimated';
import { AccountType } from '@/types/general';
import handleStudents from '@/api/handleStudents';
import { Session } from '@supabase/supabase-js';

configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

export default function RootLayout() {
	const segments = useSegments();

	// Zustand state selectors
	const session = useAuthStore((state) => state.session);
	const setSession = useAuthStore((state) => state.setSession);
	const user = useAuthStore((state) => state.user);
	const setUser = useAuthStore((state) => state.setUser);
	const isFirstLaunch = useAuthStore((state) => state.isFirstLaunch);
	const initialized = useAuthStore((state) => state.initialized);
	const setInitialized = useAuthStore((state) => state.setInitialized);

	const { setScannedCard, setScannedCardTopic } = useAppStore.getState();

	// Track MQTT connection state
	const isConnecting = useRef(false);
	const isConnected = useRef(false);

	/**
	 * Helper: Load profile based on account type
	 */
	const loadUserProfile = useCallback(async (supabaseSession: Session) => {
		if (!supabaseSession?.user?.user_metadata?.account_type) {
			setUser(null);
			return;
		}

		const { id } = supabaseSession.user;
		const type = supabaseSession.user.user_metadata.account_type;

		try {
			if (type === AccountType.Admin) {
				const res = await handleAdmin.getAdminById(id);
				if (res.data) setUser({ ...res.data, is_admin: true, account_type: type });
			} else if (type === AccountType.Lecturer) {
				const res = await handleLecturers.getById(id);
				if (res.data) setUser({ ...res.data, is_admin: false, account_type: type });
			} else if (type === AccountType.Student) {
				const res = await handleStudents.getById(id);
				if (res.data) setUser({ ...res.data, is_admin: false, account_type: type });
			}
		} catch (err:any) {
			console.error('Error loading user profile:', err);
			setUser(null);
		}
	}, [setUser]);

	/**
	 * Supabase auth listener
	 */
	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, supabaseSession) => {
				// console.log("🚀 ~ RootLayout ~ supabaseSession:", supabaseSession)
				// console.log('[AuthStateChange]', event);

				if (supabaseSession) {
					setSession(supabaseSession);
					await loadUserProfile(supabaseSession);
					setInitialized(true);
				} else {
					setUser(null);
					setInitialized(true);
					setSession(null);
				}

				// if (event === 'SIGNED_OUT') {
				// }

				// if (!supabaseSession) {
				// 	setSession(null);
				// 	setUser(null);
				// }
			}
		);

		// Initial session check
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			setSession(session);
			if (session) {
				await loadUserProfile(session);
			} else {
				setUser(null);
			}
			setInitialized(true);
		});

		return () => {
			authListener?.subscription?.unsubscribe();
		};
	}, [loadUserProfile, setSession, setUser, setInitialized]);

	/**
	 * MQTT Message handler
	 */
	const handleMqttMessage = useCallback((message: string, topic:string) => {
		console.log('[MQTT] Topic:', topic, 'Message:', message);
		setScannedCardTopic(topic);

		if (message.includes('card_uid')) {
			try {
				const payloadObject = JSON.parse(JSON.parse(message));
				setScannedCard(payloadObject);
			} catch (error) {
				console.error('[MQTT] Error parsing message:', error);
			}
		}

		setTimeout(() => {
			setScannedCardTopic(null);
			setScannedCard(null);
		}, 6000);
	}, []);

	/**
	 * MQTT Connection effect
	 */
	useEffect(() => {
		let isMounted = true;

		const topics = ['attendease/register', 'attendease/session', 'attendease/attendance'];

		const connectMqtt = async () => {
			if (isConnecting.current) return;

			isConnecting.current = true;
			try {
				await MQTTService.connect(topics);
				if (!isMounted) {
					MQTTService.disconnect();
					return;
				}
				isConnected.current = true;
				MQTTService.setMessageCallback(handleMqttMessage);
			} catch (error) {
				console.error('[MQTT] Connection error:', error);
				isConnected.current = false;
			} finally {
				if (isMounted) isConnecting.current = false;
			}
		};

		// Connection health check
		const interval = setInterval(() => {
			if (isMounted && !isConnecting.current && isConnected.current && !MQTTService.isConnected()) {
				connectMqtt();
			}
		}, 30000);

		connectMqtt();

		return () => {
			isMounted = false;
			isConnecting.current = false;
			isConnected.current = false;
			clearInterval(interval);
			MQTTService.disconnect();
		};
	}, [handleMqttMessage]);

	/**
	 * Render loading screen until auth is initialized
	 */
	if (!initialized) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="black" />
			</View>
		);
	}

	/**
	 * Routing logic
	 */
	const inAuthGroup = segments[1] === '(auth)';
	const inAppGroup = segments[1] === '(app)';

	if (isFirstLaunch) {
		return (
			<SafeAreaProvider>
				<Slot />
			</SafeAreaProvider>
		);
	}

	if (!isFirstLaunch && !session) {
		if (!inAuthGroup) return <Redirect href={'/(root)/(auth)/login'} />;
	}

	if (!isFirstLaunch && session) {
		if (!inAppGroup) {
			if (user?.account_type === AccountType.Lecturer && !user.pin) {
				return <Redirect href={'/completeRegistration'} />;
			}
			return <Redirect href={'/(root)/(app)/(tabs)/home'} />;
		}
	}

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
	},
});
