import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import FixedWrapper from '@/components/FixedWrapper'
import Input from '@/components/Input'
import SelectInput from '@/components/SelectInput'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import { BottomSheetFlashList, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Department } from '@/types/api'
import OptionListItem from '@/components/OptionListItem'
import { ListRenderItemInfo } from '@shopify/flash-list'
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import handleDepartments from '@/api/handleDepartments'
import { Level, MenuButton, Semester } from '@/types/general'
import moment from 'moment'
import { ImagePickerAsset } from 'expo-image-picker'
import SelectImage from '@/components/SelectImage'
import handleGroq from '@/api/handleGroq'
import handleStorage from '@/api/handleStorage'
import { useAuthStore } from '@/stores/useAuthStore'
import "react-native-get-random-values";
import { v4 as uuidv4 } from 'uuid'
import getFileExtension from '@/utilities/getFileExtension'
import EditableCourseListItem from '@/components/EditableCourseListItem'
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Menu from '@/components/Menu'
import Flex from '@/components/Flex'
import handleCourses from '@/api/handleCourses'

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

type Course = {
	id: string;
	course_title: string,
	course_code: string,
}

type BottomSheetContent = 'Select Department' | 'Select Level' | 'Update course' | 'Select Semester';

const AddCourse = () => {

	const router = useRouter();
	const pathname = usePathname();

	const user = useAuthStore(state => state.user)

	const {
		_add_with_ai,
		_department_id
	} = useLocalSearchParams();
		// console.log("🚀 ~ AddCourse ~ _add_with_ai:", _add_with_ai)

	const {
		openMenu,
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

	const [courseTitle, setCourseTitle] = useState<string>('');
	const [courseCode, setCourseCode] = useState<string>('');
	const courseCodeRef = useRef<TextInput>(null)
	const [departments, setDepartments] = useState<SelectableDepartment[]>([]);
	const [departmentName, setDepartmentName] = useState<string>('');
	const [departmentId, setDepartmentId] = useState<string>('');
	const [courses, setCourses] = useState<Course[]>([]);

	const [semester, setSemester] = useState<Semester | null>(null);
	const [level, setLevel] = useState<Level | null>(null);

	const [image, setImage] = useState<ImagePickerAsset | null>(null);

	const [isProcessed, setIsProcessed] = useState<boolean>(!_add_with_ai);

	const coursesListRef = useRef<number[]>([]);
	// console.log("🚀 ~ AddCourse ~ coursesListRef:", coursesListRef)
	const formOffset = useRef<number>(0);
	// console.log("🚀 ~ AddCourse ~ formOffset:", formOffset)

	const [containerHeight, setContainerHeight] = useState<number>(HEIGHT);
	// console.log("🚀 ~ AddCourse ~ containerHeight:", containerHeight)
	// console.log("")

	const [menuTop, setMenuTop] = useState<number>(0);
	const [selectedCourseId, setSelectedCourseId] = useState<string>('');

	const menuButtons = useMemo((): Array<MenuButton> => {
		return [
			{
				title: 'Edit',
				Icon: <Feather name="edit" size={16} color={colors.black} />,
			},
			{
				title: 'Delete',
				Icon: <AntDesign name="delete" size={14} color={colors.black} />,
			},
		]
	}, []) 

	const [semesterOptions, setSemesterOptions] = useState<SelectableSemester[]>([
		{
			id: '1',
			value: 1,
			is_selected: false,
		},
		{
			id: '2',
			value: 2,
			is_selected: false,
		},
	]);

	const [levelOptions, setLevelOptions] = useState<SelectableLevel[]>([]);

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
		if (content === 'Select Department') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*departments.length);
		} else if (content === 'Select Semester') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*semesterOptions.length);
		} else if (content === 'Select Level') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*levelOptions.length);
		} else {
			const targetCourse = courses.find(item => item.id === selectedCourseId);

			if (targetCourse) {
				setCourseTitle(targetCourse.course_title);
				setCourseCode(targetCourse.course_code);
			};

			height = 400;
		}

		setSheetParameters({
			snapPoints: [height],
			content,
		})

		sheetRef?.current?.present();
	}, [selectedCourseId, departments, semesterOptions, levelOptions, courses])

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
		}
		// Optional: Handle the else case if needed, though 'some' prevents it here.
		// else { console.warn(`Lecturer with id ${id} not found unexpectedly.`); }
	}, [departments]); // <-- Add setDean to dependencies
	
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

			if (_add_with_ai) {
				const coursesResponse = await handleCourses.addCourses({
					department_id: departmentId,
					level,
					semester,
					courses,
				});

				if (coursesResponse.isSuccessful) {
					displayToast('SUCCESS', 'Courses added successfully')
					router.back();
				}
			} else {
				if (!courseTitle || !courseCode) {
					throw new Error("Enter course title and code")
				}

				const coursesResponse = await handleCourses.create({
					department_id: departmentId,
					level,
					semester,
					course_code: courseCode,
					course_title: courseTitle
				});

				if (coursesResponse.isSuccessful) {
					displayToast('SUCCESS', 'Courses added successfully')
					router.back();
				}
			}
		} catch (error: any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}

	const handleProcessCourse = async (): Promise<void> => {
		try {
			setIsLoading(true);

			if (!image?.uri) {
				throw new Error("No image selected")
			}
			
			if (!user?.id) {
				throw new Error("Sign in to add courses")
			}

			const id = uuidv4();

			const uploadResponse = await handleStorage.uploadFile({
				id: user?.id,
				uri: image.uri,
				mimeType: image.mimeType,
				bucketName: 'groq',
				fileName: image.fileName || id,
				fileExtension: getFileExtension(image.uri),
			})

			const downloadResponse = await handleStorage.downloadFile({
				bucketName: 'groq',
				uri: uploadResponse.uri,
			});
			// console.log("🚀 ~ handleProcessCourse ~ downloadResponse:", downloadResponse)

			const groqResponse: Array<{course_title: string, course_code: string}> | null = await handleGroq.processCourses(downloadResponse.uri);

			// delete file
			await handleStorage.deleteFile({
				bucketName: 'groq',
				uri: uploadResponse.uri,
			})

			if (!groqResponse) return;

			setCourses(groqResponse.map(item => ({...item, id: `${Math.random()}`})));

			setIsProcessed(true);
		} catch (error: any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}

	const handleOnPressCourseOption = useCallback((id: string) => {
		// console.log("🚀 ~ handleOnPressCourseOption ~ id:", id);
		setSelectedCourseId(id);
		const index = courses.findIndex(item => item.id === id);

		const courseItemOffset = coursesListRef.current[index];
		const menuHeight = 116;
		const evaluatedHeight = courseItemOffset + (62 - 24)/2 - menuHeight;

		setMenuTop(evaluatedHeight)

		openMenu();
	}, [courses])


	const handleDeleteCourse = useCallback(() => {
		setCourses(prevState => prevState.filter(item => item.id !== selectedCourseId));

		setSelectedCourseId('');
	}, [selectedCourseId])


	const handleUpdateCourse = useCallback(() => {
		// console.log("🚀 ~ handleUpdateCourse ~ selectedCourseId:", selectedCourseId)
		// console.log("🚀 ~ handleUpdateCourse ~ courseCode:", courseCode)
		// console.log("🚀 ~ handleUpdateCourse ~ courseTitle:", courseTitle);
		// console.log("🚀 ~ handleUpdateCourse ~ courses:", courses)
		setCourses(prevState => {
			return prevState.map(item => {
				if (item.id === selectedCourseId) {
					return {
						...item,
						course_code: courseCode,
						course_title: courseTitle,
					}
				}

				return item
			})
		})

		closeBottomSheet();
	}, [selectedCourseId, courseCode, courseTitle, courses])

	const handleOnPressMenuButtion = useCallback((title: string) => {
		if (title === 'Edit') {
			openBottomSheet('Update course')
			return;
		}
		handleDeleteCourse();
	}, [handleDeleteCourse, openBottomSheet])

	return (<>
		<ScrollView
			keyboardShouldPersistTaps={'handled'}
			contentContainerStyle={styles.contentContainer}
			onContentSizeChange={(w, h) => {
				setContainerHeight(h)
			}}
		>
			<View 
				style={styles.main}
				onLayout={(event) => {
					formOffset.current = event.nativeEvent.layout.y 
				}}
			>
				{!_add_with_ai as boolean && <>
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
				</>}
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
				{departmentId && <>
					<SelectInput
						label='Select Level'
						placeholder='100 Level'
						onPress={() => openBottomSheet('Select Level')}
						value={level ? `${level}` : ''}
					/>
					{_add_with_ai && (
						<SelectImage
							image={image}
							onImageSelected={setImage}
							title='Select image of courses'
							subtitle='Select image containig list of courses for the semester, department, and level selected above'
						/>
					)}
				</>}
				{courses && courses.length > 0 && courses.map((item, index) => (
					<EditableCourseListItem
						key={item.id}
						onLayout={e => {
							const { y } = e.nativeEvent.layout;
							coursesListRef.current[index] = y;
						}}
						courseCode={item.course_code}
						courseTitle={item.course_title}
						onPress={() => {
							handleOnPressCourseOption(item.id)
						}}
					/>
				))}

				<Menu
					menuButtons={menuButtons}
					top={menuTop}
					right={15}
					onPressOption={handleOnPressMenuButtion}
				/>
			</View>
		</ScrollView>
		<FixedWrapper
			contentContainerStyle={styles.buttonWraper}
		>
			<CustomButton
				onPress={isProcessed ? handleCreateCourse : handleProcessCourse}
				text={isProcessed ? `Add course${_add_with_ai ? "s" : ""}` : 'Process with AI'}
				isLoading={isLoading}
				disabled={_add_with_ai ? (!departmentId || !semester || !level) : (!courseCode || !courseTitle || !departmentId || !semester || !level)}
			/>
		</FixedWrapper>
		<CustomBottomSheet
			ref={sheetRef}
			sheetTitle={sheetParameters.content}
			snapPoints={sheetParameters.snapPoints}
			closeBottomSheet={closeBottomSheet}
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
			{sheetParameters.content === 'Update course' && (
				<BottomSheetScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps='handled'
					contentContainerStyle={{flexGrow: 1}}
				>
					<Flex
						gap={20}
						flex={1}
						style={{
							width: '100%',
							paddingTop: 20,
							paddingBottom: 30, 
						}}
						
						// backgroundColor='red'
					>
						<Flex 
							gap={20} 
							flex={1} 
							style={{width: '100%'}}
							// backgroundColor='blue'
						>
							<Input
								defaultValue={courseTitle}
								onChangeText={setCourseTitle}
								label='Course Title'
								placeholder='Basic Digital Fundamental'
								onSubmitEditing={() => courseCodeRef.current?.focus()}
								width={WIDTH - 40}
							/>
							<Input
								ref={courseCodeRef}
								defaultValue={courseCode}
								onChangeText={setCourseCode}
								label='Course Code'
								placeholder='CSC 101'
								width={WIDTH - 40}
							/>
						</Flex>
						<CustomButton
							text='Update'
							onPress={handleUpdateCourse}
							disabled={!courseCode || !courseTitle}
						/>
					</Flex>
				</BottomSheetScrollView>
			)}
		</CustomBottomSheet>
	</>)
}

export default AddCourse

const styles = StyleSheet.create({
	contentContainer: {
		backgroundColor: colors.white,
		paddingHorizontal: 20,
		flexGrow: 1,
		paddingTop: 30,
		paddingBottom: 120,
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