// ./app/(app)/(tabs)/home.tsx
import { AppState, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { colors } from '@/utilities/colors'
import InterText from '@/components/InterText'
import CollegeIcon from '@/assets/svg/CollegeIcon.svg';
import DepartmentIcon from '@/assets/svg/DepartmentIcon.svg';
import SolidArrowIcon from '@/assets/svg/SolidArrowIcon.svg';
import AddCircleLargeIcon from '@/assets/svg/AddCircleLargeIcon.svg';
import { HEIGHT, WIDTH } from '@/utilities/dimensions';
import LinkText from '@/components/LinkText';
import moment from 'moment';
import TicketListItem from '@/components/TicketLIstItem';
import Flex from '@/components/Flex';
import { usePathname, useRouter } from 'expo-router';
import handleColleges from '@/api/handleColleges';
import { useAppStore } from '@/stores/useAppStore';
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading';
import Skeleton from '@/components/Skeleton';
import handleDepartments from '@/api/handleDepartments';
import { useAuthStore } from '@/stores/useAuthStore';
import { AccountType, Semester } from '@/types/general';
import handleCourses from '@/api/handleCourses';
import { AttendanceSession, Course, CourseRegistration, Department, Schedule, Setting, Ticket } from '@/types/api';
import handleSchedule from '@/api/handleSchedule';
import handleSettings from '@/api/handleSettings';
import { getLoadingData } from '@/utilities/getLoadingData';
import handleAttendanceSessions from '@/api/handleAttendanceSessions';
import CustomButton from '@/components/CustomButton';
import handleCourseRegistration from '@/api/handleCourseRegistration';
import Container from '@/components/Container';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import ScheduleListItem from '@/components/ScheduleListItem';
import handleTickets from '@/api/handleTickets';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type DataLoading = {
	tickets: boolean,
	colleges: boolean,
	departments: boolean,
	courses: boolean,
	schedules: boolean,
	settings: boolean,
	attendanceSession: boolean,
	courseRegistration: boolean,
}

type ScehduleListRenderItem = {
	id: string,
    is_loading?: boolean,
    day: number,
    schedules: Array<Schedule & {
        course: Course | undefined,
        is_active?: boolean, 
        attendance_session_id?: string | null
    }>,
}

const Home = () => {


	const router = useRouter();
	const pathname = usePathname();

	const user = useAuthStore(state => state.user)
	const semester = useAuthStore(state => state.semester)
	const academicSession = useAuthStore(state => state.academicSession)

	const {
		setSemester,
		setAcademicSession,
	} = useAuthStore.getState()
	// console.log("🚀 ~ Home ~ user:", user?.rfid)

	const {
		displayToast
	} = useAppStore.getState()

	const [tickets, setTickets] = useState<Ticket[]>([]);

	const [dataLoading, setDataLoading] = useState<DataLoading>({
		colleges: true,
		departments: true,
		courses: true,
		schedules: true,
		settings: true,
		tickets: true,
		attendanceSession: true,
		courseRegistration: true,
	})
	// console.log("🚀 ~ Home ~ dataLoading:", dataLoading)

	const [numberOfColleges, setNumberOfColleges] = useState<number | null>(null)
	const [numberOfDepartments, setNumberOfDepartments] = useState<number | null>(null)
	const [settings, setSettings] = useState<Setting[]>([]);
	const [courses, setCourses] = useState<Course[]>([])
	const [courseIds, setCourseIds] = useState<string[]>([])

	const [courseRegistration, setCourseRegistration] = useState<CourseRegistration | null>(null)
	const [schedules, setSchedules] = useState<Schedule[]>([])
	const [attendanceSession, setAttendanceSession] = useState<AttendanceSession[]>([])

	const [department, setDepartment] = useState<Department | null>(null);

	// 1. State to track the app's focus (foreground/background)
	const [appState, setAppState] = useState(AppState.currentState);

	// Effect to listen for app focus changes
	useEffect(() => {
		const subscription = AppState.addEventListener('change', nextAppState => {
			setAppState(nextAppState);
		});

		// Cleanup the listener on component unmount
		return () => {
			subscription.remove();
		};
	}, []);

	useEffect(() => {
		if (!user?.department_id) return; 
		if (user?.account_type === AccountType.Admin) return;
		const fetchDepartment = async () => {
			try {
				const departmentResponse = await handleDepartments.getById(user?.department_id!);
				// console.log("🚀 ~ fetchDepartment ~ departmentResponse:", departmentResponse)

				if (departmentResponse.data) {
					setDepartment(departmentResponse.data)
				}

				handleDisableDataLoading('departments', setDataLoading)
			} catch (error:any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchDepartment()
	}, [user])

	useEffect(() => {
		setCourseIds(user?.course_ids || [])
	}, [user])

	// get colleges
	useEffect(() => {
		if (user?.account_type !== AccountType.Admin) return;
		const fetchColleges = async (): Promise<void> => {
			try {
				const collegesResponse = await handleColleges.getAll();
				
				setNumberOfColleges(collegesResponse.data.length);
			
				handleDisableDataLoading('colleges', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchColleges()
	}, [user]);

	useEffect(() => {
		if (user?.account_type === AccountType.Lecturer && !user.pin) {
			router.replace('/completeRegistration')
		}
	}, [user])

	// get departments
	useEffect(() => {
		if (user?.account_type !== AccountType.Admin) return;
		const fetchDepartments = async (): Promise<void> => {
			try {
				const departmentsResponse = await handleDepartments.getAll();
				setNumberOfDepartments(departmentsResponse.data.length);
			
				handleDisableDataLoading('departments', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchDepartments()
	}, [user]);

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

	// fetch course registration
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		if (settings.length === 0) return;

		const fetchCourseRegistration = async () => {
			try {
				const session = settings.find(item => item.key === 'academic_session')?.value;

				if (!session) {
					throw new Error("Cannot find academic session")
				}

				const courseRegistrationReponse = await handleCourseRegistration.getByStudentIdAndSession({
					student_id: user?.id!,
					session
				})

				if (courseRegistrationReponse.data) {
					setCourseRegistration(courseRegistrationReponse.data);
					setCourseIds(courseRegistrationReponse?.data?.course_ids)
				} else {
					handleDisableDataLoading('courses', setDataLoading)
					handleDisableDataLoading('schedules', setDataLoading)
					handleDisableDataLoading('attendanceSession', setDataLoading)
				}

				handleDisableDataLoading('courseRegistration', setDataLoading)

			} catch (error:any) {
				displayToast('ERROR', error?.message)
			}
		}

		fetchCourseRegistration()
		
	}, [settings, user, pathname])

	// fetch settings
	useEffect(() => {
		if (!user) return;
		if (user?.account_type === AccountType.Admin) return;
		const fetchSettings = async () => {
			try {
				const settingsResponse = await handleSettings.getAll();

				setSettings(settingsResponse.data);

				setSemester(parseInt(settingsResponse.data.find(item => item.key === 'semester')?.value!) as Semester)
				setAcademicSession(settingsResponse.data.find(item => item.key === 'academic_session')?.value!)

				if (settingsResponse.data.length === 0) {
					handleDisableDataLoading('schedules', setDataLoading)
				}

				handleDisableDataLoading('settings', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchSettings();
	}, [user]);

	// fetch attendance session for lecturer
	useEffect(() => {
		if (user?.account_type !== AccountType.Lecturer) return;
		const fetchAttendanceSession = async () => {
			try {
				const attendanceSessionResponse = await handleAttendanceSessions.getActiveSessionByLecturerId({lecturer_id: user?.id!});

				setAttendanceSession(attendanceSessionResponse.data ? [attendanceSessionResponse.data] : []);

				handleDisableDataLoading('attendanceSession', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceSession();
	}, [user, pathname]);

	useEffect(() => {
		if (!department?.department_name) return;

		let channel: RealtimeChannel | null = null

		const setupChannel = async () => {
			await supabase.realtime.setAuth()
			channel = supabase
				.channel(`topic:${department?.department_name}`, {
					config: {
						private: true
					}
				})
				.on(
					'broadcast',
					{
						event: '*',
					},
					(data) => {
						const record = data?.payload?.record as AttendanceSession;
						console.log("🚀 ~ setupChannel ~ data:", data)
						console.log("🚀 ~ setupChannel ~ record:", record)
						if (record) {
							setAttendanceSession(prevState => {
								console.log("🚀 ~ setupChannel ~ prevState:", prevState)
								if (prevState.some(item => item.id === record.id) && record?.is_active === false) {
									return prevState.filter(item => item.id !== record.id)
								}
								return [...prevState, record]
							})
						}
						// console.log("🚀 ~ setupChannel ~ payload:", payload)
					}
				)
				.subscribe((status, err) => {
					console.log("🚀 ~ Home ~ err:", err)
					console.log("🚀 ~ Home ~ status:", status)
				});
		}
		
		setupChannel()

		return () => {
			if (channel) {
				supabase.removeChannel(channel)
			}
		}
	}, [department, appState])
	
	// fetch attendance session for student
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		if (!courseRegistration?.course_ids) return;
		const fetchAttendanceSession = async () => {
			try {
				const attendanceSessionResponse = await handleAttendanceSessions.getActiveSessionByCourseIds({course_ids: courseRegistration?.course_ids});

				// console.log("🚀 ~ fetchAttendanceSession ~ attendanceSessionResponse:", attendanceSessionResponse)
				setAttendanceSession(attendanceSessionResponse.data);

				handleDisableDataLoading('attendanceSession', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceSession();
	}, [user, pathname, courseRegistration]);

	// fetch lecturer schedules
	useEffect(() => {
		if (user?.account_type !== AccountType.Lecturer) return;
		if (settings.length === 0) return;
		if (courses.length === 0) return;
		if (!academicSession) return;
		if (!semester) return;

		const fetchSchedule = async () => {
			try {
				const scheduleResponse = await handleSchedule.getBySessionSemesterAndCourseCode({
					semester,
					session: academicSession,
					course_codes: courses.filter(item => item.semester === semester).map(item => item.course_code),
				});
				// console.log("🚀 ~ fetchSchedule ~ semester:", semester)
				// console.log("🚀 ~ fetchSchedule ~ scheduleResponse:", scheduleResponse.data[0])

				setSchedules(scheduleResponse.data);

				handleDisableDataLoading('schedules', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchSchedule();
	}, [settings, courses, user, academicSession, semester]);

	// fetch student schedules
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		if (settings.length === 0) return;
		if (courses.length === 0) return;
		if (courseRegistration === null) return;


		const fetchSchedule = async () => {
			try {
				const semester: Semester =  parseInt(settings.find(item => item.key === 'semester')?.value as string) as Semester;
				
				const session = settings.find(item => item.key === 'academic_session')?.value as string;

				if (!semester) {
					throw new Error("Cannot find semester")
				}

				if (!session) {
					throw new Error("Cannot find academic session")
				}

				const scheduleResponse = await handleSchedule.getBySessionSemesterAndCourseCode({
					semester,
					session,
					course_codes: courses.filter(item => item.semester === semester).map(item => item.course_code),
				});

				setSchedules(scheduleResponse.data);

				handleDisableDataLoading('schedules', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchSchedule();
	}, [settings, courses, user, courseRegistration]);

	useEffect(() => {
		const fetchTickets = async () => {
			try {
				const ticketResponse = await handleTickets.getAllOpenTickets(2);
				// console.log("🚀 ~ fetchTickets ~ ticketResponse:", ticketResponse)

				setTickets(ticketResponse.data);

				handleDisableDataLoading('tickets', setDataLoading)
			} catch (error:any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchTickets()
	}, [pathname])

	const stats = useMemo((): Array<{stat_name: string, value: number | null, is_loading: boolean, Icon: ReactNode}> => {
		return [
			{
				stat_name: 'Colleges',
				value: numberOfColleges,
				is_loading: dataLoading.colleges,
				Icon: <CollegeIcon width={20} height={20} />
			},
			{
				stat_name: 'Departments',
				value: numberOfDepartments,
				is_loading: dataLoading.departments,
				Icon: <DepartmentIcon width={20} height={20} />
			},
		]
	}, [dataLoading, numberOfColleges, numberOfDepartments]);


	const daysOfTheWeek = useMemo((): Array<ScehduleListRenderItem> => {
		const weekdays = [1, 2, 3, 4, 5];

		if (dataLoading.schedules || dataLoading.courses || dataLoading.attendanceSession) {
			return getLoadingData(['day'], [''], 4);
		}

		const array: ScehduleListRenderItem[] = weekdays
			.filter(day => schedules.some(item => item.days_of_the_week.includes(day)))
			.map(day => {
				// Get all schedules for this day
				const daySchedules = schedules
				.filter(item => item.days_of_the_week.includes(day))
				.map(item => {
					const course = courses.find(j => j.id === item.course_id);
					const is_active = (day === moment().day() && attendanceSession.some(j => j.course_id === course?.id));
					const attendance_session_id = (() => {
						if (day === moment().day() && attendanceSession.some(j => j.course_id === course?.id)) {
							return attendanceSession.find(j => j.course_id === course?.id)?.id;
						}
						return null
					})();
					return {
						...item,
						course,
						attendance_session_id,
						is_active,
					};
				})
				.sort((a, b) => {
					// Find the index of the day in days_of_the_week for each schedule
					const aIndex = a.days_of_the_week.findIndex((d: number) => d === day);
					const bIndex = b.days_of_the_week.findIndex((d: number) => d === day);
					// Use the index to get the correct start time
					const aStart = a.lecture_start_time[aIndex] ?? 0;
					const bStart = b.lecture_start_time[bIndex] ?? 0;
					return aStart - bStart;
				});

				return {
					id: day?.toString(),
					day,
					schedules: daySchedules,
				};
			});

		return array;

	}, [schedules, attendanceSession, courses, settings, dataLoading.schedules, dataLoading.courses, dataLoading.attendanceSession])
	// console.log("🚀 ~ daysOfTheWeek:", daysOfTheWeek)

	const unscheduledClasses = useMemo((): Array<ScehduleListRenderItem> => {
		if (dataLoading.schedules || dataLoading.courses || dataLoading.attendanceSession) {
			return [];
		}

			// console.log("🚀 ~ schedules:", schedules)
		return attendanceSession.filter(item => {
			return schedules.some(i => i.course_id === item.course_id && i.days_of_the_week.every(j => j !== moment().day()))
		}).map(item => {
			const course = courses.find(j => j.id === item.course_id);
			const schedule = schedules[0]!;
			return {
				id: item.id,
				day: moment().day(),
				schedules: [
					{
						...schedule,
						id: Math.random()?.toString(),
						course_code: course?.course_code ?? '',
						course_title: course?.course_title ?? '',
						days_of_the_week: [moment().day()],
						lecture_start_time: [moment(item.created_at).hour()],
						lecture_hours: [moment(item.ended_at).diff(moment(item.created_at), 'hours')],
						attendance_session_id: item.id,
						course,
						is_active: true
					}
				],
			}
		})
	}, [schedules, attendanceSession, courses, settings, dataLoading.schedules, dataLoading.courses, dataLoading.attendanceSession])

	const renderItem: ListRenderItem<ScehduleListRenderItem> = useCallback(({item}) => (
		<ScheduleListItem
			{...item}
			isLoading={item?.is_loading}
			onPress={(schedule) => {
				// console.log("🚀 ~ schedule:", schedule)
				if (!schedule.course) return;
				// return;

				router.push({
					pathname: '/attendance',
					params: {
						_course_id: schedule?.course?.id as string,
						_course_code: schedule.course_code,
						_academic_session: settings.find(j => j.key === 'academic_session')?.value as string,
						_semester: settings.find(j => j.key === 'semester')?.value,
						_course_title: schedule?.course?.course_title as string,
						_attendance_session_id: schedule?.attendance_session_id
					}
				})
			}}
		/>
	), [settings])

	return (
		<React.Fragment>
			{user?.account_type === AccountType.Admin && (
				<ScrollView
					contentContainerStyle={styles.contentContainer}
				>
					<View style={styles.main}>
						<View style={styles.statSection}>
							<InterText
								fontSize={14}
								lineHeight={17}
							>
								Stats
							</InterText>
							<View style={styles.statsContainer}>
								{stats.map(item => (
									<View key={item?.stat_name} style={styles.stat}>
										{item.is_loading ? (
											<Skeleton
												width={35}
												height={29}
												borderRadius={2.5}
											/>
										) : (
											<InterText
												fontSize={24}
												lineHeight={29}
												fontWeight={600}
											>
												{item.value}
											</InterText>
										)}
										<View style={styles.statDescription}>
											{item.Icon}
											<View style={styles.statName}>
												<InterText
													numberOfLines={1}
													fontWeight={600}
													color={colors.subtext}
													// fontSize={10}
												>
													{item?.stat_name}
												</InterText>
											</View>
										</View>
									</View>
								))}
							</View>
						</View>
						<View style={styles.ticketSection}>
							<View style={styles.ticketHeader}>
								<InterText>
									Open Tickets
								</InterText>
								<SolidArrowIcon />
							</View>
							<View style={styles.tickets}>
								<View style={styles.ticketList}>
									{tickets.map((item, index) => (
										<TicketListItem
											key={item.id}
											index={index}
											title={item?.title}
											description={item?.description}
											timestamp={item?.created_at}
										/>
									))}
									{!dataLoading.tickets && tickets.length === 0 && (
										<InterText>
											Yopu have no pending tickets
										</InterText>
									)}
								</View>
								<LinkText
									onPress={() => {
										router.push('/tickets')
									}}
								>
									View all
								</LinkText>
							</View>
						</View>
						<TouchableOpacity
							style={styles.scanCardButton}
							onPress={() => {
								router.push('/(root)/(app)/(card)/scanCard')
							}}
						>
							<Flex
								style={styles.scanCardButtonContent}
								gap={34}
								justifyContent='center'
								alignItems='center'
								flexDirection='row'
							>
								<View style={styles.addIconWrapper}>
									<AddCircleLargeIcon />
								</View>
								<InterText
									fontSize={24}
									lineHeight={24}
									color={colors.label}
								>
									Scan New Card
								</InterText>
							</Flex>
						</TouchableOpacity>
					</View>
				</ScrollView>
			)}
			{user?.account_type === AccountType.Lecturer && (
				<React.Fragment>
					<Container
						width={WIDTH}
						paddingHorizontal={20}
						height={HEIGHT}
						backgroundColor={colors.white}
					>
						<FlashList
							data={daysOfTheWeek}
							keyExtractor={item => item.id}
							contentContainerStyle={{paddingBottom: 250, paddingTop: 20}}
							estimatedItemSize={100}
							renderItem={renderItem}
							ListHeaderComponent={(
								<Flex
									gap={20}
									width={'100%'}
									paddingBottom={30}
								>
									{unscheduledClasses.length > 0 && (
										<Flex
											gap={30}
										>
											<InterText
												fontSize={20}
												fontWeight={500}
											>
												Un-scheduled class
											</InterText>
											<Flex
											>
												{unscheduledClasses.map(item => (
													<ScheduleListItem
														key={item.id}
														{...item}
														isLoading={item?.is_loading}
														onPress={(schedule) => {
															if (!schedule.course) return;

															router.push({
																pathname: '/attendance',
																params: {
																	_course_id: schedule?.course?.id as string,
																	_course_code: schedule.course_code,
																	_academic_session: settings.find(j => j.key === 'academic_session')?.value as string,
																	_semester: settings.find(j => j.key === 'semester')?.value,
																	_course_title: schedule?.course?.course_title as string,
																	_attendance_session_id: schedule?.attendance_session_id
																}
															})
														}}
													/>
												))}
											</Flex>
										</Flex>
									)}
									<InterText
										fontSize={20}
										fontWeight={500}
									>
										Schedule
									</InterText>
								</Flex>
							)}
							ListEmptyComponent={(
								<Flex
									flex={1}
									justifyContent='center'
									alignItems='center'
									gap={20}
									// width={'80%'}
								>
									<Flex
										gap={8}
										alignItems='center'
										justifyContent='center'
										// paddingHorizontal={30}
									>
										<InterText
											fontSize={20}
											lineHeight={19}
											fontWeight={500}
											textAlign='center'
										>
											You dount have any courses to lecture this semester
										</InterText>
										<InterText
											textAlign={'center'}
											color={colors.subtext}
										>
											You would see the schedule for your assigned courses here
										</InterText>
									</Flex>
									<CustomButton
										text='Register courses'
										onPress={() => {
											router.push('/registerCourse')
										}}
									/>
								</Flex>
							)}
						/>
					</Container>
				</React.Fragment>
			)}
			{user?.account_type === AccountType.Student && (
				<React.Fragment>
					<Container
						width={WIDTH}
						paddingHorizontal={20}
						height={HEIGHT}
						backgroundColor={colors.white}
					>
						<FlashList
							data={daysOfTheWeek}
							keyExtractor={item => item.id}
							contentContainerStyle={{paddingBottom: 250, paddingTop: 20}}
							estimatedItemSize={100}
							showsVerticalScrollIndicator={false}
							ListHeaderComponent={daysOfTheWeek.length !== 0 ? (
								<Flex
									gap={20}
									width={'100%'}
									paddingBottom={30}
								>
									{unscheduledClasses.length > 0 && (
										<Flex
											gap={30}
										>
											<InterText
												fontSize={20}
												fontWeight={500}
											>
												Un-scheduled class
											</InterText>
											<Flex
											>
												{unscheduledClasses.map(item => (
													<ScheduleListItem
														key={item.id}
														{...item}
														isLoading={item?.is_loading}
														onPress={(schedule) => {
															if (!schedule.course) return;

															router.push({
																pathname: '/attendance',
																params: {
																	_course_id: schedule?.course?.id as string,
																	_course_code: schedule.course_code,
																	_academic_session: settings.find(j => j.key === 'academic_session')?.value as string,
																	_semester: settings.find(j => j.key === 'semester')?.value,
																	_course_title: schedule?.course?.course_title as string,
																	_attendance_session_id: schedule?.attendance_session_id
																}
															})
														}}
													/>
												))}
											</Flex>
										</Flex>
									)}
									<InterText
										fontSize={20}
										fontWeight={500}
									>
										Schedule
									</InterText>
								</Flex>
							) : undefined}
							renderItem={renderItem}
							ListEmptyComponent={(
								<Flex
									flex={1}
									justifyContent='center'
									alignItems='center'
									gap={20}
									height={HEIGHT/2}
									// width={'80%'}
								>
									<Flex
										gap={8}
										alignItems='center'
										justifyContent='center'
										// paddingHorizontal={30}
									>
										<InterText
											fontSize={20}
											lineHeight={19}
											fontWeight={500}
											textAlign='center'
										>
											You don't have any course registered this session
										</InterText>
										<InterText
											textAlign={'center'}
											color={colors.subtext}
										>
											Please quicky register your course to start logging your attendance
										</InterText>
									</Flex>
									<CustomButton
										text='Register courses'
										onPress={() => {
											router.push('/registerCourse')
										}}
									/>
								</Flex>
							)}
						/>
					</Container>
				</React.Fragment>
			)}
		</React.Fragment>

	)
}

export default Home

const styles = StyleSheet.create({
	contentContainer: {
		backgroundColor: colors.white,
		flexGrow: 1,
		paddingHorizontal: 20,
	},
	main: {
		paddingTop: 50,
		display: 'flex',
		gap: 50,
		width: '100%',
	},
	statSection: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		gap: 7,
	},
	statsContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		flexDirection: 'row',
		gap: 20,
	},
	stat: {
		width: (WIDTH - 60)/2,
		height: 96,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-start',
		paddingHorizontal: 22,
		backgroundColor: colors.accentLight,
		borderRadius: 10,
		gap: 7,
	},
	statDescription: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		gap: 10,
	},
	statName: {
		flex: 1,
	},
	ticketSection: {
		display: 'flex',
		width: '100%',
		gap: 13,
	},
	ticketHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.lightGrey,
		borderRadius: 10,
		flexDirection: 'row',
		paddingVertical: 4,
		paddingHorizontal: 5,
	},
	tickets: {
		display: 'flex',
		gap: 7,
		justifyContent: 'flex-start',
		alignItems: 'flex-end',
	},
	ticketList: {
		width: '100%',
		borderRadius: 11,
		borderWidth: 1,
		borderColor: colors.lightGrey,
		padding: 10,
		gap: 11,
		display: 'flex',
	},
	scanCardButton: {
		borderRadius: 11,
		width: '100%',
		elevation: 5,
		backgroundColor: colors.white,
		shadowOpacity: 0.4,
		shadowRadius: 30,
		shadowColor: colors.label,
	},
	scanCardButtonContent: {
		paddingVertical: 38,
		borderWidth: 1,
		borderColor: colors.lightGrey,
		borderRadius: 11,
		width: '100%',
		position: 'relative',
	},
	addIconWrapper: {
		position: 'absolute',
		left: 24,
	}
	
})