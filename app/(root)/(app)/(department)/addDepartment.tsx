import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import FixedWrapper from '@/components/FixedWrapper'
import Input from '@/components/Input'
import SelectInput from '@/components/SelectInput'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { College } from '@/types/api'
import OptionListItem from '@/components/OptionListItem'
import { ListRenderItemInfo } from '@shopify/flash-list'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import handleDepartments from '@/api/handleDepartments'
import InterText from '@/components/InterText'
import handleColleges from '@/api/handleColleges'

// Define the combined type for clarity
type SelectableCollege = College & { is_selected: boolean };
type SelectableDuration = {
	id: string,
	value: number,
	title: string,
	is_selected: boolean
}
type BottomSheetContent = 'Select College' | 'Select Duration';

const AddDepartment = () => {

	const router = useRouter();

	const {
		_college_name,
		_college_id,
	} = useLocalSearchParams();
		console.log("🚀 ~ AddDepartment ~ _college_name:", _college_name)
		console.log("🚀 ~ AddDepartment ~ _college_id:", _college_id)

	const {
		setIsLoading,
		displayToast,
	} = useAppStore.getState();

	const isLoading = useAppStore(state => state.isLoading);

	const [dataLoading, setDataLoading] = useState<{colleges: boolean}>({
		colleges: true,
	})

	const [departmentName, setDepartmentName] = useState<string>('')
	const [colleges, setColleges] = useState<SelectableCollege[]>([]);
	const [collegeName, setCollegeName] = useState<string>(_college_name as string || '');
	const [collegeId, setCollegeId] = useState<string>(_college_id as string || '');
	const [courseDuration, setCourseDuration] = useState<number | undefined>(undefined)

	const [courseDurationOptions, setCourseDurationOptions] = useState<SelectableDuration[]>([
		{
			id: '1',
			value: 5,
			title: '5 years',
			is_selected: false,
		},
		{
			id: '2',
			value: 4,
			title: '4 years',
			is_selected: false,
		},
		{
			id: '3',
			value: 3,
			title: '3 years',
			is_selected: false,
		},
		{
			id: '4',
			value: 2,
			title: '4 years',
			is_selected: false,
		},
	])

	const sheetRef = useRef<BottomSheetModal>(null);
	const [sheetParameters, setSheetParameters] = useState<{snapPoints: [string | number], content: BottomSheetContent}>({
		snapPoints: ['50%'],
		content: 'Select College',
	})

	const openBottomSheet = useCallback((content: BottomSheetContent) => {
		const minHeight = 130;
		const listItemHieght = 60;

		let height = 0;
		if (content === 'Select College') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*colleges.length);
		} else {
			height = Math.min(HEIGHT, minHeight + listItemHieght*courseDurationOptions.length);
		}

		setSheetParameters({
			snapPoints: [height],
			content,
		})

		sheetRef?.current?.present();
	}, [courseDurationOptions, colleges])

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}
	

	useEffect(() => {
		// (async () => )
		const fetchColleges = async () => {
			try {
				const collegesResponse = await handleColleges.getAll();

				if (collegesResponse.isSuccessful) {
					setColleges(collegesResponse.data.map(item => ({...item, is_selected: item.id === _college_id})))
				}
				console.log("🚀 ~ fetchColleges ~ collegesResponse.data:", collegesResponse.data)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('colleges', setDataLoading)
			}
		}

		fetchColleges();
			
	}, [])

	const handleSelectCollege = useCallback((id: string): void => {
		// This check ensures that 'find' below will succeed.
		if (colleges.some(item => item.id === id)) {
			// Add '!' after find(...) to assert it's not null/undefined
			const foundCollege = colleges.find((item) => item.id === id)!;
			setCollegeName(foundCollege.college_name); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

			setCollegeId(id);

			// update lecturer list
			setColleges(prevState => {
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
	}, [colleges]); // <-- Add setDean to dependencies
	
	const handleSelectDuration = useCallback((id: string): void => {
		// This check ensures that 'find' below will succeed.
		if (courseDurationOptions.some(item => item.id === id)) {
			// Add '!' after find(...) to assert it's not null/undefined
			const foundDuration = courseDurationOptions.find((item) => item.id === id)!;
			setCourseDuration(foundDuration.value); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

			// update lecturer list
			setCourseDurationOptions(prevState => {
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
	}, [courseDurationOptions]); // <-- Add setDean to dependencies

	const renderCollegeItem = useCallback(({item}: ListRenderItemInfo<SelectableCollege>) => (
		<OptionListItem
			id={item?.id}
			text={item?.college_name}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectCollege(item.id)
			}}
		/>
	), [handleSelectCollege]);

	const renderDurationItem = useCallback(({item}: ListRenderItemInfo<SelectableDuration>) => (
		<OptionListItem
			id={item?.id}
			text={item?.title}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectDuration(item.id)
			}}
		/>
	), [handleSelectDuration]);

	const handleCreateDepartment = async () => {
		try {
			setIsLoading(true);

			if (!courseDuration || !departmentName || !collegeId) {
				throw new Error('Empty fields')
			}

			const departmentResponse = await handleDepartments.create({
				department_name: departmentName.trim(),
				college_id: collegeId,
				course_duration: courseDuration,
			});

			if (departmentResponse.isSuccessful) {
				router.back()
			}
		} catch (error: any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}
	

	return (<>
		<ScrollView
			keyboardShouldPersistTaps={'handled'}
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.main}>
				<Input
					value={departmentName}
					onChangeText={setDepartmentName}
					label='Department Name'
					placeholder='Department Name'
				/>
				<SelectInput
					label='Course duration'
					placeholder='Select course duration'
					onPress={() => openBottomSheet('Select Duration')}
					value={courseDuration ? `${courseDuration} years` : undefined}
				/>
				<SelectInput
					label='Select College'
					placeholder='Select from available colleges'
					onPress={() => openBottomSheet('Select College')}
					value={collegeName}
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
				onPress={handleCreateDepartment}
				width={(WIDTH - 60)/2}
				text='Save'
				isLoading={isLoading}
				disabled={!collegeId || !departmentName || !courseDuration}
			/>
		</FixedWrapper>
		<CustomBottomSheet
			ref={sheetRef}
			sheetTitle={sheetParameters.content}
			snapPoints={sheetParameters.snapPoints}
			closeBottomSheet={closeBottomSheet}
		>
			{sheetParameters.content === 'Select College' && (
				<BottomSheetFlashList
					data={colleges}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingBottom: 30}}
					estimatedItemSize={81}
					renderItem={renderCollegeItem}
					ListEmptyComponent={!dataLoading.colleges ? (
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
			)}

			{sheetParameters.content === 'Select Duration' && (
				<BottomSheetFlashList
					data={courseDurationOptions}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingBottom: 30}}
					estimatedItemSize={81}
					renderItem={renderDurationItem}
				/>
			)}
		</CustomBottomSheet>
		</>)
}

export default AddDepartment

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