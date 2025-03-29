// ./app/index.tsx
import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Link, RelativePathString } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

export default function IndexScreen() {

	// --- Declarative Routing ---
	// const isFirstLaunch = useAuthStore((state) => state.isFirstLaunch);
	// console.log("🚀 ~ IndexScreen ~ isFirstLaunch:", isFirstLaunch)
	const setIsFirstLaunch = useAuthStore((state) => state.setIsFirstLaunch);

	useEffect(() => {
		setIsFirstLaunch(false);
	}, [])

	// 1. First Launch? -> Force to index
	// if (isFirstLaunch) {
	// 	// If we are NOT already on the index screen, redirect there.
	// 	// Check segments length to avoid redirecting from the root '/' itself.
	// 	if (segments.length > 0) {
	// 		console.log('[ROUTING] Redirect: First Launch -> /');
	// 		return <Redirect href="/" />;
	// 	}
	// 	// Otherwise, stay on index (render Slot)
	// }

	// // 2. Not First Launch, No Session? -> Force to Auth Group (login)
	// if (!isFirstLaunch && !session) {
	// 	// If we are not already somewhere in the auth group, redirect to login.
	// 	if (!inAuthGroup) {
	// 		console.log('[ROUTING] Redirect: No Session -> /login');
	// 		return <Redirect href="/(auth)/login" />;
	// 	}
	// 	// Otherwise, stay in auth group (render Slot)
	// }

	// // 3. Not First Launch, Has Session? -> Force to App Group (home)
	// if (!isFirstLaunch && session) {
	// 	// If we are not already somewhere in the app group, redirect to home.
	// 	if (!inAppGroup) {
	// 		console.log('[ROUTING] Redirect: Session -> /home');
	// 		return <Redirect href="/(app)/(tabs)/home" />; // Your default authenticated route
	// 	}
	// 	// Otherwise, stay in app group (render Slot)
	// }

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome!</Text>
			<Text>This is the initial startup screen.</Text>
			<Link href={"/(root)/(auth)/login" as RelativePathString} asChild>
				<Button title="Go to Login" />
			</Link>
			<View style={{ marginVertical: 10 }} />
			<Link href={"/(root)/(auth)/signup" as RelativePathString} asChild>
				<Button title="Go to Sign Up" />
			</Link>
			{/* Example alternative button that sets the flag */}
			{/* <Button title="Proceed to Login (Sets Flag)" onPress={handleProceed} /> */}
		</View>
	);
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' },
    title: { fontSize: 24, marginBottom: 20 }
});