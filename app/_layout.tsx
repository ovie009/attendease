// ./app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
// bottom sheet components
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const theme = {
	...DefaultTheme,
	colors: {
	  	...DefaultTheme.colors,
		...Colors
	},
};

export default function RootLayout() {
	return (
		<PaperProvider theme={theme}>
			<SafeAreaProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<BottomSheetModalProvider>
						<Slot />
					</BottomSheetModalProvider>
				</GestureHandlerRootView>
			</SafeAreaProvider>
		</PaperProvider>
	);
}