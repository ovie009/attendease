// ./app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
// bottom sheet components
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import InitializeApp from '@/components/InitializeApp';
import { useAppStore } from '@/stores/useAppStore';
import Toast from '@/components/Toast';

const theme = {
	...DefaultTheme,
	colors: {
	  	...DefaultTheme.colors,
		...Colors
	},
};

export default function RootLayout() {

	const toast = useAppStore(state => state.toast);

	return (
		<PaperProvider theme={theme}>
			<SafeAreaProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<BottomSheetModalProvider>
						<Slot />
						<InitializeApp />
					</BottomSheetModalProvider>
					<Toast
						{...toast}
					/>
				</GestureHandlerRootView>
			</SafeAreaProvider>
		</PaperProvider>
	);
}