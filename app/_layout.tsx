import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
// import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppState } from 'react-native';
import {
	SafeAreaView,
} from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Auto refresh setup for Supabase
AppState.addEventListener('change', (state) => {
	if (state === 'active') {
		supabase.auth.startAutoRefresh()
	} else {
		supabase.auth.stopAutoRefresh()
	}
})


export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	if (!loaded) {
		return null;
	}

	return (
		<SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
			<Slot />
		</SafeAreaView>
	) 
}
