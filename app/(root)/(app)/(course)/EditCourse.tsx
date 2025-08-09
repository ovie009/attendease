import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import { HEIGHT } from '@/utilities/dimensions'
import FixedWrapper from '@/components/FixedWrapper'
import Input from '@/components/Input'
import SelectInput from '@/components/SelectInput'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { Department } from '@/types/api'
import OptionListItem from '@/components/OptionListItem'
import { ListRenderItemInfo } from '@shopify/flash-list'
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import handleDepartments from '@/api/handleDepartments'
import { Level, Semester } from '@/types/general'
import moment from 'moment'
import Flex from '@/components/Flex'
import handleCourses, { AddCoursePayload } from '@/api/handleCourses'
import InterText from '@/components/InterText'
import AddCircleLargeIcon from '@/assets/svg/AddCircleLargeIcon.svg';
import AntDesign from '@expo/vector-icons/AntDesign'
import { useRouteStore } from '@/stores/useRouteStore'

// Define the combined type for clarity
type SelectableDepartment = Department & { is_selected: boolean };

type SelectableSemester = {
	id: string,
	value: Semester,
	is_selected: boolean
}

type SelectableLevel = {
	id: string,
	value: Level,
	is_selected: boolean
}

type BottomSheetContent = 'Select Department' | 'Select Level' | 'Update course' | 'Select Semester' | 'Select other departments';

