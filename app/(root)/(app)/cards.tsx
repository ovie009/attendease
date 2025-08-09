// ./app/(app)/courses.tsx
import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { colors } from '@/utilities/colors'
import { FlashList, ListRenderItem } from '@shopify/flash-list'
import Input from '@/components/Input'
import loadingData from '@/data/loading_data.json';
import CardListItem from '@/components/CardListItem'
import { UserType } from '@/types/general'
import handleRfidCards from '@/api/handleRfidCards'
import { Lecturer, RfidCard, Student } from '@/types/api'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import handleStudents from '@/api/handleStudents'
import handleLecturers from '@/api/handleLecturers'
import { getLoadingData } from '@/utilities/getLoadingData'


type CardListItemObject = RfidCard & {
	id: string,
	is_loading?: boolean | undefined;
}

type DataItem = RfidCard & {lecturer?: Lecturer, student?: Student, is_loading?: boolean}

const Cards = () => {

	const {
		displayToast,
	} = useAppStore.getState();

	const [searchQuery, setSearchQuery] = useState<string>('')
	const [dataloading, setDataLoading] = useState<{rfidCards: boolean, students: boolean, lecturers: boolean}>({
		rfidCards: true,
		students: true,
		lecturers: true,
	});

	const [cardUids, setCardUids] = useState<Array<string>>([])
	// console.log("🚀 ~ Cards ~ cardUids:", cardUids)
	const [rfidCards, setRfidCards] = useState<CardListItemObject[] | []>([])
	const [students, setStudents] = useState<Student[]>([]);
	// console.log("🚀 ~ Cards ~ students:", students)
	const [lecturers, setLecturers] = useState<Lecturer[]>([]);
	// console.log("🚀 ~ Cards ~ lecturers:", lecturers)

	useEffect(() => {
		const fetchAllCards = async (): Promise<void> => {
			try {
				const rfidCardResponse = await handleRfidCards.getAll();
				setRfidCards(rfidCardResponse.data)

				setCardUids(rfidCardResponse.data.map(item => item.card_uid));

				if (rfidCardResponse.data.length === 0) {
					handleDisableDataLoading('lecturers', setDataLoading)
					handleDisableDataLoading('students', setDataLoading)
				}
				
				handleDisableDataLoading('rfidCards', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchAllCards()
	}, [])

	useEffect(() => {
		if (cardUids.length === 0) return;

		const fetchStudents = async (): Promise<void> => {
			try {
				const studentsResponse = await handleStudents.getByRfids(cardUids)
				console.log("🚀 ~ fetchStudents ~ studentsResponse:", studentsResponse)

				setStudents(studentsResponse.data)

				handleDisableDataLoading('students', setDataLoading)
			} catch (error:any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchStudents()
	}, [cardUids])

	useEffect(() => {
		if (cardUids.length === 0) return;

		const fetchLecturers = async (): Promise<void> => {
			try {
				const lecturersResponse = await handleLecturers.getByRfids(cardUids)
				console.log("🚀 ~ fetchLecturers ~ lecturersResponse:", lecturersResponse)

				setLecturers(lecturersResponse.data)

				handleDisableDataLoading('lecturers', setDataLoading)
			} catch (error:any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchLecturers()
	}, [cardUids])

	const data = useMemo((): DataItem[] => {
		if (dataloading.rfidCards || dataloading.lecturers || dataloading.students) return getLoadingData([''], ['']);

		return rfidCards.map(item => {
			return {
				...item,
				lecturer: lecturers.find(lecturer => lecturer.rfid === item.card_uid),
				student: students.find(student => student.rfid === item.card_uid),
			}
		})
	}, [dataloading.lecturers, dataloading.students, dataloading.rfidCards, rfidCards, searchQuery, lecturers, students]);
	console.log("🚀 ~ Cards ~ data:", data)

	const renderItem: ListRenderItem<DataItem> = useCallback(({item}) => (
		<CardListItem
			isLoading={item?.is_loading}
			cardUid={item?.card_uid}
			assignedFor={item?.assigned_for}
			student={item?.student}
			lecturer={item?.lecturer}
			status={item?.student !== undefined || item?.lecturer !== undefined}
			onPress={() => {

			}}
		/>
	), []);

    return (
		<View style={styles.container}>
			<FlashList
				data={data}
				contentContainerStyle={styles.contentContainerStyle}
				ListHeaderComponent={(
					<View style={styles.headerComponent}>
						<Input
							placeholder='Search card id'
							defaultValue={searchQuery}
							onChangeText={setSearchQuery}
							returnKeyType='search'
						/>
					</View>
				)}
				keyExtractor={item => item.id}
				estimatedItemSize={81}
				renderItem={renderItem}
			/>
		</View>
    )
}

export default Cards

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.white,
		width: '100%',
		height: '100%',
		paddingHorizontal: 20,
	},
	contentContainerStyle: {
		paddingVertical: 30,
	},
	headerComponent: {
		marginBottom: 30,
	}
})