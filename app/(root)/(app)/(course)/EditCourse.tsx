import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import { WIDTH } from '@/utilities/dimensions'
import FixedWrapper from '@/components/FixedWrapper'
import Input from '@/components/Input'
import SelectInput from '@/components/SelectInput'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { Lecturer } from '@/types/api'
import OptionListItem from '@/components/OptionListItem'
import { ListRenderItemInfo } from '@shopify/flash-list'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import handleLecturers from '@/api/handleLecturers'
import handleDepartments from '@/api/handleDepartments'
import InterText from '@/components/InterText'
import handleColleges from '@/api/handleColleges'

// Define the combined type for clarity
type SelectableLecturer = Lecturer & { is_selected: boolean };

const EditCourse = () => {

	const router = useRouter();
	const navigation = useNavigation<any>();

	const {
		_college_name,
		_college_id,
		_dean_id,
	} = useLocalSearchParams();
		console.log("🚀 ~ EditCourse ~ _dean_id:", _dean_id)
		console.log("🚀 ~ EditCourse ~ _college_id:", _college_id)

	const [collegeName, setCollegeName] = useState<string>(_college_name as string || '');
	const [dean, setDean] = useState<string>('');
	const [deanId, setDeanId] = useState<string | undefined>(_dean_id as string || undefined)

	const {
		displayToast,
	} = useAppStore.getState();

	const sheetRef = useRef<BottomSheetModal>(null);

	const openBottomSheet = () => {
		sheetRef?.current?.present();
	}

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}

	const [dataLoading, setDataLoading] = useState<{lecturers: boolean}>({
		lecturers: false
	})

	useEffect(() => {
		const fetchCollegeLecturers = async () => {
			try {
				const departmentsResponse = await handleDepartments.getByCollegeId(_college_id as string);

				const departmentIds = departmentsResponse.data.map(item => item.id);
				const lecturersResponse = await handleLecturers.getByDepartmentIds(departmentIds)

				if (lecturersResponse.data.length !== 0) {
					setLecturers(lecturersResponse.data.map(item => ({...item, is_selected: false})))
				}
				
				handleDisableDataLoading('lecturers', setDataLoading);
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchCollegeLecturers()
	}, [])

	const [lecturers, setLecturers] = useState<Array<SelectableLecturer>>([]);

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
			isSelected={item?.is_selected}
			subtext={'Department: Computer Science'}
			onPress={handleSelectedDean}
		/>
	), []);

	const handleEditCollege = async () => {
		try {
			const collegeResponse = await handleColleges.update({
				college_name: collegeName,
				id: _college_id as string,
			});

			if (collegeResponse.isSuccessful) {
				navigation.pop(2)
			}
		} catch (error: any) {
			displayToast('ERROR', error?.message)
		}
	}
	

	return (<>
		<ScrollView
			keyboardShouldPersistTaps={'handled'}
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.main}>
				<Input
					defaultValue={collegeName}
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
				isNeutral={true}
				text='Cancel'
			/>
			<CustomButton
				onPress={handleEditCollege}
				width={(WIDTH - 60)/2}
				text='Save'
				disabled={collegeName === _college_name && deanId === _dean_id}
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
                estimatedItemSize={81}
				renderItem={renderItem}
				ListEmptyComponent={!dataLoading.lecturers ? (
					<View
						style={styles.lecturersEmptyCompoennt}
					>
						<InterText
							fontWeight={600}
							fontSize={16}
							lineHeight={19}
						>
							No lectureres added to this college
						</InterText>
					</View>
				) : undefined}
			/>
		</CustomBottomSheet>
    </>)
}

export default EditCourse

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
	},
	lecturersEmptyCompoennt: {
		width: '100%',
		paddingHorizontal: 20,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	}
})