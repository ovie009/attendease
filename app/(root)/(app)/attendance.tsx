import CardIcon from '@/assets/svg/CardIcon.svg';
import { AppState, Linking, StyleSheet, TextInput } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Flex from '@/components/Flex'
import { router, useLocalSearchParams, usePathname } from 'expo-router'
import InterText from '@/components/InterText'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import Container from '@/components/Container'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import { FlashList, ListRenderItem } from '@shopify/flash-list'
import FixedButton from '@/components/FixedButton'
import EmptyAttendanceIcon from '@/assets/svg/EmptyAttendanceIcon.svg'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import Input from '@/components/Input'
import { ActivityIndicator } from 'react-native-paper';
import { useAppStore } from '@/stores/useAppStore';
import * as Crypto from 'expo-crypto';
import { useAuthStore } from '@/stores/useAuthStore';
import * as Location from 'expo-location'
import { Alert } from 'react-native';
import { AccountType, Region, Semester } from '@/types/general';
import handleAttendanceSessions from '@/api/handleAttendanceSessions';
import moment from 'moment';
import MQTTService from '@/api/MQTTService';
import * as LocalAuthentication from 'expo-local-authentication';
import handleAttendanceRecords from '@/api/handleAttendanceRecords';
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading';
import { AttendanceRecord, AttendanceSession, Lecturer, Student } from '@/types/api';
import handleLecturers from '@/api/handleLecturers';
import { getLoadingData } from '@/utilities/getLoadingData';
import ClassAttendedListItem from '@/components/ClassAttendedListItem';
import Skeleton from '@/components/Skeleton';
import handleStudents from '@/api/handleStudents';
import StudentAttendancRecord, { StudentAttendancRecordProps } from '@/components/StudentAttendancRecord';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type DataLoading = {
	attendanceSession: boolean,
	attendanceRecords: boolean,
	lecturers: boolean,
	students: boolean,
}


