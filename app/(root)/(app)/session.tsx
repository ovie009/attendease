// ./app/(app)/session.tsx
import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import handleSettings from '@/api/handleSettings';
import { Setting } from '@/types/api';
import { useAppStore } from '@/stores/useAppStore';
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading';
import InterText from '@/components/InterText';
import CustomButton from '@/components/CustomButton';
import { HEIGHT } from '@/utilities/dimensions';
import { useRouter } from 'expo-router';
import { getLoadingData } from '@/utilities/getLoadingData';
import SettingListItem from '@/components/SettingListItem';
import moment from 'moment';
import Flex from '@/components/Flex';
import { colors } from '@/utilities/colors';

type SettingListItemProps = Setting & {
	is_loading?: boolean | undefined;
}

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

	const data = useMemo((): SettingListItemProps[] => {
		if (dataLoading.settings) {
			return getLoadingData(['key'], ['loading'])
		}

		return settings;
	}, [settings, dataLoading]);
	console.log("🚀 ~ data ~ data:", data)

	const getCtaText = useCallback((): string => {
		if (!settings) return '';

		const semester = settings.find((setting) => setting.key === 'semester');

		if (semester?.value === '1') {
			return 'Start next semester';
		} else if (semester?.value === '2') {
			return 'Start next session';
		}
		return '';
	}, [settings]);

	const handleCTA = useCallback(async (): Promise<void> => {
		if (!settings) return;

		const semester = settings.find((setting) => setting.key === 'semester');

		if (semester?.value === '1') {
			router.push('/(root)/(app)/(session)/StartNewSemester')
			return;
		} else if (semester?.value === '2') {
			router.push('/(root)/(app)/(session)/StartNewSession')
			return;
		}
	}, [settings]);

	const getDisabledButton = useCallback((): boolean => {
		if (!settings) return true;
		const endOfSemester = settings.find((setting) => setting.key === 'end_of_semester');

		if (moment(endOfSemester?.value).isAfter(moment())) {
			return true
		} 
		return false;
	}, [settings]);
	

	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
		>
			{!dataLoading.settings && data.length === 0 && (
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
			<Flex
				flex={1}
			>
				{data.map((setting) => (
					<SettingListItem
						key={setting.id}
						settingKey={setting?.key}
						isLoading={setting?.is_loading}
						type={setting?.type}
						value={setting?.key === 'semester' ? moment(setting.value, 'd').format('do') : setting?.value}
					/>
				))}
			</Flex>
			{!dataLoading.settings && settings.length > 0 && (
				<Flex
					width={'100%'}
					gap={20}
					alignItems='center'
				>
					{getDisabledButton() && (
						<InterText
							fontSize={12}
							color={colors.subtext}
							textAlign='center'
						>
							Action can be cariied out after the end of semester
						</InterText>
					)}
					<CustomButton
						text={getCtaText()}
						onPress={handleCTA}
						// disabled={getDisabledButton()}
					/>
				</Flex>
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
		paddingBottom: 40,
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