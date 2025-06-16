import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import FixedWrapper from '@/components/FixedWrapper'
import SelectInput from '@/components/SelectInput'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { Course, Schedule, Setting } from '@/types/api'
import OptionListItem from '@/components/OptionListItem'
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list'
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import { Level, MenuButton, Semester } from '@/types/general'
import { ImagePickerAsset } from 'expo-image-picker'
import SelectImage from '@/components/SelectImage'
import handleGroq, { ProcessScheduleResponse } from '@/api/handleGroq'
import handleStorage from '@/api/handleStorage'
import { useAuthStore } from '@/stores/useAuthStore'
import "react-native-get-random-values";
import { v4 as uuidv4 } from 'uuid'
import getFileExtension from '@/utilities/getFileExtension'
import EditableCourseListItem from '@/components/EditableCourseListItem'
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Menu from '@/components/Menu'
import handleCourses from '@/api/handleCourses'
import handleSettings from '@/api/handleSettings'
import EditableScheduleListItem from '@/components/EditableScheduleListItem'
import Flex from '@/components/Flex'
import handleSchedule from '@/api/handleSchedule'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Input from '@/components/Input'
import InterText from '@/components/InterText'
import moment from 'moment'
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import FixedButton from '@/components/FixedButton'

type SelectableLevel = {
	id: string,
	value: Level,
	is_selected: boolean
}

// Define the combined type for clarity
type SelectableCourse = Course & { is_selected: boolean };

// bottom sheet content
type BottomSheetContent = 'Select Course' | 'Edit Schedule' | 'Select Level';

