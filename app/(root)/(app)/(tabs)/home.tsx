// ./app/(app)/(tabs)/home.tsx
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
import handleAuth from '@/api/handleAuth';
import { AccountType, Semester } from '@/types/general';
import handleCourses from '@/api/handleCourses';
import { AttendanceSession, Course, CourseRegistration, Schedule, Setting } from '@/types/api';
import handleSchedule from '@/api/handleSchedule';
import handleSettings from '@/api/handleSettings';
import { getLoadingData } from '@/utilities/getLoadingData';
import handleAttendanceSessions from '@/api/handleAttendanceSessions';
import CustomButton from '@/components/CustomButton';
import handleCourseRegistration from '@/api/handleCourseRegistration';
import Container from '@/components/Container';
import { FlashList } from '@shopify/flash-list';

type DataLoading = {
	colleges: boolean,
	departments: boolean,
	courses: boolean,
	schedules: boolean,
	settings: boolean,
	attendanceSession: boolean,
	courseRegistration: boolean,
}

const Home = () => {

	const router = useRouter();
	const pathname = usePathname();

	const user = useAuthStore(state => state.user)
	// console.log("🚀 ~ Home ~ user:", user?.rfid)

	const {
		displayToast
	} = useAppStore.getState()

	const [tickets, setTickets] = useState([
		{
			id: '1',
			title: 'Card change',
			ticket_id: 1234,
			created_at: moment().subtract(200, 'minutes').toISOString(),
		},
		{
			id: '2',
			title: 'Access issues',
			ticket_id: 1234,
			created_at: moment().subtract(270, 'minutes').toISOString(),
		},
	]);

	const [dataLoading, setDataLoading] = useState<DataLoading>({
		colleges: true,
		departments: true,
		courses: true,
		schedules: true,
		settings: true,
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
	const [attendanceSession, setAttendanceSession] = useState<AttendanceSession | null>(null)
	console.log("🚀 ~ Home ~ attendanceSession:", attendanceSession)
	const [studentAttendanceSession, setStudentAttendanceSession] = useState<AttendanceSession[]>([])
	// console.log("🚀 ~ Home ~ attendanceSession:", attendanceSession)
	// console.log("🚀 ~ Home ~ schedules:", schedules[0])

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

				setAttendanceSession(attendanceSessionResponse.data);

				handleDisableDataLoading('attendanceSession', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceSession();
	}, [user, pathname]);
	
	// fetch attendance session for student
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		if (!courseRegistration?.course_ids) return;
		const fetchAttendanceSession = async () => {
			try {
				const attendanceSessionResponse = await handleAttendanceSessions.getActiveSessionByCourseIds({course_ids: courseRegistration?.course_ids});

				console.log("🚀 ~ fetchAttendanceSession ~ attendanceSessionResponse:", attendanceSessionResponse)
				setStudentAttendanceSession(attendanceSessionResponse.data);

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
					session: settings.find(item => item.key === 'academic_session')?.value as string,
					course_codes: courses.map(item => item.course_code),
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
	}, [settings, courses, user]);

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
					course_codes: courses.map(item => item.course_code),
				});

				setSchedules(scheduleResponse.data);

				handleDisableDataLoading('schedules', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchSchedule();
	}, [settings, courses, user, courseRegistration]);

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


	const daysOfTheWeek = useMemo(() => {
		const weekdays = [1, 2, 3, 4, 5];

		if (dataLoading.schedules || dataLoading.courses) {
			return getLoadingData(['day'], [''], 4);
		}

		return weekdays
			.filter(day => schedules.some(item => item.days_of_the_week.includes(day)))
			.map(day => {
				// Get all schedules for this day
				const daySchedules = schedules
				.filter(item => item.days_of_the_week.includes(day))
				.map(item => {
					const course = courses.find(j => j.course_code === item.course_code);
					const is_active = (user?.account_type === AccountType.Student && day === moment().day() && studentAttendanceSession.some(j => j.course_id === course?.id))
						|| (user?.account_type === AccountType.Lecturer && day === moment().day() && attendanceSession?.course_id === course?.id);
					const attendance_session_id = (() => {
						if (user?.account_type === AccountType.Student && day === moment().day() && studentAttendanceSession.some(j => j.course_id === course?.id)) {
							return studentAttendanceSession.find(j => j.course_id === course?.id)?.id;
						} else if (user?.account_type === AccountType.Lecturer && day === moment().day() && attendanceSession?.course_id === course?.id) {
							return attendanceSession?.id
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
					id: day,
					day,
					schedules: daySchedules,
				};
			});


	}, [schedules, courses, settings, dataLoading.schedules, dataLoading.courses, attendanceSession])

	const renderItem = useCallback(({item}: {item:any}) => (
		<Flex
			gap={10}
			paddingBottom={20}
		>
			{!item.is_loading && (
				<InterText
					fontWeight={500}
					// fontSize={16}
					color={colors.subtext}
				>
					{moment().day(item.day).format('ddd')}
				</InterText>
			)}
			<Flex
				gap={10}
			>
				{item.is_loading && (
					<Flex
						gap={10}
					>
						<Skeleton
							height={17}
							width={50}
						/>
						<Skeleton
							width={WIDTH - 40}
							height={75}
							borderRadius={12}	
						/>
					</Flex>
				)}
				{!item.is_loading &&
				item?.schedules.some((i: Schedule & {course: Course | undefined}) => i.days_of_the_week.includes(item.day)) 
				&& item?.schedules.filter((i: Schedule & {course: Course | undefined}) => i.days_of_the_week.includes(item.day)).map((i: Schedule & {course: Course | undefined, is_active: boolean, attendance_session_id: string | null}, index:number) => (
					<TouchableOpacity
						key={index}
						onPress={() => {
							if (!i.course) return;

							router.push({
								pathname: '/attendance',
								params: {
									_course_id: i?.course?.id as string,
									_course_code: i.course_code,
									_academic_session: settings.find(j => j.key === 'academic_session')?.value as string,
									_semester: settings.find(j => j.key === 'semester')?.value,
									_course_title: i?.course?.course_title as string,
									_attendance_session_id: i?.attendance_session_id
								}
							})
						}}
					>
						<Flex
							borderRadius={12}
							width={WIDTH - 40}
							gap={10}
							flexDirection='row'
							alignItems='flex-start'
							justifyContent='space-between'
							backgroundColor={colors.lightBackground}
							style={{
								padding: 10,
								borderColor: colors.border,
								borderWidth: 1,
							}}
						>
							<Flex>
								<InterText
									color={colors.subtext}
								>
									{moment().hour(i.lecture_start_time[i.days_of_the_week.findIndex(i => i === item.day)]).format('ha')} -&nbsp;
									{moment().hour(i.lecture_start_time[i.days_of_the_week.findIndex(i => i === item.day)] + i.lecture_hours[i.days_of_the_week.findIndex(i => i === item.day)]).format('ha')}
								</InterText>
							</Flex>
							<Flex 
								width={3}
								borderRadius={1.5}
								height={'100%'}
								backgroundColor={colors.primary}
							/>
							<Flex 
								gap={8}
								flex={1}
							>
								<Flex
									flex={1}
									alignSelf='stretch'
									flexDirection='row'
									alignItems='center'
									justifyContent='space-between'
								>
									<InterText
										fontSize={16}
										lineHeight={19}
										fontWeight={'500'}
									>
										{i.course_code}
									</InterText>
									{i.is_active && (
										<Flex
											paddingVertical={5}
											paddingHorizontal={10}
											backgroundColor="#27A55133"
											borderRadius={10}
										>
											<InterText
												color={"green"}
											>
												Active
											</InterText>
										</Flex>
									)}
								</Flex>
								<InterText
									lineHeight={19}
									// fontWeight={'500'}
								>
									{i?.course?.course_title}
								</InterText>
								<InterText
									lineHeight={12}
									color={colors.subtext}
									// fontWeight={'500'}
								>
									{i.level} level • {moment(i.semester, 'd').format('do')} semester • {i.venue}
								</InterText>
							</Flex>
						</Flex>
					</TouchableOpacity>
				))}
				{!item?.is_loading && !item?.schedules.some((i: Schedule) => i.days_of_the_week.includes(item.day)) && (
					<InterText
						color={colors.subtext}
					>
						Nill
					</InterText>
				)}
			</Flex>
		</Flex>
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
											ticketId={item?.ticket_id}
											timestamp={item?.created_at}
										/>
									))}
								</View>
								<LinkText
									onPress={() => {}}
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
							contentContainerStyle={{paddingBottom: 150, paddingTop: 20}}
							estimatedItemSize={100}
							renderItem={renderItem}
							ListHeaderComponent={(
								<Flex
									gap={20}
									width={'100%'}
									paddingBottom={30}
								>
									{(dataLoading.attendanceSession || dataLoading.courses || dataLoading.schedules) && (
										<Flex
											gap={20}
											paddingBottom={10}
										>
											<Skeleton
												width={100}
												height={25}
											/>
											<Flex
												gap={10}
											>
												<Skeleton
													height={17}
													width={50}
												/>
												<Skeleton
													width={WIDTH - 40}
													height={75}
													borderRadius={12}	
												/>
											</Flex>
										</Flex>
									)}	
									{!(dataLoading.attendanceSession || dataLoading.courses || dataLoading.schedules) && attendanceSession && (
										<Flex
											gap={20}
											paddingBottom={10}
										>
											<InterText
												fontSize={20}
												fontWeight={500}
											>
												Unscheduled class
											</InterText>
											<TouchableOpacity
												onPress={() => {
													const course = courses.find(course => course.id === attendanceSession?.course_id)!;
													router.push({
														pathname: '/attendance',
														params: {
															_course_id: course?.id,
															_course_code: course?.course_code,
															_academic_session: settings.find(item => item.key === 'academic_session')?.value as string,
															_course_title: course?.course_title,
															_attendance_session_id: attendanceSession?.id
														}
													})
												}}
											>
												<Flex
													borderRadius={12}
													width={WIDTH - 40}
													gap={10}
													flexDirection='row'
													alignItems='flex-start'
													justifyContent='space-between'
													backgroundColor={colors.lightBackground}
													style={{
														padding: 10,
														borderColor: colors.border,
														borderWidth: 1,
													}}
												>
													<Flex>
														<InterText
															color={colors.subtext}
														>
															{moment(attendanceSession?.started_at!).format('HH:mm')} - {moment(attendanceSession?.ended_at!).format('HH:mm')}
														</InterText>
													</Flex>
													<Flex 
														width={3}
														borderRadius={1.5}
														height={'100%'}
														backgroundColor={colors.primary}
													/>
													<Flex 
														gap={8}
														flex={1}
													>
														<Flex
															flexDirection='row'
															justifyContent='space-between'
															alignItems='center'
															alignSelf='stretch'
														>
															<InterText
																fontSize={16}
																lineHeight={19}
																fontWeight={'500'}
															>
																{courses.find(item => item.id === attendanceSession?.course_id)?.course_code}
															</InterText>
															<Flex
																paddingVertical={5}
																paddingHorizontal={10}
																backgroundColor="#27A55133"
																borderRadius={10}
															>
																<InterText
																	color={"green"}
																>
																	Active
																</InterText>
															</Flex>
														</Flex>
														<InterText
															lineHeight={19}
														>
															{courses.find(item => item.id === attendanceSession?.course_id)?.course_title}
														</InterText>
														<InterText
															lineHeight={12}
															color={colors.subtext}
														>
															{(() => {
																const course = courses.find(course => course.id === attendanceSession?.course_id)!;
																const schedule = schedules.find(schedule => schedule.course_id === attendanceSession?.course_id)!;
																return `${course?.level} level • ${moment(course?.semester, 'd').format('do')} semester • ${schedule?.venue}`
															})()}
														</InterText>
													</Flex>
												</Flex>
											</TouchableOpacity>
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
											You dount have any course register this session
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
							contentContainerStyle={{paddingBottom: 150, paddingTop: 20}}
							estimatedItemSize={100}
							showsVerticalScrollIndicator={false}
							ListHeaderComponent={daysOfTheWeek.length !== 0 ? (
								<Flex
									gap={20}
									width={'100%'}
									paddingBottom={30}
								>
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