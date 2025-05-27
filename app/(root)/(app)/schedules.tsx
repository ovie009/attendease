// ./app/(app)/session.tsx
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Key } from '@/types/general';
import handleSettings from '@/api/handleSettings';
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading';
import { useAppStore } from '@/stores/useAppStore';

const Schedules = () => {

	const {
		displayToast,
	} = useAppStore.getState();

	const [acdemicSession, setAcademicSession] = useState<string>('')

	const [dataLoading, setDataLoading] = useState<{schedules: boolean, academicSession: boolean}>({
		academicSession: true,
		schedules: true,
	});


	useEffect(() => {
		const fetchSetting = async  (key: Key) => {
			try {
				const settingResponse = await handleSettings.getByKey(key);

				if (settingResponse.data) {
					setAcademicSession(settingResponse.data.value);
				} else {
					handleDisableDataLoading('schedules', setDataLoading);
				}

				handleDisableDataLoading('academicSession', setDataLoading);
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}

		fetchSetting('academic_session')
	}, [])

	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
		>
		</ScrollView>
	)
}

export default Schedules

const styles = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		backgroundColor: 'white',
	}
})