const Attendance = () => {

	const {
		_course_code,
		_course_title,
		_course_id,
		_academic_session,
		_semester,
		_attendance_session_id
	} = useLocalSearchParams();
		console.log("🚀 ~ Attendance ~ _attendance_session_id:", _attendance_session_id)
		console.log("🚀 ~ Attendance ~ _course_id:", _course_id)

	const pathname = usePathname();

	const {
		displayToast,
		setLoadingPages,
		setIsLoading
	} = useAppStore.getState()

	const isLoading = useAppStore(state => state.isLoading);
	const keyboardHeight = useAppStore(state => state.keyboardHeight);
	const loadingPages = useAppStore(state => state.loadingPages)

	const semester = useAuthStore(state => state.semester)
	const academicSession = useAuthStore(state => state.academicSession)

	const user = useAuthStore(state => state.user);
	// console.log("🚀 ~ Attendance ~ user:", user?.rfid)

	const scannedCard = useAppStore(state => state.scannedCard);
	const scannedCardTopic = useAppStore(state => state.scannedCardTopic);

	const durationRef = useRef<TextInput>(null)
	const [duration, setDuration] = useState<string>('')
	const [isFetchingCard, setIsFetchingCard] = useState<boolean>(false);

	const [userCoordinates, setUserCoordinates] = useState<Region | null>(null)
	console.log("🚀 ~ Attendance ~ userCoordinates:", userCoordinates)

	const [attendeaseDeviceId, setAttendeaseDeviceId] = useState<string>('');

	const sheetRef = useRef<BottomSheetModal>(null);

	const [attendanceSession, setAttendanceSession] = useState<AttendanceSession[]>([])
	const [lecturers, setLecturers] = useState<Lecturer[]>([]);
	const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])	
	const [students, setStudents] = useState<Student[]>([]);

	const [isEnded, setIsEnded] = useState<boolean>(false);

	const [dataLoading, setDataLoading] = useState<DataLoading>({
		attendanceSession: true,
		attendanceRecords: true,
		lecturers: true,
		students: true
	})

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


	const openBottomSheet = () => {
		sheetRef.current?.present();
	}
	
	const closeBottomSheet = () => {
		sheetRef.current?.present();
	}

	// fetch attendance session for student
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		const fetchAttendanceSession = async () => {
			try {
				const attendanceSessionResponse = await handleAttendanceSessions.getAttendanceSessionBySemesterAcademicSesssionAndCourseIds({
					course_ids: [_course_id as string],
					semester: parseInt(_semester as string) as Semester,
					session: _academic_session as string,
					limit: 1,
				});
				// console.log("🚀 ~ fetchAttendanceSession ~ attendanceSessionResponse:", attendanceSessionResponse)

				setAttendanceSession(attendanceSessionResponse.data);

				if (attendanceSessionResponse.data.length === 0) {
					handleDisableDataLoading('attendanceRecords', setDataLoading)
					handleDisableDataLoading('lecturers', setDataLoading)
				}

				handleDisableDataLoading('attendanceSession', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceSession();
	}, []);

	// fetch attendance records for lecturers
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		if (attendanceSession.length === 0) return;
		const fetchAttendanceRecords = async () => {
			try {
				const attendanceRecordsResponse = await handleAttendanceRecords.getAttendanceRecordsByAttendanceSessionSemesterSessionAndStudent({
					semester: parseInt(_semester as string) as Semester,
					academic_session: _academic_session as string,
					student_id: user?.id!,
					attendance_session_ids: attendanceSession.map(item => item.id),
				});
				setAttendanceRecords(attendanceRecordsResponse.data)

				handleDisableDataLoading('attendanceRecords', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceRecords();
	}, [attendanceSession]);

	// fetch attendance records for lecturers
	useEffect(() => {
		if (user?.account_type !== AccountType.Lecturer) return;
		if (!_attendance_session_id) return;
		const fetchAttendanceRecords = async () => {
			try {
				const attendanceRecordsResponse = await handleAttendanceRecords.getRecordsForAttendanceSession({
					semester: parseInt(_semester as string) as Semester,
					academic_session: _academic_session as string,
					attendance_session_ids: [_attendance_session_id as string],
				});
				// console.log("🚀 ~ fetchAttendanceRecords ~ attendanceRecordsResponse:", attendanceRecordsResponse)
				setAttendanceRecords(attendanceRecordsResponse.data)

				if (attendanceRecordsResponse?.data?.length === 0) {
					handleDisableDataLoading('students', setDataLoading)
				}

				handleDisableDataLoading('attendanceRecords', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceRecords();
	}, [attendanceSession]);

	const handleRealtimeMessages = async (newRecord: AttendanceRecord) => {
        // if data is updated
        try {
            // update item at designated id
            setAttendanceRecords(prevValue => {
                if (prevValue.some(item => item.id === newRecord?.id)) {
                    return prevValue.map(item => {
                        if (newRecord?.id === item.id) {
                            return newRecord;
                        } 
                        return item;
                    })
                }
                return [
                    ...prevValue,
                    newRecord,
                ]
            });


        } catch (error:any) {
            displayToast('ERROR', error?.message)                
        }
    }

	useEffect(() => {
		if (!_attendance_session_id) return;

		let channel: RealtimeChannel | null = null

		const setupChannel = async () => {
			await supabase.realtime.setAuth()
			channel = supabase
				.channel(`topic:${_attendance_session_id}`, {
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
						const record = data?.payload?.record as AttendanceRecord;
						console.log("🚀 ~ setupChannel ~ record:", record)
						if (record) {
							setAttendanceRecords(prevState => {
								if (prevState.some(item => item.id === record.id)) {
									return prevState.map(item => {
										if (item.id === record.id) {
											return record;
										}
										return item
									})
								}
								return [...prevState, record]
							})
						}
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
	}, [_attendance_session_id, appState])


	useEffect(() => {
		if (attendanceRecords.length === 0) return;
		if (user?.account_type !== AccountType.Lecturer) return;
		const fetchStudents = async (): Promise<void> => {
			try {
				const ids = attendanceRecords.map(item => item.student_id);
				const uniqueIds = Array.from(new Set(ids));

				if (ids.length !== 0) {
					const studentsResponse = await handleStudents.getByIds(uniqueIds)
					console.log("🚀 ~ fetchStudents ~ studentsResponse:", studentsResponse)
					setStudents(studentsResponse.data)
				}

				handleDisableDataLoading('students', setDataLoading)
			} catch (error:any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchStudents()
	}, [attendanceRecords])

	useEffect(() => {
		if (attendanceSession.length === 0) return;
		if (user?.account_type !== AccountType.Student) return;
		const fetchLecturers = async (): Promise<void> => {
			try {
				const ids = attendanceSession.map(item => item.lecturer_id);
				const uniqueIds = Array.from(new Set(ids));
				if (ids.length !== 0) {
					const lecturersResponse = await handleLecturers.getByIds(uniqueIds)
					setLecturers(lecturersResponse.data)
				}

				handleDisableDataLoading('lecturers', setDataLoading)
			} catch (error:any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchLecturers()
	}, [attendanceSession])

	const data = useMemo(() => {
		if (dataLoading.attendanceRecords || dataLoading.attendanceSession || dataLoading.lecturers) {
			return getLoadingData([''], [''], 1);
		}

		return attendanceRecords.map(item => {
			return {
				id: item.id,
				created_at: item.created_at,
				attendance_session: attendanceSession.find(i => i.id === item.attendance_session_id),
				lecturer: lecturers.find(j => j.id === attendanceSession.find(i => i.id === item.attendance_session_id)?.lecturer_id),
			}
		})
	}, [attendanceRecords, attendanceSession, lecturers])

	const dataMissedClasses = useMemo(() => {
		if (dataLoading.attendanceRecords || dataLoading.attendanceSession || dataLoading.lecturers) {
			return getLoadingData([''], [''], 1);
		}

		return attendanceSession
		.filter(item => attendanceRecords.every(record => record.attendance_session_id !== item.id))
		.map(item => {
			return {
				attendance_session: item,
				lecturer: lecturers.find(j => j.id === item.lecturer_id),
			}
		})
	}, [attendanceRecords, attendanceSession, lecturers])

	const dataStudents = useMemo((): Array<StudentAttendancRecordProps & {is_loading?: boolean, id: string}> => {
		if (dataLoading.attendanceRecords || dataLoading.students) {
			if (!_attendance_session_id) return []
			return getLoadingData([''], [''], 1);
		}

		return attendanceRecords.map(item => {
			return {
				id: item.id,
				created_at: item.created_at,
				student: students.find(i => i.id === item.student_id)!,
			}
		})
	}, [attendanceRecords, students, dataLoading.attendanceRecords, dataLoading.students, _attendance_session_id])
	console.log("🚀 ~ Attendance ~ dataStudents:", dataStudents)
	// console.log("🚀 ~ Attendance ~ dataStudents:", dataStudents)

	const renderStudents: ListRenderItem<StudentAttendancRecordProps & {is_loading?: boolean}> = useCallback(({item}) => (
		<StudentAttendancRecord
			{...item}
		/>
	), []);

	const handleStartAttendance = () => {
		if (_attendance_session_id) return;
		setIsFetchingCard(true)
	}

	const handleEndAttendance = async () => {
		try {
			setIsLoading(true);
			await handleAttendanceSessions.endSession(_attendance_session_id as string);

			displayToast('SUCCESS', "Attendance session ended")

			setIsEnded(true)
		} catch (error:any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}
	
	const hashPin = async (pin: string): Promise<string> => {
		const hashedPin = await Crypto.digestStringAsync(
			Crypto.CryptoDigestAlgorithm.SHA256,
			pin
		);

		return hashedPin;
	}

	useEffect(() => {
		if (pathname && !_attendance_session_id) {
			setLoadingPages([...loadingPages, pathname])
		}
	}, []);

	const handleLogAttendance = async (session_id: string) => {
		try {
			setLoadingPages([...loadingPages, pathname])
			const isEnrolled = await LocalAuthentication.isEnrolledAsync();

			if (isEnrolled) {
				const authenticate = await LocalAuthentication.authenticateAsync()

				if (!authenticate.success) {
					throw new Error("Authentication failed");
				}
			}
			
			console.log("🚀 ~ handleLogAttendance ~ userCoordinates:", userCoordinates)
			if (!userCoordinates?.latitude || !userCoordinates?.latitude) {
				throw new Error('Location not found')
			}

			await handleAttendanceRecords.create({
				p_attendance_session_id: session_id,
				p_student_id: user?.id!,
				p_latitude: parseFloat(userCoordinates?.latitude?.toFixed(6)),
				p_longitude: parseFloat(userCoordinates?.longitude?.toFixed(6)),
			})

			displayToast('SUCCESS', 'Attendance recorded')

		} catch (error) {
			console.log("🚀 ~ handleLogAttendance ~ error:", error)
			throw error
		} finally {
			setLoadingPages(loadingPages.filter(item => item !== pathname))
		}
	}
	
	useEffect(() => {
		if (!isFetchingCard) return;
		const hanldePinVerification = async () => {
			try {
				if (scannedCard && scannedCard?.card_uid === user?.rfid) {
					console.log("🚀 ~ Attendance ~ user:", user?.rfid)
					// console.log("🚀 ~ useEffect ~ scannedCardTopic:", scannedCardTopic)
					// console.log("🚀 ~ Attendance ~ scannedCard:", scannedCard)
					
					if (!scannedCard?.pin) {
						throw new Error('Pin not found')
					}
					
					setAttendeaseDeviceId(scannedCard?.device_id)
					// setCardPin(scannedCard?.pin)
					
					console.log(typeof scannedCard?.pin)
					const hashedPin = await hashPin(scannedCard?.pin)
					console.log("🚀 ~ hanldePinVerification ~ hashedPin:", hashedPin)
					console.log("🚀 ~ Attendance ~ user:", user?.pin)
					console.log("")

					if (hashedPin !== user?.pin) {
						throw new Error('Invalid pin')
					}

					if (user?.account_type === AccountType.Lecturer) {
						openBottomSheet()
					} else {
						if (!scannedCard.session_id) {
							throw new Error("No attendance session detected")
						}

						await handleLogAttendance(scannedCard?.session_id)
					}


					setTimeout(() => {
						durationRef.current?.focus();
					}, 1000);
				}
			} catch (error:any) {
				displayToast('ERROR', error?.message)		
			} finally {
				setIsFetchingCard(false);
			}
		}

		hanldePinVerification()
	}, [scannedCardTopic, scannedCard])

	    // get user/device location
    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                // if ststus is not granted, exit map screen
                if (status === 'denied') {
                    
                    // Permission denied, show an alert to go to settings
                    Alert.alert(
                        'LocationObject Permission',
                        'LocationObject access was denied. Please go to settings and enable location permissions.',
                        [
                            { text: 'Cancel', style: 'cancel', onPress: router.back },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ]
                    );

                    return;
                }

                // get location
                const location = await Location.getCurrentPositionAsync({accuracy: Location.LocationAccuracy.Highest});

                // // // set initial coordinates
                setUserCoordinates({
                    latitude: location.coords.latitude, 
                    longitude: location.coords.longitude
                });

				// disable loading pages
				setLoadingPages(loadingPages.filter(item => item !== pathname))

            } catch (error: any) {
                displayToast('ERROR', error?.message);
            }
        })();
    }, []);

	const handleInitiateAttendance = async () => {
		try {
			setIsLoading(true);

			const isEnrolled = await LocalAuthentication.isEnrolledAsync();

			if (isEnrolled) {
				const authenticate = await LocalAuthentication.authenticateAsync()

				if (!authenticate.success) {
					throw new Error("Authentication failed");
				}
			}

			let latitude = userCoordinates?.latitude
			let longitude = userCoordinates?.longitude

			if (latitude || latitude) {
				// throw new Error('Location not found')
				                // get location
                const location = await Location.getCurrentPositionAsync({accuracy: Location.LocationAccuracy.Highest});

				// // // set initial coordinates
				latitude = location.coords.latitude
				longitude = location.coords.longitude
			}

			if (!latitude || !longitude) {
				throw new Error('Location not found')
			}

			const createSessionResponse = await handleAttendanceSessions.create({
				lecturer_id: user?.id!,
				course_id: _course_id! as string,
				started_at: moment().toISOString(true),
				ended_at: moment().add(duration, 'hours').toISOString(true),
				latitude: parseFloat(latitude?.toFixed(6)),
				longitude: parseFloat(longitude?.toFixed(6)),
				academic_session: _academic_session as string,
				semester: parseInt(_semester as string) as Semester
			})
			console.log("🚀 ~ handleInitiateAttendance ~ createSessionResponse:", createSessionResponse)

			MQTTService.publish(`${attendeaseDeviceId}`, JSON.stringify(createSessionResponse.data.id))

			closeBottomSheet()

			router.back()
			
		} catch (error:any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}
	

	return (
		<React.Fragment>
			<Container
				height={HEIGHT}
				width={WIDTH}
				backgroundColor={colors.white}
			>
				{user?.account_type === AccountType.Lecturer && (
					<FlashList
						data={dataStudents}
						// @ts-ignore
						keyExtractor={item => item?.id}
						contentContainerStyle={{
							paddingHorizontal: 20
						}}
						ListHeaderComponent={
							<Flex
								gap={8}
								paddingTop={30}
								paddingBottom={40}
							>
								<Flex
									alignSelf='stretch'
									flexDirection={'row'}
									justifyContent='space-between'
									alignItems='center'
								>
									<InterText
										fontSize={24}
										lineHeight={30}
										fontWeight={600}
									>
										{_course_code}
									</InterText>
									{_attendance_session_id && (
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
									fontSize={16}
									lineHeight={19}
									color={colors.subtext}
								>
									{_course_title}
								</InterText>
							</Flex>
						}
						renderItem={renderStudents}
						ListEmptyComponent={(
							<Flex
								height={HEIGHT/2}
								width={'100%'}
								justifyContent='center'
								alignItems='center'
							>
								<EmptyAttendanceIcon />
							</Flex>
						)}
					/>
				)}
				{user?.account_type === AccountType.Student && (
					<Flex
						flex={1}
						paddingHorizontal={20}
					>
						<Flex
							flex={1}
							gap={20}
						>
							<Flex
								gap={8}
								paddingTop={30}
							>
								<Flex
									alignSelf='stretch'
									flexDirection={'row'}
									justifyContent='space-between'
									alignItems='center'
								>
									<InterText
										fontSize={24}
										lineHeight={30}
										fontWeight={600}
									>
										{_course_code}
									</InterText>
									{_attendance_session_id && (
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
									fontSize={16}
									lineHeight={19}
									color={colors.subtext}
								>
									{_course_title}
								</InterText>
							</Flex>
							<Flex
								gap={16}
							>
								{data.some(item => item?.is_loading) && (
									<Skeleton
										width={100}
										height={20}
									/>
								)}
								{!data.some(item => item?.is_loading) && data.length !== 0 && (
									<InterText
										fontWeight={500}
										fontSize={16}
										lineHeight={20}
									>
										{data[0]?.attendance_session?.id === _attendance_session_id ? "Current lecture" : "Attended previous lecture"}
									</InterText>
								)}
								{data.map((item, index) => (
									<ClassAttendedListItem 
										key={index}
										{...item}
									/>
								))}
								{!dataMissedClasses.some(item => item?.is_loading) && dataMissedClasses.length !== 0 && (
									<InterText
										fontWeight={500}
										fontSize={16}
										lineHeight={20}
									>
										{dataMissedClasses[0]?.attendance_session?.id === _attendance_session_id ? "Current lecture" : "Missed last class"}
									</InterText>
								)}
								{!dataMissedClasses.some(item => item?.is_loading) && dataMissedClasses.map((item, index) => (
									<ClassAttendedListItem 
										key={index}
										{...item}
									/>
								))}
								{dataMissedClasses.length === 0 && data.length === 0 && (
									<Flex
										height={HEIGHT/2}
										width={WIDTH - 40}
										justifyContent='center'
										alignItems='center'
										gap={20}
									>
										<EmptyAttendanceIcon />
										<InterText>
											No records of previous classes found
										</InterText>
									</Flex>
								)}
							</Flex>
						</Flex>
					</Flex>
				)}
			</Container>
			{user?.account_type === AccountType.Student && _attendance_session_id && (
				<FixedButton
					text={'Log attendance'}

					onPress={() => {
						setIsFetchingCard(true)
					}}
				/>
			)}
			{!isEnded && user?.account_type === AccountType.Lecturer && (
				<FixedButton
					text={_attendance_session_id ? 'End attendance' : 'Start attendance'}
					isLoading={isLoading}
					onPress={!_attendance_session_id ? handleStartAttendance : handleEndAttendance}
				/>
			)}
			<CustomBottomSheet
				ref={sheetRef}
				closeBottomSheet={closeBottomSheet}
				sheetTitle='Start Session'
				snapPoints={[HEIGHT]}
				contentContainerStyle={{paddingBottom: 50 + keyboardHeight}}
			>
				<Flex
					paddingTop={70}
					paddingBottom={30}
					gap={20}
					width={'100%'}
					flex={1}
					// height={'100%'}
				>
					<Input
						ref={durationRef}
						label='Lecture duration(hrs)'
						placeholder='Enter lecture hours'
						keyboardType='numeric'
						defaultValue={duration}
						onChangeText={setDuration}
						width={WIDTH - 40}
					/>
				</Flex>
				<CustomButton
					text='Start'
					isLoading={isLoading}
					disabled={!duration}
					onPress={handleInitiateAttendance}
				/>
			</CustomBottomSheet>
			{isFetchingCard && (
				<Flex
					flex={1}
					width={'100%'}
					height={'100%'}
					justifyContent='center'
					alignItems='center'
					backgroundColor={colors.white}
					gap={20}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
					}}
				>
					<CardIcon width={60} height={60} />
					<Flex
						gap={10}
						justifyContent='center'
						alignItems='center'
					>
						<InterText
							fontWeight={600}
							fontSize={20}
							lineHeight={23}
						>
							Getting scannned Card
						</InterText>
						<InterText
							fontWeight={500}
							color={colors.label}
						>
							Scan card on Attendease device
						</InterText>
					</Flex>
					<ActivityIndicator color={colors.black} size={'large'} />
				</Flex>
			)}
		</React.Fragment>
	)
}

export default Attendance

const styles = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		backgroundColor: 'white',
		paddingTop: 30,
		paddingHorizontal: 20,
		paddingBottom: 40,
	}
})