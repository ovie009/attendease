// ./app/(app)/_layout.tsx
import React from 'react';
import { Redirect, Slot } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AppLayout() {
  const session = useAuthStore((state) => state.session);
  const isFirstLaunch = useAuthStore((state) => state.isFirstLaunch);

  // If it's the first launch, the root layout handles redirecting to index
  if (isFirstLaunch) {
      // Should be handled by root, but as a safety net
    return <Redirect href="/" />;
  }

  // If the user is not signed in, redirect away from the app group
  if (!session) {
    // Redirect to the login screen
    return <Redirect href="/(root)/(auth)/login" />;
  }

  // Render the child route within the authenticated group (tabs, settings)
  return <Slot />;
}