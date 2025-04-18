import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import { WIDTH } from '@/utilities/dimensions'
import FixedWrapper from '@/components/FixedWrapper'
import Input from '@/components/Input'
import SelectInput from '@/components/SelectInput'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { Lecturer } from '@/types/api'
import moment from "moment";
import OptionListItem from '@/components/OptionListItem'
import { ListRenderItemInfo } from '@shopify/flash-list'
import { useRouter } from 'expo-router'

// Define the combined type for clarity
type SelectableLecturer = Lecturer & { is_selected: boolean };


const AddCollege = () => {

	const router = useRouter();

	const [collegeName, setCollegeName] = useState<string>('');
	const [dean, setDean] = useState<string>('')

	const sheetRef = useRef<BottomSheetModal>(null);

	const openBottomSheet = () => {
		sheetRef?.current?.present();
	}

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}

	const [lecturers, setLecturers] = useState<Array<SelectableLecturer>>([
		{
			id: '1',
			full_name: "John Doe",
			department_id: '1',
			course_ids: null,
			role: 'Lecturer',
			is_selected: false,
			created_at: moment().toISOString(),
			updated_at: moment().toISOString(),
		},
		{
			id: '2',
			full_name: "Janes Mark",
			department_id: '1',
			course_ids: null,
			role: 'Lecturer',
			is_selected: false,
			created_at: moment().toISOString(),
			updated_at: moment().toISOString(),
		},
		{
			id: '3',
			full_name: "Junior Matthew",
			department_id: '1',
			course_ids: null,
			role: 'Lecturer',
			is_selected: false,
			created_at: moment().toISOString(),
			updated_at: moment().toISOString(),
		},
		{
			id: '4',
			full_name: "Sandra Johnes",
			department_id: '1',
			course_ids: null,
			role: 'Lecturer',
			is_selected: false,
			created_at: moment().toISOString(),
			updated_at: moment().toISOString(),
		},
		{
			id: '5',
			full_name: "Mark Kent",
			department_id: '1',
			course_ids: null,
			role: 'Lecturer',
			is_selected: false,
			created_at: moment().toISOString(),
			updated_at: moment().toISOString(),
		},
	]);

const handleSelectedDean = useCallback((id: string): void => {
    // This check ensures that 'find' below will succeed.
	if (lecturers.some(item => item.id === id)) {
        // Add '!' after find(...) to assert it's not null/undefined
		const foundLecturer = lecturers.find((item) => item.id === id)!;
        setDean(foundLecturer.full_name); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

		// update lecturer list
		setLecturers(prevState => {
			return prevState.map(item => {
				if (item.id === id) {
					return {
						...item,
						is_selected: true,
					}
				}
				return {
					...item,
					is_selected: false,
				}
			})
		})

		closeBottomSheet()
	}
    // Optional: Handle the else case if needed, though 'some' prevents it here.
    // else { console.warn(`Lecturer with id ${id} not found unexpectedly.`); }
}, [lecturers, setDean]); // <-- Add setDean to dependencies

	const renderItem = useCallback(({item}: ListRenderItemInfo<SelectableLecturer>) => (
		<OptionListItem
			id={item?.id}
			text={item?.full_name}
			subtext={'Department: Computer Science'}
			isSelected={item?.is_selected}
			onPress={handleSelectedDean}
		/>
	), [])

	return (<>
		<ScrollView
			keyboardShouldPersistTaps={'handled'}
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.main}>
				<Input
					value={collegeName}
					onChangeText={setCollegeName}
					label='College Name'
					placeholder='College Name'
				/>
				<SelectInput
					label='Assign Dean'
					placeholder='Select from lecturer'
					onPress={openBottomSheet}
					value={dean}
				/>
			</View>
		</ScrollView>
		<FixedWrapper
			contentContainerStyle={styles.buttonWraper}
		>
			<CustomButton
				onPress={() => {
					router.back();
				}}
				width={(WIDTH - 60)/2}
				isSecondary={true}
				text='Cancel'
			/>
			<CustomButton
				onPress={() => {}}
				width={(WIDTH - 60)/2}
				text='Save'
				disabled={!collegeName || !dean}
			/>
		</FixedWrapper>
		<CustomBottomSheet
			ref={sheetRef}
			sheetTitle='Assign Dean'
			snapPoints={['60%']}
			closeBottomSheet={closeBottomSheet}
		>
			<BottomSheetFlashList
				data={lecturers}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{paddingBottom: 30}}
				renderItem={renderItem}
			/>
		</CustomBottomSheet>
    </>)
}

export default AddCollege

const styles = StyleSheet.create({
	contentContainer: {
		backgroundColor: colors.white,
		paddingHorizontal: 20,
		flexGrow: 1,
		paddingTop: 30,
	},
	main: {
		display: 'flex',
		gap: 20,
		width: '100%',
	},
	buttonWraper: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		flexDirection: 'row',
	}
})