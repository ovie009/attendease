// ./app/(auth)/_layout.tsx
import React from 'react';
import { Redirect, RelativePathString, Slot, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import InterText from '@/components/InterText';

export default function AuthLayout() {
    const session = useAuthStore((state) => state.session);
    const isFirstLaunch = useAuthStore((state) => state.isFirstLaunch);

    // If it's the first launch, the root layout handles redirecting to index
    if (isFirstLaunch) {
        // Should be handled by root, but as a safety net
        return <Redirect href="/" />;
    }

    // If the user is signed in, redirect away from the auth group
    if (session) {
      return <Redirect href={"/(app)/(tabs)/home" as RelativePathString} />; // Redirect to the main app screen
    }

    // Render the child route (login, signup, etc.)
    // return <Slot />;

	return (
		<Stack
			screenOptions={{
				headerShadowVisible: false,
			}}
		>
			<Stack.Screen 
				name="login" 
				options={{ 
					title: "", 
					headerShown: false, 
					headerShadowVisible: false,				
				}}
			/>
			<Stack.Screen 
				name="signup" 
				options={{ 
					title: "", 
					headerBackVisible: false,
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Signup</InterText>,
					// headerShown: true, 
					headerShadowVisible: false,				
				}}
			/>
			<Stack.Screen 
				name="forgotPassword" 
				options={{ 
					title: "", 
					headerShown: true, 
					headerShadowVisible: false,				
				}}
			/>
			<Stack.Screen 
				name="scanQrCode" 
				options={{ 
					headerShown: false, 
				}}
			/>
		</Stack>
	)
}