// ./app/_layout.tsx 
import 'react-native-get-random-values';      // you already have this
import React, { useEffect } from 'react';
import { Slot, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
// bottom sheet components
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import InitializeApp from '@/components/InitializeApp';
import { useAppStore } from '@/stores/useAppStore';
import Toast from '@/components/Toast';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import PageLoader from '@/components/PageLoader';
import { StatusBar } from 'expo-status-bar';

const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		...Colors
	},
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

	const toast = useAppStore(state => state.toast);
	const loadingPages = useAppStore(state => state.loadingPages);

	const pathname = usePathname()
	// console.log("🚀 ~ RootLayout ~ pathname:", pathname)

	const [loaded, error] = useFonts({
		'inter-bold': require('../assets/fonts/Inter_18pt-Bold.ttf'),
		'inter-medium': require('../assets/fonts/Inter_18pt-Medium.ttf'),
		'inter-regular': require('../assets/fonts/Inter_18pt-Regular.ttf'),
		'inter-semibold': require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
	});
	
	useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync();
		}
	}, [loaded, error]);
	
	if (!loaded && !error) {
		return null;
	}

	return (
		<PaperProvider theme={theme}>
			<SafeAreaProvider>
				{/* <StatusB */}
				{/* <StatusBar backgroundColor='white' /> */}
				<GestureHandlerRootView style={{ flex: 1 }}>
					<BottomSheetModalProvider>
						<Slot />
						<InitializeApp />
					</BottomSheetModalProvider>
					<Toast
						{...toast}
					/>
					<PageLoader 
						isLoading={loadingPages.length !== 0 && (loadingPages[loadingPages.length - 1] === pathname)} 
					/>
				</GestureHandlerRootView>
			</SafeAreaProvider>
		</PaperProvider>
	);
}