// ./app/(app)/_layout.tsx
import React from 'react';
import { ExternalPathString, Redirect, RelativePathString, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/utilities/colors';

export default function AppLayout() {
    const session = useAuthStore((state) => state.session);
    const isFirstLaunch = useAuthStore((state) => state.isFirstLaunch);

	// console.log("🚀 ~ AppLayout ~ segments:", segments)

    // If it's the first launch, the root layout handles redirecting to index
    if (isFirstLaunch) {
        // Should be handled by root, but as a safety net
      return <Redirect href={"/" as ExternalPathString} />;
    }

    // If the user is not signed in, redirect away from the app group
    if (!session) {
      // Redirect to the login screen
      return <Redirect href={"/(root)/(auth)/login" as RelativePathString} />;
    }

    // Render the child route within the authenticated group (tabs, settings)
    return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen 
				name="session" 
				options={{
					headerBackVisible: false,
					headerBackTitle: ""
				}} 
			/>
			<Stack.Screen 
				name="colleges"
				options={{
					title: "Colleges",
					headerTintColor: colors.black,
					headerBackTitle: "Settings"
				}} 
			/>
			<Stack.Screen 
				name="courses"
				options={{
					headerBackTitle: ""
				}} 
			/>
			<Stack.Screen 
				name="departments"
				options={{
					headerBackTitle: ""
				}} 
			/>
		</Stack>
	);
}