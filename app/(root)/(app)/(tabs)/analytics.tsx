import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import Flex from '@/components/Flex'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import InterText from '@/components/InterText'
import SelectInput from '@/components/SelectInput'
import Container from '@/components/Container'
import { FlashList, ListRenderItem, ListRenderItemInfo } from '@shopify/flash-list'
import CourseAttendanceRecordListItem from '@/components/CourseAttendanceRecordListItem'
import { usePathname } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAppStore } from '@/stores/useAppStore'
import { AttendanceRecord, AttendanceSession, Course, CourseRegistration, Schedule, Setting } from '@/types/api'
import { AccountType, Semester } from '@/types/general'
import handleSettings from '@/api/handleSettings'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import handleCourseRegistration from '@/api/handleCourseRegistration'
import handleCourses from '@/api/handleCourses'
import { ActivityIndicator } from 'react-native-paper'
import { getLoadingData } from '@/utilities/getLoadingData'
import moment from 'moment'
import handleAttendanceSessions from '@/api/handleAttendanceSessions'
import handleAttendanceRecords from '@/api/handleAttendanceRecords'
import handleSchedule from '@/api/handleSchedule'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import OptionListItem from '@/components/OptionListItem'

type DataLoading = {
	settings: boolean,
	courseRegistration: boolean,
	courses: boolean,
	attendanceSession: boolean,
	attendanceRecords: boolean,
	schedules: boolean
}

type RecordListItem = {
	id: string,
	course: Course,
	total_classes: number,
	classes_per_week: number,
	total_weeks: number,
	is_loading?: boolean
} 

type SelectableSemester = {
	id: string,
	value: Semester,
	is_selected: boolean
}

type SelectableAcademicSession = {
	id: string,
	value: string,
	is_selected: boolean
}

type BottomSheetContent = 'Select Session' | 'Select Semester';

