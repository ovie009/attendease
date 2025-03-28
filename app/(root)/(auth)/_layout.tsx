// ./app/(auth)/_layout.tsx
import React from 'react';
import { Redirect, Slot } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

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
    return <Redirect href="/(app)/(tabs)/home" />; // Redirect to the main app screen
  }

  // Render the child route (login, signup, etc.)
  return <Slot />;
}