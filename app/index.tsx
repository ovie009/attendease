import React, { useEffect, useState } from 'react'
import { Redirect } from 'expo-router';
import { AllowedRoutes, useAuthStore } from '../stores/useAuthStore'
import { supabase } from "../lib/supabase"
import * as SplashScreen from 'expo-splash-screen';



const Index = () => {

    const [initialRouteName, setInitialRouteName] = useState<AllowedRoutes | null>(null);
    // console.log("🚀 ~ Index ~ initialRouteName:", initialRouteName)
    const [initialParams, setInitialParams] = useState<object>({});

    // Get the necessary functions from your auth store
    const sessionLoading = useAuthStore(state => state.sessionLoading);
    
    const { 
        initializeSession,
        handleSessionChange, 
    } = useAuthStore.getState();

    // // Session handling
    useEffect(() => {
        // Initial session check
        initializeSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                try {
                    if (sessionLoading) return;
                    const sessionResponse = await handleSessionChange({ session })

                    if (sessionResponse?.route) {
                        setInitialRouteName(sessionResponse?.route || '/login');
                        setInitialParams(sessionResponse?.routeParams);
                        SplashScreen.hideAsync()
                    }
                } catch (error) {
                    console.log('error', error)
                }
            }
        );

        return () => subscription.unsubscribe()
    }, [sessionLoading]);

    if (!initialRouteName) return null;
    return <Redirect href={initialRouteName as any} />;
}

export default Index