const Analytics = () => {

	const pathname = usePathname();

	const user = useAuthStore(state => state.user)
	// console.log("🚀 ~ Analytics ~ user:", user?.level)
	const semester = useAuthStore(state => state.semester)
	const academicSession = useAuthStore(state => state.academicSession)
	const numberOfSemesterWeeks = useAuthStore(state => state.numberOfSemesterWeeks)

	const {
		setSemester,
		setNumberOfSemesterWeeks,
		setAcademicSession,
	} = useAuthStore.getState()

	const {
		displayToast
	} = useAppStore.getState()

	const [dataLoading, setDataLoading] = useState<DataLoading>({
		settings: true,
		courseRegistration: true,
		courses: true,
		attendanceSession: true,
		attendanceRecords: true,
		schedules: true,
	})
	// console.log("🚀 ~ Analytics ~ dataLoading:", dataLoading)

	const [settings, setSettings] = useState<Setting[]>([]);
	const [courses, setCourses] = useState<Course[]>([])
	const [courseIds, setCourseIds] = useState<string[]>([])

	const [schedules, setSchedules] = useState<Schedule[]>([])

	const [courseRegistration, setCourseRegistration] = useState<CourseRegistration | null>(null)

	const [studentAttendanceSession, setStudentAttendanceSession] = useState<AttendanceSession[]>([])
	// console.log("🚀 ~ Analytics ~ studentAttendanceSession:", studentAttendanceSession)

	const [studentAttendanceRecords, setStudentAttendanceRecords] = useState<AttendanceRecord[]>([])
	// console.log("🚀 ~ Analytics ~ studentAttendanceRecords:", studentAttendanceRecords)
	
	const [totalPercentage, setTotalPercentage] = useState(0)

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

    const [sessionOptions, setSessionOptions] = useState<SelectableAcademicSession[]>([
        // {
        //     id: '1',
        //     value: `${moment().year()}/${moment().add(1, 'year').year()}`,
        //     is_selected: false,
        // },
        // {
        //     id: '2',
        //     value: `${moment().subtract(1, 'year').year()}/${moment().year()}`,
        //     is_selected: false,
        // },
    ]);
    // console.log("🚀 ~ Analytics ~ sessionOptions:", sessionOptions)

	useEffect(() => {
		if (settings.length > 0) {
			const activeAcademicSession = settings.find(item => item.key === 'academic_session')?.value!;

			if (user?.level) {
				const currentSession = activeAcademicSession;
				const [startYearStr, endYearStr] = currentSession.split('/');
				const startYear = parseInt(startYearStr, 10);
				const endYear = parseInt(endYearStr, 10);
				const numSessions = Math.floor(user.level / 100);

				const sessionArray: SelectableAcademicSession[] = [];
				for (let i = 0; i < numSessions; i++) {
					const sessionStart = startYear - i;
					const sessionEnd = endYear - i;
					const sessionValue = `${sessionStart}/${sessionEnd}`;
					sessionArray.push({
						id: `${i + 1}`,
						value: sessionValue,
						is_selected: sessionValue === academicSession,
					});
				}
				setSessionOptions(sessionArray);
			}
		}
	}, [settings])

    const sheetRef = useRef<BottomSheetModal>(null);
	const [sheetParameters, setSheetParameters] = useState<{snapPoints: [string | number], content: BottomSheetContent}>({
		snapPoints: ['50%'],
		content: 'Select Session',
	})

	const openBottomSheet = useCallback((content: BottomSheetContent) => {
		const minHeight = 180;
		const listItemHieght = 60;

		let height = 0;
		if (content === 'Select Session') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*sessionOptions.length);
		} else if (content === 'Select Semester') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*semesterOptions.length);
		}

		setSheetParameters({
			snapPoints: [height],
			content,
		})

		sheetRef?.current?.present();
	}, [semesterOptions, sessionOptions])

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}

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
    }, [semesterOptions]);

    const handleSelectSession = useCallback((id: string): void => {
        // This check ensures that 'find' below will succeed.
        if (sessionOptions.some(item => item.id === id)) {
            // Add '!' after find(...) to assert it's not null/undefined
            const foundValue = sessionOptions.find((item) => item.id === id)!;
            setAcademicSession(foundValue.value); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

            // update lecturer list
            setSessionOptions(prevState => {
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
    }, [sessionOptions]);

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

    const renderSessionItem = useCallback(({item}: ListRenderItemInfo<SelectableAcademicSession>) => (
		<OptionListItem
			id={item?.id}
			text={`${item.value} academic session`}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectSession(item.id)
			}}
		/>
	), [handleSelectSemster]);

	// fetch settings
	useEffect(() => {
		if (!user) return;
		const fetchSettings = async () => {
			try {
				const settingsResponse = await handleSettings.getAll();

				setSettings(settingsResponse.data);

				setSemester(parseInt(settingsResponse.data.find(item => item.key === 'semester')?.value!) as Semester)
				setAcademicSession(settingsResponse.data.find(item => item.key === 'academic_session')?.value!)

				const startOfSemester = settingsResponse?.data?.find(item => item.key === 'start_of_semester')?.value;
				const endOfSemester = settingsResponse?.data?.find(item => item.key === 'end_of_semester')?.value;

				setNumberOfSemesterWeeks(moment(endOfSemester).diff(moment(startOfSemester), 'weeks'))

				handleDisableDataLoading('settings', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchSettings();
	}, [user]);

	// fetch course registration
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		if (!academicSession) return;

		const fetchCourseRegistration = async () => {
			try {
				if (!academicSession) {
					throw new Error("Cannot find academic session")
				}

				const courseRegistrationReponse = await handleCourseRegistration.getByStudentIdAndSession({
					student_id: user?.id!,
					session: academicSession
				})
				setCourseRegistration(courseRegistrationReponse.data);
				setCourseIds(courseRegistrationReponse?.data?.course_ids || [])

				if (!courseRegistrationReponse.data) {
					handleDisableDataLoading('courses', setDataLoading)
					handleDisableDataLoading('attendanceSession', setDataLoading)
					handleDisableDataLoading('schedules', setDataLoading)
				}

				handleDisableDataLoading('courseRegistration', setDataLoading)

			} catch (error:any) {
				displayToast('ERROR', error?.message)
			}
		}

		fetchCourseRegistration()
		
	}, [user, pathname, academicSession])

	// fetch courses
	useEffect(() => {
		if (courseIds.length === 0) return;

		const fetchLecturerCourses = async () => {
			try {
				const coursesResponse = await handleCourses.getByIds(courseIds)
				setCourses(coursesResponse.data);

				handleDisableDataLoading('courses', setDataLoading)
			} catch (error:any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchLecturerCourses();
	}, [courseIds])

	// fetch attendance session for student
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		if (courseIds.length === 0) return;
		if (!academicSession || !semester) return;

		const fetchAttendanceSession = async () => {
			try {
				const attendanceSessionResponse = await handleAttendanceSessions.getAttendanceSessionBySemesterAcademicSesssionAndCourseIds({
					course_ids: courseIds,
					semester,
					session: academicSession
				});

				setStudentAttendanceSession(attendanceSessionResponse.data);

				handleDisableDataLoading('attendanceSession', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceSession();
	}, [user, courseIds, academicSession, semester]);

	// fetch attendance records for student
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		if (!semester || !academicSession || !user?.id) return;
		const fetchAttendanceRecords = async () => {
			try {
				const attendanceRecordsResponse = await handleAttendanceRecords.getAttendanceRecordsBySemesterSessionAndStudnet({
					semester,
					academic_session: academicSession,
					student_id: user?.id,
				});

				setStudentAttendanceRecords(attendanceRecordsResponse.data)

				handleDisableDataLoading('attendanceRecords', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceRecords();
	}, [user, semester, academicSession]);

	// fetch student schedules
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		if (!semester || !academicSession) return;
		if (courses.length === 0) return;

		const fetchSchedule = async () => {
			try {
				const scheduleResponse = await handleSchedule.getBySessionSemesterAndCourseCode({
					semester,
					session: academicSession,
					course_codes: courses.map(item => item.course_code),
				});
				console.log("🚀 ~ fetchSchedule ~ scheduleResponse:", scheduleResponse)

				setSchedules(scheduleResponse.data);

				handleDisableDataLoading('schedules', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchSchedule();
	}, [semester, academicSession, user, courses]);
	
	const data = useMemo((): Array<RecordListItem> => {
		if (dataLoading.courseRegistration || dataLoading.courses || dataLoading.attendanceRecords || dataLoading.attendanceSession || dataLoading.schedules) {
			return getLoadingData(['course'], [''], 5)
		}

		if (courseIds.length === 0) return []

		return courseIds?.filter(id => courses.some(item => item.id === id && item.semester === semester)).map(id => {
			return {
				id,
				course: courses.find(i => i.id === id)!,
				total_classes: studentAttendanceRecords.filter(item => studentAttendanceSession.some(i => (i.course_id === id) && (i.id === item.attendance_session_id)))?.length,
				classes_per_week: schedules.find(item => item.course_id === id || item?.course_code === courses.find(i => i.id === id)?.course_code)?.days_of_the_week?.length || 1,
				total_weeks: numberOfSemesterWeeks,
				// classes_per_week: 1,
			}
		})
	}, [
		semester,
		courseIds,
		courses,
		dataLoading.courseRegistration,
		dataLoading.courses,
		dataLoading.attendanceRecords,
		dataLoading.attendanceSession,
		numberOfSemesterWeeks,
		studentAttendanceRecords,
		studentAttendanceSession
	])
	
	useEffect(() => {
		if (data.length === 0) return;
		if (dataLoading.courseRegistration || dataLoading.courses || dataLoading.attendanceRecords || dataLoading.attendanceSession || dataLoading.schedules) {
			return
		};

		let totalClasses = 0;
		let totalScheduledClasses = 0;

		for (let index = 0; index < data.length; index++) {
			totalScheduledClasses += data[index]?.classes_per_week * data[index]?.total_weeks;
		}

		for (let index = 0; index < data.length; index++) {
			totalClasses += data[index]?.total_classes;
		}

		setTotalPercentage(parseFloat(((totalClasses / totalScheduledClasses) * 100)?.toFixed(2)))
	}, [
		data,
		dataLoading.courseRegistration,
		dataLoading.courses,
		dataLoading.attendanceRecords,
		dataLoading.attendanceSession,
	])
	// console.log("🚀 ~ Analytics ~ data:", data)


	const renderItem: ListRenderItem<RecordListItem> = useCallback(({item}) => (
		<CourseAttendanceRecordListItem
			course={item?.course}
			isLoading={item?.is_loading}
			totalClasses={item?.total_classes}
			totalWeeks={item?.total_weeks}
			classesPerWeek={item?.classes_per_week}
		/>
	), [])

	return (
		<React.Fragment>
			<Container
				style={styles.container}
			>
				<Flex
					paddingBottom={30}
					flexDirection='row'
					alignItems='center'
					gap={16}
					width={WIDTH - 40}
				>
					<SelectInput
						label='Select Session'
						placeholder='2024/2025'
						value={academicSession}
						width={(WIDTH - 40 - 16)/2}
						onPress={() => {
							openBottomSheet('Select Session')
						}}
					/>
					<SelectInput
						label='Select semester'
						placeholder='1st'
						value={semester ? `${moment(semester, 'd').format('do')} semester` : ''}
						width={(WIDTH - 40 - 16)/2}
						onPress={() => {
							openBottomSheet('Select Semester')
						}}
					/>
				</Flex>
				<Flex
					flexDirection='row'
					gap={16}
					flexWrap='wrap'
					paddingBottom={10}
				>
					<Flex
						gap={10}
						paddingHorizontal={20}
						paddingVertical={20}
						backgroundColor={colors.accentLight}
						borderRadius={10}
						width={(WIDTH - 40 - 16)/2}
					>
						{dataLoading.courseRegistration ? (
							<ActivityIndicator color='black' />
						) : (
							<InterText
								fontWeight={600}
								fontSize={24}
								lineHeight={30}
							>
								{courseRegistration?.course_ids?.length || 0}
							</InterText>
						)}
						<Flex>
							<InterText
								fontWeight={600}
								fontSize={12}
							>
								Registered courses
							</InterText>
						</Flex>
					</Flex>
					<Flex
						gap={10}
						paddingHorizontal={20}
						paddingVertical={20}
						backgroundColor={colors.accentLight}
						borderRadius={10}
						width={(WIDTH - 40 - 16)/2}
					>
						{(dataLoading.courseRegistration || dataLoading.courses || dataLoading.attendanceRecords || dataLoading.attendanceSession || dataLoading.schedules) ? (
							<ActivityIndicator color='black' />
						) : (
							<InterText
								fontWeight={600}
								fontSize={24}
								lineHeight={30}
							>
								{totalPercentage}%
							</InterText>
						)}
						<Flex>
							<InterText
								fontWeight={600}
								fontSize={12}
							>
								Total percentage
							</InterText>
						</Flex>
					</Flex>
				</Flex>
				<Container
					height={HEIGHT - 30 - 40 - 15 - 8 - 10 - 10 - 30 - 17}
					width={'100%'}
					// backgroundColor='pink'
				>
					<FlashList
						data={data}
						keyExtractor={item => item.id}
						contentContainerStyle={{
							paddingBottom: 200
						}}
						renderItem={renderItem}
						estimatedItemSize={80}
						showsVerticalScrollIndicator={false}
						ListEmptyComponent={(
							<Flex
								width={'100%'}
								height={HEIGHT/3}
								justifyContent='center'
								alignItems='center'
							>
								<InterText
									fontWeight={600}
									fontSize={16}
								>
									No records found
								</InterText>
							</Flex>
						)}	
					/>
				</Container>
			</Container>
			<CustomBottomSheet
				ref={sheetRef}
				sheetTitle={sheetParameters.content}
				snapPoints={sheetParameters.snapPoints}
				closeBottomSheet={closeBottomSheet}
			>
				{sheetParameters.content === 'Select Session' && (
					<BottomSheetFlashList
						data={sessionOptions}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{paddingTop: 50}}
						estimatedItemSize={81}
						renderItem={renderSessionItem}
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
			</CustomBottomSheet>
		</React.Fragment>
	)
}

export default Analytics

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: colors.white,
		paddingHorizontal: 20,
		paddingTop: 40,
	}
})