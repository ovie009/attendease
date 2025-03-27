// ./app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments, usePathname } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { supabase } from '../lib/supabase'; // Adjust path if needed
import { useAuthStore } from '@/stores/useAuthStore';
// import { useAuthStore } from '../lib/useAuthStore'; // Adjust path if needed



export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments(); // Get current route segments
  const pathname = usePathname();

  // Zustand state selectors
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const isFirstLaunch = useAuthStore((state) => state.isFirstLaunch);
  const setIsFirstLaunch = useAuthStore((state) => state.setIsFirstLaunch);
  const signOut = useAuthStore((state) => state.signOut);

  const [initialized, setInitialized] = useState(false); // Track if initial check is done

  // --- Effect 1: Handle Supabase Auth Listener ---
  useEffect(() => {
    // console.log('Setting up Supabase auth listener...');
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // console.log('Auth state changed:', event, !!session);
        setSession(session); // Update Zustand store with the session
        setUser(session?.user ?? null); // Update user derived from session

        // If user signs in during the first launch (on index screen)
        if (event === 'SIGNED_IN' && isFirstLaunch) {
          // console.log('First launch SIGNED_IN detected, setting isFirstLaunch to false');
          setIsFirstLaunch(false);
          // Redirect is handled by Effect 2
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
            setUser(session?.user ?? null);
            setInitialized(true);
            // console.log('Initial getSession check complete.');
        }
    });


    return () => {
      // console.log('Cleaning up Supabase auth listener.');
      authListener?.subscription?.unsubscribe();
    };
    // Run only once on mount, depend on functions from store
  }, [setSession, setUser, setIsFirstLaunch, isFirstLaunch, initialized, signOut]);

  // --- Effect 2: Handle Routing Logic ---
  useEffect(() => {
    if (!initialized) {
      // console.log('Routing effect waiting for initialization...');
      return; // Don't run routing logic until listener is ready
    }
    // console.log('Routing effect running. Initialized:', initialized, 'isFirstLaunch:', isFirstLaunch, 'Has session:', !!session);


    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
	const isIndexScreen = pathname === '/';

    // --- Routing Rules ---

    // 1. First Launch: Always go to 'index' screen
    if (isFirstLaunch) {
      if (!isIndexScreen) {
        // console.log('Routing: First launch, not on index -> /index');
        router.replace('/');
      }
      return; // Stop further checks if it's the first launch
    }

    // --- After First Launch ---

    // 2. No Session: Redirect to 'login' (unless already in auth group or on index)
    if (!session) {
      if (!inAuthGroup && !isIndexScreen) {
        // console.log('Routing: No session, not in auth -> /login');
        router.replace('/(auth)/login');
      }
      return; // Stop further checks if no session
    }

    // 3. Session Exists: Redirect to 'home' (unless already in app group)
    if (session) {
       if (!inAppGroup) {
        // console.log('Routing: Session exists, not in app -> /home');
        router.replace('/(app)/(tabs)/home'); // Default protected route
       }
      return; // Stop further checks if session exists
    }

    // console.log('Routing: No redirect needed.');

  }, [initialized, session, isFirstLaunch, segments, router]); // Re-run when state changes

  // Render loading indicator until initialization is complete
  if (!initialized) {
    // console.log('Rendering loading indicator...');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
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
    }
})