const EditCourse = () => {

	const router = useRouter();
	const pathname = usePathname();

	const _editCourse = useRouteStore(state => state._editCourse);

	const {
		_department_id
	} = useLocalSearchParams();
		// console.log("🚀 ~ EditCourse ~ _add_with_ai:", _add_with_ai)

	const {
		setIsLoading,
		displayToast,
		setLoadingPages,
	} = useAppStore.getState();

	const isLoading = useAppStore(state => state.isLoading);
	const loadingPages = useAppStore(state => state.loadingPages)
	
	useEffect(() => {
		if (pathname) {
			setLoadingPages([...loadingPages, pathname])
		}
	}, []);

	const [dataLoading, setDataLoading] = useState<{departments: boolean}>({
		departments: true,
	})

	const [courseTitle, setCourseTitle] = useState<string>(_editCourse?.course_title || '');
	const [courseCode, setCourseCode] = useState<string>(_editCourse?.course_code || '');
	const courseCodeRef = useRef<TextInput>(null)
	const [departments, setDepartments] = useState<SelectableDepartment[]>([]);
	const [selectedDepartments, setSelectedDepartments] = useState<SelectableDepartment[]>([]);
	const [departmentName, setDepartmentName] = useState<string>('');
	const [departmentId, setDepartmentId] = useState<string>(_editCourse?.department_id || '');

	const [semester, setSemester] = useState<Semester | null>(_editCourse?.semester || null);
	const [level, setLevel] = useState<Level | null>(_editCourse?.level || null);

	const formOffset = useRef<number>(0);

	const [semesterOptions, setSemesterOptions] = useState<SelectableSemester[]>([
		{
			id: '1',
			value: 1,
			is_selected: _editCourse?.semester === 1,
		},
		{
			id: '2',
			value: 2,
			is_selected: _editCourse?.semester === 2,
		},
	]);

	const [levelOptions, setLevelOptions] = useState<SelectableLevel[]>([]);

	useEffect(() => {
		if (_editCourse?.other_department_ids?.length !== 0 && departments.length !== 0) {
			setSelectedDepartments(departments.filter(department => _editCourse?.other_department_ids?.includes(department.id)));
		} 

		if (departments.length !== 0) {
			setDepartmentName(departments?.find(department => department.id === _editCourse?.department_id)?.department_name!)
		}
	}, [_editCourse, departments])

	useEffect(() => {
		if (!departmentId) return;

		const foundDepartment = departments.find(item => item.id === departmentId);

		const courseDuration: number | undefined = foundDepartment?.course_duration;

		if (!courseDuration) return;
		const levelsArray: any = Array.from({ length: courseDuration }, (_, index: number) => ({
			id: `level-${index + 1}`,
			value: (index + 1)*100,
			is_selected: false,
		}));
		// console.log("🚀 ~ levelsArray ~ levelsArray:", levelsArray);

		if (level && levelOptions.some(item => item.value === level)) {
			setLevelOptions(levelsArray.map((item: SelectableLevel) => {
				if (item.value === level) {
					return {
						...item,
						is_selected: true
					}
				}
				return item;
			}))
		} else {
			setLevelOptions(levelsArray)

			setLevel(null)
		}

		// foundDepartment.
	}, [departmentId])


	const sheetRef = useRef<BottomSheetModal>(null);
	const [sheetParameters, setSheetParameters] = useState<{snapPoints: [string | number], content: BottomSheetContent}>({
		snapPoints: ['50%'],
		content: 'Select Department',
	})

	const openBottomSheet = useCallback((content: BottomSheetContent) => {
		const minHeight = 130;
		const listItemHieght = 60;

		let height = 0;
		if (content === 'Select Department' || content === 'Select other departments') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*departments.length);

			if (content === 'Select Department') {
				setDepartments(prevState => {
					return prevState.map(item => {
						return {
							...item,
							is_selected: item.id === departmentId,
						}
					})
				})
			} else {
				height += 50;
				setDepartments(prevState => {
					return prevState.map(item => {
						return {
							...item,
							is_selected: selectedDepartments.some(department => department.id === item.id),
						}
					})
				})
			}
		} else if (content === 'Select Semester') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*semesterOptions.length);
		} else if (content === 'Select Level') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*levelOptions.length);
		}

		setSheetParameters({
			snapPoints: [height],
			content,
		})

		sheetRef?.current?.present();
	}, [departments, departmentId, selectedDepartments, setDepartments, semesterOptions, levelOptions])

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}
	

	useEffect(() => {
		// (async () => )
		const fetchDepartments = async () => {
			try {
				const departmentsResponse = await handleDepartments.getAll();

				if (departmentsResponse.isSuccessful) {
					setDepartments(departmentsResponse.data.map(item => ({...item, is_selected: item?.id === _department_id})))
					if (_department_id) {
						const foundDepartment = departmentsResponse.data.find((item) => item.id === _department_id)!;
						setDepartmentName(foundDepartment.department_name); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

						setDepartmentId(_department_id as string);
					}
				}
				// console.log("🚀 ~ fetchDepartments ~ departmentsResponse.data:", departmentsResponse.data)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('departments', setDataLoading)
			}
		}

		fetchDepartments();
			
	}, [])

	useEffect(() => {
		if (!dataLoading.departments) {
			// disable loading pages
			setLoadingPages(loadingPages.filter(item => item !== pathname))
		}
	}, [dataLoading.departments])

	const handleSelectDepartment = useCallback((id: string): void => {
		// console.log("🚀 ~ handleSelectDepartment ~ id:", id)
		// console.log("🚀 ~ handleSelectDepartment ~ departments:", departments)
		// This check ensures that 'find' below will succeed.
		if (departments.some(item => item.id === id)) {
			if (sheetParameters.content === 'Select Department') {
				// Add '!' after find(...) to assert it's not null/undefined
				const foundDepartment = departments.find((item) => item.id === id)!;
				setDepartmentName(foundDepartment.department_name); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined
	
				setDepartmentId(id);
	
				// update lecturer list
				setDepartments(prevState => {
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
			} else {
				setDepartments(prevState => {
					return prevState.map(item => {
						if (item.id === id) {
							return {
								...item,
								is_selected: !item.is_selected,
							}
						}
						return item
					})
				})
			}

		}
		// Optional: Handle the else case if needed, though 'some' prevents it here.
		// else { console.warn(`Lecturer with id ${id} not found unexpectedly.`); }
	}, [departments, sheetParameters]); // <-- Add setDean to dependencies
	
	const handleSelectSemster = useCallback((id: string): void => {
		// This check ensures that 'find' below will succeed.
		if (semesterOptions.some(item => item.id === id)) {
			// Add '!' after find(...) to assert it's not null/undefined
			const foundValue = semesterOptions.find((item) => item.id === id)!;
			setSemester(foundValue.value); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

			// update lecturer list
			setSemesterOptions(prevState => {
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
	}, [semesterOptions]); // <-- Add setDean to dependencies

	const handleSelectLevel = useCallback((id: string): void => {
		// This check ensures that 'find' below will succeed.
		if (levelOptions.some(item => item.id === id)) {
			// Add '!' after find(...) to assert it's not null/undefined
			const foundValue = levelOptions.find((item) => item.id === id)!;
			setLevel(foundValue.value); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

			// update lecturer list
			setLevelOptions(prevState => {
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
	}, [levelOptions]); // <-- Add setDean to dependencies

	const renderDepartmentItem = useCallback(({item}: ListRenderItemInfo<SelectableDepartment>) => (
		<OptionListItem
			id={item?.id}
			text={item?.department_name}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectDepartment(item.id)
			}}
		/>
	), [handleSelectDepartment]);

	const renderSemsterItem = useCallback(({item}: ListRenderItemInfo<SelectableSemester>) => (
		<OptionListItem
			id={item?.id}
			text={`${moment(item.value, 'd').format('do')} semester`}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectSemster(item.id)
			}}
		/>
	), [handleSelectSemster]);

	const renderLevelItem = useCallback(({item}: ListRenderItemInfo<SelectableLevel>) => (
		<OptionListItem
			id={item?.id}
			text={item?.value ? `${item.value} level` : ""}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectLevel(item.id)
			}}
		/>
	), [handleSelectLevel]);

	

	const handleCreateCourse = async (): Promise<void> => {
		try {
			if (!level || !semester) {
				throw new Error("Select level and semester")
			}
			setIsLoading(true);

			
			if (!courseTitle || !courseCode) {
				throw new Error("Enter course title and code")
			}

			const payload: AddCoursePayload & {id: string} = {
				id: _editCourse?.id!,
				department_id: departmentId,
				level,
				semester,
				course_code: courseCode,
				course_title: courseTitle
			};
			
			if (selectedDepartments.length !== 0) {
				payload['other_department_ids'] = selectedDepartments.map(item => item.id);
			} else {
				payload['other_department_ids'] = []
			}

			const coursesResponse = await handleCourses.update(payload);
			console.log("🚀 ~ handleCreateCourse ~ coursesResponse:", coursesResponse)

			if (coursesResponse.isSuccessful) {
				displayToast('SUCCESS', 'Courses updated successfully')
				router.back();
			}
		} catch (error: any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}

	const handleSelectOtherDepartments = useCallback(() => {
		setSelectedDepartments(departments.filter(item => item.is_selected));
		closeBottomSheet()
	}, [departments])

	const handleRemoveSelectedDepartment = useCallback((id: string) => {
		setSelectedDepartments(prevState => prevState.filter(department => department.id !== id))
	}, [setSelectedDepartments]);
	
	

	return (<>
		<ScrollView
			keyboardShouldPersistTaps={'handled'}
			contentContainerStyle={styles.contentContainer}
		>
			<View 
				style={styles.main}
				onLayout={(event) => {
					formOffset.current = event.nativeEvent.layout.y 
				}}
			>
				<Input
					defaultValue={courseTitle}
					onChangeText={setCourseTitle}
					label='Course Title'
					placeholder='Basic Digital Fundamental'
					onSubmitEditing={() => courseCodeRef.current?.focus()}
				/>
				<Input
					ref={courseCodeRef}
					defaultValue={courseCode}
					onChangeText={setCourseCode}
					label='Course Code'
					placeholder='CSC 101'
				/>
				<SelectInput
					label='Select Semester'
					placeholder='1st semester'
					onPress={() => openBottomSheet('Select Semester')}
					value={semester ? `${moment(semester, 'd').format('do')} semester` : ''}
				/>
				<SelectInput
					label='Select Department'
					placeholder='Select from available departments'
					onPress={() => openBottomSheet('Select Department')}
					value={departmentName}
				/>

				{departmentId && (
					<Flex
						gap={10}
					>
						<InterText
							fontSize={13}
							lineHeight={15}
							color={colors?.label}
						>
							Select other departments that offer this course (optional)
						</InterText>
						<Flex
							flexDirection='row'
							gap={20}
							flexWrap='wrap'
						>
							{selectedDepartments.map(department => (
								<Flex
									key={department.id}
									paddingHorizontal={12}
									borderRadius={9}
									height={40}
									justifyContent='center'
									alignItems='center'
									flexDirection='row'
									gap={10}
									style={{
										borderWidth: 1,
										borderColor: colors.inputBorder,
									}}
								>
									<InterText>
										{department.department_name}
									</InterText>
									<TouchableOpacity
										onPress={() => {
											handleRemoveSelectedDepartment(department.id)
										}}
									>
			                            <AntDesign name="close" size={16} color={colors.black} />
									</TouchableOpacity>
								</Flex>
							))}
							<TouchableOpacity
								onPress={() => {
									openBottomSheet('Select other departments')
								}}
							>
								<Flex
									paddingHorizontal={12}
									borderRadius={9}
									height={40}
									justifyContent='center'
									alignItems='center'
									flexDirection='row'
									gap={10}
									style={{
										borderWidth: 1,
										borderStyle: 'dashed',
										borderColor: colors.inputBorder,
									}}
									// backgroundColor={colors.lightBackground}
								>
									<AddCircleLargeIcon width={16} height={16} />
									<InterText
										fontSize={12.5}
										lineHeight={15}
										color={colors.placeholder}
									>
										Select {selectedDepartments?.length === 0 ? "department" : "other departments"}
									</InterText>
								</Flex>
							</TouchableOpacity>
						</Flex>
					</Flex>
				)}
				{departmentId && <>
					<SelectInput
						label='Select Level'
						placeholder='100 Level'
						onPress={() => openBottomSheet('Select Level')}
						value={level ? `${level}` : ''}
					/>
				</>}
			</View>
		</ScrollView>
		<FixedWrapper
			contentContainerStyle={styles.buttonWraper}
		>
			<CustomButton
				onPress={handleCreateCourse}
				text={`Add courses`}
				isLoading={isLoading}
				disabled={!courseCode || !courseTitle || !departmentId || !semester || !level}
			/>
		</FixedWrapper>
		<CustomBottomSheet
			ref={sheetRef}
			sheetTitle={sheetParameters.content}
			snapPoints={sheetParameters.snapPoints}
			closeBottomSheet={closeBottomSheet}
			enableOverDrag={false}
		>
			{sheetParameters.content === 'Select Department' && (
				<BottomSheetFlashList
					data={departments}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderDepartmentItem}
				/>
			)}
			{sheetParameters.content === 'Select other departments' && (
				<React.Fragment>
					<BottomSheetFlashList
						data={departments.filter(item => item.id !== departmentId)}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{paddingTop: 50}}
						estimatedItemSize={81}
						renderItem={renderDepartmentItem}
					/>
					<Flex
						paddingBottom={35}
					>
						<CustomButton
							text='Select'
							disabled={!departments.some(item => item.is_selected)}
							onPress={handleSelectOtherDepartments}
						/>
					</Flex>
				</React.Fragment>
			)}
			{sheetParameters.content === 'Select Semester' && (
				<BottomSheetFlashList
					data={semesterOptions}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderSemsterItem}
				/>
			)}
			{sheetParameters.content === 'Select Level' && (
				<BottomSheetFlashList
					data={levelOptions}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderLevelItem}
				/>
			)}
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
		paddingBottom: 180,
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
	},
	// BOTTOMSHEET 
	// BOTTOMSHEET 
	// BOTTOMSHEET 
	// BOTTOMSHEET 
})