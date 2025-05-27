// ./app/(app)/session.tsx
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import handleSettings from '@/api/handleSettings';
import { Setting } from '@/types/api';
import { useAppStore } from '@/stores/useAppStore';
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading';
import InterText from '@/components/InterText';
import CustomButton from '@/components/CustomButton';
import { HEIGHT } from '@/utilities/dimensions';
import { useRouter } from 'expo-router';

const Session = () => {

	const router = useRouter()

	const [settings, setSettings] = useState<Setting[]>([]);

	const [dataLoading, setDataLoading] = useState<{settings: boolean}>({
		settings: true
	})

	const {
		displayToast
	} = useAppStore.getState();

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const settingsResponse = await handleSettings.getAll();
				console.log("🚀 ~ fetchSettings ~ settingsResponse:", settingsResponse)

				setSettings(settingsResponse.data);

				handleDisableDataLoading('settings', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}

		fetchSettings()
	}, [])

	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
		>
			{!dataLoading.settings && settings.length === 0 && (
				<View style={styles.noSettingsWrapper}>
					<InterText
						fontSize={16}
						lineHeight={19}
						fontWeight={500}
					>
						No session settings added
					</InterText>
					<CustomButton
						text='Add session settings'
						onPress={() => {
							router.push('/(root)/(app)/(session)/AddSession')
						}}
					/>
				</View>
			)}
		</ScrollView>
	)
}

export default Session

const styles = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		backgroundColor: 'white',
		paddingTop: 30,
		paddingHorizontal: 20,
	},
	noSettingsWrapper: {
		height: HEIGHT/3,
		width: '100%',
		// paddingHorizontal: 20,
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		gap: 16
	}
})