const EditSchedule = () => {

	const router = useRouter();
	const pathname = usePathname();

	const {
		_level,
		_course_code,
		_course_id,
		_days_of_the_week,
		_schedule_id,
		_lecture_hours,
		_lecture_start_time,
		_venue,
	} = useLocalSearchParams();

	const user = useAuthStore(state => state.user)

	const insets = useSafeAreaInsets();

	const {
		setIsLoading,
		displayToast,
		setLoadingPages,
	} = useAppStore.getState();

	const keyboardHeight = useAppStore(state => state.keyboardHeight);
	const isLoading = useAppStore(state => state.isLoading);
	// const isLoading = useAppStore(state => stat);
	const loadingPages = useAppStore(state => state.loadingPages)
	
	useEffect(() => {
		if (pathname) {
			setLoadingPages([...loadingPages, pathname])
		}
	}, []);

	const [dataLoading, setDataLoading] = useState<{courses: boolean, settings: boolean}>({
		courses: true,
		settings: true 
	})

	const [courses, setCourses] = useState<SelectableCourse[]>([]);

	const [level, setLevel] = useState<Level>(parseInt(_level as string) as Level);
	console.log("🚀 ~ EditSchedule ~ _level:", _level)
	console.log("🚀 ~ EditSchedule ~ level:", level)

	const [courseCode, setCourseCode] = useState<string>(_course_code as string);
	const [courseId, setCourseId] = useState<string>(_course_id as string);
	const [courseTitle, setCourseTitle] = useState<string>('');
	const [courseSchedule, setCourseSchedule] = useState<Array<{dayOfTheWeek: number, startTime: number, duration: number}>>(JSON.parse(_days_of_the_week as string).map((day: number, index: number) => {
		return {
			dayOfTheWeek: day,
			startTime: JSON.parse(_lecture_start_time as string)[index],
			duration: JSON.parse(_lecture_hours as string)[index],
		}
	}));

	const [selectedTime, setSelectedTime] = useState<string | number>('');
	const [updateTimeIndex, setUpdateTimeIndex] = useState<number>(0);
	const [venue, setVenue] = useState<string>(_venue as string);
	
	const [levelOptions, setLevelOptions] = useState<SelectableLevel[]>([
		{
			id: '1',
			value: 100,
			is_selected: _level ? parseInt(_level as string) === 100 : false,
		},
		{
			id: '2',
			value: 200,
			is_selected: _level ? parseInt(_level as string) === 200 : false,
		},
		{
			id: '3',
			value: 300,
			is_selected: _level ? parseInt(_level as string) === 300 : false,
		},
		{
			id: '4',
			value: 400,
			is_selected: _level ? parseInt(_level as string) === 400 : false,
		},
		{
			id: '5',
			value: 500,
			is_selected: _level ? parseInt(_level as string) === 500 : false,
		},
	]);


	const sheetRef = useRef<BottomSheetModal>(null);
	const [sheetParameters, setSheetParameters] = useState<{snapPoints: [string | number], content: BottomSheetContent}>({
		snapPoints: ['50%'],
		content: 'Select Level',
	})

	const openBottomSheet = useCallback((content: BottomSheetContent) => {
		const minHeight = 150;
		const listItemHieght = 60;

		let height = 0;
		if (content === 'Select Level') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*levelOptions.length);
		} else {
			height = HEIGHT + insets.bottom;
		}

		setSheetParameters({
			snapPoints: [height],
			content,
		})

		sheetRef?.current?.present();
	}, [levelOptions])

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}
	

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const coursesResponse = await handleCourses.getAll();

				if (coursesResponse.isSuccessful) {
					setCourses(coursesResponse.data.map(item => ({...item, is_selected: item.id === _course_id})));

					if (_course_id) {
						const course = coursesResponse.data.find(item => item.id === _course_id)!
						if (course?.course_title) {
							setCourseTitle(course?.course_title);
						}
					}
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('courses', setDataLoading)
			}
		}

		fetchCourses();
			
	}, []);

	useEffect(() => {
		if (!dataLoading.courses) {
			// disable loading pages
			setLoadingPages(loadingPages.filter(item => item !== pathname))
		}
	}, [dataLoading.courses, dataLoading.settings]);
	

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

	const handleSelectCourse = useCallback((id: string): void => {
		// This check ensures that 'find' below will succeed.
		if (courses.some(item => item.id === id)) {
			// Add '!' after find(...) to assert it's not null/undefined
			const foundValue = courses.find((item) => item.id === id)!;
			setCourseTitle(foundValue.course_title); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined
			setCourseId(foundValue.id)
			// update lecturer list
			setCourses(prevState => {
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
	}, [courses]); // <-- Add setDean to dependencies

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

	const renderCourseItem = useCallback(({item}: ListRenderItemInfo<SelectableCourse>) => (
		<OptionListItem
			id={item?.id}
			text={item?.course_code}
			subtext={item.course_title}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectCourse(item.id)
			}}
		/>
	), [handleSelectCourse]);

	const handleSelectDay = (day: number) => {
		// update course schedule - remove if exists
		if (courseSchedule.some(i => i.dayOfTheWeek === day)) {
			setCourseSchedule(prevState => {
				return prevState.filter(item => item.dayOfTheWeek !== day)
			})
			return;
		}

		// else add new item in the correct position based on day order
		setCourseSchedule(prevState => {
			const newItem = {
				...prevState[0], // use first item as template
				dayOfTheWeek: day,
			};

			// Find the correct position to insert the new day
			const insertIndex = prevState.findIndex(item => item.dayOfTheWeek > day);
			
			// If no item has a higher day value, append to end
			if (insertIndex === -1) {
				return [...prevState, newItem];
			}
			
			// Otherwise, insert at the correct position
			return [
				...prevState.slice(0, insertIndex),
				newItem,
				...prevState.slice(insertIndex)
			];
		});
	}

	const handleSelectTime = (params: any) => {
		const hours = moment(params.nativeEvent.timestamp).format('H');
		setCourseSchedule(prevState => {
			return prevState.map((item, index) => {
				if (index === updateTimeIndex) {
					return {
						...item,
						startTime: parseInt(hours),
					}
				}
				return item;
			})
		})

		setSelectedTime('')

	}
	
	
	const handleUpdateCourseDuration = (text: string, index: number) => {
		setCourseSchedule(prevState => {
			return prevState.map((item, i) => {
				if (i === index) {
					return {
						...item,
						duration: text ? parseInt(text.replace(' hrs', '')) : 0
					}
				}
				return item;
			})
		})
	}

	const handleUpdateCourse = async (): Promise<void> => {
		try {
			if (!level) return;
			setIsLoading(true);

			const updateResponse = await handleSchedule.update({
				id: _schedule_id as string,
				level: level,
				course_code: courseCode,
				course_id: courseId,
				venue: venue,
				lecture_start_time: courseSchedule.map(item => item.startTime),
				lecture_hours: courseSchedule.map(item => item.duration),
				days_of_the_week: courseSchedule.map(item => item.dayOfTheWeek),
			})
			console.log("🚀 ~ handleUpdateCourse ~ updateResponse:", updateResponse)

			router.back();	
		} catch (error: any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	} 
	

	return (<>
		<ScrollView
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps='handled'
			contentContainerStyle={{
				display: 'flex',
				gap: 20,
				flexGrow: 1,
				paddingHorizontal: 20,
				backgroundColor: colors.white,
				paddingTop: 30,
				paddingBottom: 100 + keyboardHeight,
			}}
		>
			<SelectInput
				label='Select Level'
				placeholder='100 Level'
				onPress={() => openBottomSheet('Select Level')}
				value={level ? `${level}` : ''}
			/>

			<Input
				placeholder='Course Code'
				label='Course Code'
				width={WIDTH - 40}
				defaultValue={courseCode}
				onChangeText={setCourseCode}
			/>

			<Input
				placeholder='Venue'
				label='Venue'
				width={WIDTH - 40}
				defaultValue={venue}
				onChangeText={setVenue}
			/>

			<SelectInput
				label='Course title'
				placeholder='Select course'
				value={courseTitle}
				onPress={() => {
					openBottomSheet('Select Course')
				}}
			/>

			<Flex
				alignItems='center'
				justifyContent='flex-start'
				gap={16}
				flexDirection='row'
				width={'100%'}
				paddingTop={20}
			>
				{[1, 2, 3, 4, 5, 6].map(item => (
					<TouchableOpacity
						key={item}
						onPress={() => handleSelectDay(item)}
					>
						<Flex
							width={35}
							height={35}
							borderRadius={35/2}
							justifyContent='center'
							alignItems='center'
							backgroundColor={courseSchedule.some(i => i.dayOfTheWeek === item) ? colors.primary : colors.lightBackground}
							style={{
								borderWidth: 1,
								borderColor: courseSchedule.some(i => i.dayOfTheWeek === item) ? colors.primary : colors.lightBackground
							}}
						>
							<InterText
								fontWeight={500}
								color={courseSchedule.some(i => i.dayOfTheWeek === item) ? colors.white : colors.subtext}

							>
								{moment().day(item).format('ddd')}
							</InterText>
						</Flex>
					</TouchableOpacity>
				))}
			</Flex>
			<Flex
				gap={16}
				width={'100%'}
			>
				<Flex
					flexDirection='row'
					width={'100%'}
					justifyContent='space-between'
					alignItems='center'
				>
					<InterText
						fontSize={16}
						lineHeight={19}
						fontWeight={500}
					>
						Day
					</InterText>
					<InterText
						fontSize={16}
						lineHeight={19}
						fontWeight={500}
					>
						Start time
					</InterText>
					<InterText
						fontSize={16}
						lineHeight={19}
						fontWeight={500}
					>
						Duration (hrs)
					</InterText>
				</Flex>
				{courseSchedule.map((item, index) => (
					<Flex
						key={index}
						flexDirection='row'
						width={'100%'}
						justifyContent='space-between'
						alignItems='center'
					>
						<InterText>
							{moment().day(item.dayOfTheWeek).format('ddd')}: 
						</InterText>
						<TouchableOpacity
							onPress={() => {
								setSelectedTime(item.startTime)
								setUpdateTimeIndex(index)
							}}
						>
							<InterText>
								{moment(item.startTime, 'H').format('ha')} - {moment(item.duration + item.startTime, 'H').format('ha')}
							</InterText>
						</TouchableOpacity>
						<Flex>
							<Input
								keyboardType='numeric'
								// label='Course duration'
								width={90}
								defaultValue={item.duration ? `${item.duration}` : ''}
								onChangeText={(text) => handleUpdateCourseDuration(text, index)}
								textAlign='center'
							/>
						</Flex>
					</Flex>
				))}
			</Flex>

		</ScrollView>
		<FixedWrapper
			contentContainerStyle={styles.buttonWraper}
		>
			<CustomButton
				text={'Update'}
				isLoading={isLoading}
				disabled={!level}
				onPress={handleUpdateCourse}
			/>
		</FixedWrapper>
		<CustomBottomSheet
			ref={sheetRef}
			sheetTitle={sheetParameters.content}
			snapPoints={sheetParameters.snapPoints}
			closeBottomSheet={closeBottomSheet}
		>
			{sheetParameters.content === 'Select Level' && (
				<BottomSheetFlashList
					data={levelOptions}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderLevelItem}
				/>
			)}

			{sheetParameters.content === 'Select Course' && (
				<BottomSheetFlashList
					data={courses}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderCourseItem}
				/>
			)}

		</CustomBottomSheet>
		{selectedTime && (
			<RNDateTimePicker 
				mode='time' 
				display='clock' 
				value={moment(selectedTime, 'H').toDate()} 
				onChange={handleSelectTime} 
			/>
		)}
	</>)
}

export default EditSchedule

const styles = StyleSheet.create({
	contentContainer: {
		backgroundColor: colors.white,
		paddingHorizontal: 20,
		flex: 1,
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