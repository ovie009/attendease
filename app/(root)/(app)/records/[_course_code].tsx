import { Alert, Platform, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, usePathname } from 'expo-router'
import { colors } from '@/utilities/colors'
import Flex from '@/components/Flex'
import InterText from '@/components/InterText'
import { AttendanceRecord, AttendanceSession, CourseRegistration, Lecturer, Schedule, Student } from '@/types/api'
import handleAttendanceSessions from '@/api/handleAttendanceSessions'
import { AccountType, Semester } from '@/types/general'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import handleAttendanceRecords from '@/api/handleAttendanceRecords'
import { useAuthStore } from '@/stores/useAuthStore'
import handleLecturers from '@/api/handleLecturers'
import { getLoadingData } from '@/utilities/getLoadingData'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import Container from '@/components/Container'
import handleStudents from '@/api/handleStudents'
import StudentAttendancRecord, { StudentAttendancRecordProps } from '@/components/StudentAttendancRecord'
import { FlashList, ListRenderItem } from '@shopify/flash-list'
import EmptyAttendanceIcon from '@/assets/svg/EmptyAttendanceIcon.svg'
import moment from 'moment'
import Input from '@/components/Input'
import FloatingButton from '@/components/FloatingButton'
import * as XLSX from 'xlsx';
import { Directory, File, Paths } from 'expo-file-system'; // Updated import
import * as Sharing from 'expo-sharing';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import handleCourseRegistration from '@/api/handleCourseRegistration'
import handleSchedule from '@/api/handleSchedule'

type DataLoading = {
	attendanceSession: boolean,
	attendanceRecords: boolean,
	courseRegistrations: boolean,
	lecturers: boolean,
	students: boolean,
	schedules: boolean,
}

const CourseCode = () => {

	const {
		_course_id,
		_academic_session,
		_semester,
		_course_code,
		_start_of_semester,
		_end_of_semester,
	} = useLocalSearchParams()

	const {
		displayToast
	} = useAppStore.getState();

	const user = useAuthStore(state => state.user);
	console.log("🚀 ~ CourseCode ~ user:", user)
	const numberOfSemesterWeeks = useAuthStore(state => state.numberOfSemesterWeeks)

	const [dataLoading, setDataLoading] = useState<DataLoading>({
		attendanceSession: true,
		attendanceRecords: true,
		lecturers: true,
		students: user?.account_type === AccountType.Lecturer,
		courseRegistrations: true,
		schedules: true,
	})
	console.log("🚀 ~ CourseCode ~ dataLoading:", dataLoading)
	// console.log("🚀 ~ CourseCode ~ dataLoading:", dataLoading)

	const [searchQuery, setSearchQuery] = useState<string>('')
	const [attendanceSession, setAttendanceSession] = useState<AttendanceSession[]>([])
	const [lecturers, setLecturers] = useState<Lecturer[]>([]);
	const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
	const [students, setStudents] = useState<Student[]>(user?.account_type === AccountType.Student ? [user as Student] : []);
	const [courseResgistrations, setCourseResgistrations] = useState<CourseRegistration[]>([]);
	const [schedules, setSchedules] = useState<Schedule[]>([])
	// console.log("🚀 ~ CourseCode ~ schedules:", schedules)

	const [isExporting, setIsExporting] = useState(false);

	// const exportedData = useMemo(() => {
	// 	if (dataLoading.students || dataLoading.attendanceRecords || dataLoading.attendanceSession) {
	// 		return [];
	// 	}

	// 	const courseSchedule = schedules.find(item => item.course_id === _course_id || item?.course_code === _course_code);
	// 	console.log("🚀 ~ CourseCode ~ courseSchedule:", courseSchedule)

	// 	return students.map(item => {
	// 		const object: { [key: string]: any } = {
	// 			fullname: item.full_name,
	// 			["matric number"]: item.matric_number,
	// 		}

	// 		attendanceSession.forEach(session => {
	// 			const sessionDate: string = moment(session.created_at).format('ddd, DD-MM-YYYY');
	// 			// Check if this student has a record for this session
	// 			const hasRecord = attendanceRecords.some(
	// 				record => record.student_id === item.id && record.attendance_session_id === session.id
	// 			);
	// 			object[sessionDate] = hasRecord ? 'PRESENT' : 'ABSENT';
	// 		});

	// 		// Calculate completion percentage
	// 		const attendedCount = attendanceSession.filter(session =>
	// 			attendanceRecords.some(
	// 				record => record.student_id === item.id && record.attendance_session_id === session.id
	// 			)
	// 		).length;
	// 		object['completion percentage'] = attendanceSession.length === 0
	// 			? '0%'
	// 			: `${Math.round((attendedCount / attendanceSession.length) * 100)}%`;

	// 		return object;
	// 	})
	// }, [students, attendanceSession, attendanceRecords, dataLoading.students, dataLoading.attendanceRecords, dataLoading.attendanceSession])

	const exportedData = useMemo(() => {
		// Return early if essential data is still loading
		if (dataLoading.students || dataLoading.attendanceRecords || dataLoading.attendanceSession || dataLoading.schedules) {
			return [];
		}

		const courseSchedule = schedules.find(item => item.course_id === _course_id || item?.course_code === _course_code);
		
		// Return early if schedule or semester dates are not available
		if (!courseSchedule || !_start_of_semester || !_end_of_semester) {
			return [];
		}

		// Step 1: Generate all potential lecture dates based on the weekly schedule
		// and initialize them as "LECTURER_ABSENT".
		const expectedLectureDates = new Map<string, string>();
		const startDate = moment(_start_of_semester as string);
		const endDate = moment(_end_of_semester as string);
		const scheduledDays = courseSchedule.days_of_the_week; // e.g., [1, 3] for Monday, Wednesday

		let currentDate = startDate.clone();
		while (currentDate.isSameOrBefore(endDate)) {
			if (scheduledDays.includes(currentDate.day())) {
				const formattedDate = currentDate.format('ddd, DD-MM-YYYY');
				expectedLectureDates.set(formattedDate, "LECTURER_ABSENT");
			}
			currentDate.add(1, 'days');
		}

		// Step 2: Adjust the schedule with actual attendance sessions.
		// This handles make-up classes and marks regularly scheduled classes that were held.
		const actualLectureDates = new Map<string, string>(expectedLectureDates);
		attendanceSession.forEach(session => {
			const sessionMoment = moment(session.created_at);
			const sessionDate = sessionMoment.format('ddd, DD-MM-YYYY');
			const sessionWeek = sessionMoment.week();

			// If the class was held on a regularly scheduled day, mark it as 'ABSENT' (for now).
			if (actualLectureDates.has(sessionDate)) {
				actualLectureDates.set(sessionDate, 'ABSENT');
			} else {
				// If it's a make-up class, try to find a "LECTURER_ABSENT" day in the same week to replace.
				let replacedMissedClass = false;
				for (const [date, status] of actualLectureDates.entries()) {
					if (status === 'LECTURER_ABSENT' && moment(date, 'ddd, DD-MM-YYYY').week() === sessionWeek) {
						actualLectureDates.delete(date); // Remove the missed class
						actualLectureDates.set(sessionDate, 'ABSENT'); // Add the make-up class
						replacedMissedClass = true;
						break; 
					}
				}
				// If it didn't replace a missed class, it's an additional class.
				if (!replacedMissedClass) {
					actualLectureDates.set(sessionDate, 'ABSENT');
				}
			}
		});

		// Create a sorted list of all dates for consistent column ordering.
		const sortedDates = Array.from(actualLectureDates.keys()).sort((a, b) => {
			return moment(a, 'ddd, DD-MM-YYYY').unix() - moment(b, 'ddd, DD-MM-YYYY').unix();
		});

		const totalExpectedClasses = sortedDates.length;

		// Step 3: Map through each student to build their attendance record.
		return students.map(student => {
			const studentRecord: { [key: string]: any } = {
				fullname: student.full_name,
				["matric number"]: student.matric_number,
			};

			let attendedCount = 0;

			// Populate the record for each expected date.
			sortedDates.forEach(date => {
				const initialStatus = actualLectureDates.get(date)!;
				studentRecord[date] = initialStatus;

				// If the lecturer held a class (status is not LECTURER_ABSENT), check if the student was present.
				if (initialStatus === 'ABSENT') {
					const sessionForDate = attendanceSession.find(s => moment(s.created_at).format('ddd, DD-MM-YYYY') === date);

					if (sessionForDate) {
						const hasRecord = attendanceRecords.some(
							record => record.student_id === student.id && record.attendance_session_id === sessionForDate.id
						);

						if (hasRecord) {
							studentRecord[date] = 'PRESENT';
							attendedCount++;
						}
					}
				}
			});

			// Calculate completion percentage based on the total number of expected classes.
			studentRecord['completion percentage'] = totalExpectedClasses === 0
				? '0%'
				: `${Math.round((attendedCount / totalExpectedClasses) * 100)}%`;

			return studentRecord;
		});
	}, [students, attendanceSession, attendanceRecords, schedules, dataLoading, _start_of_semester, _end_of_semester]);

	// Method 2: Storage Access Framework (Android 10+)
	const exportToExcelWithStorageAccess = async (data: Array<any>, filename = `${_course_code as string}_attendance_record.xlsx`) => {
		try {
			setIsExporting(true);

			if (data.length === 0) {
				Alert.alert('No Data', 'No data available to export.');
				return;
			}

			const workbook = XLSX.utils.book_new();
			const headers = Object.keys(data[0] || {});
			const worksheetData = [
				headers,
				...data.map(item => headers.map(header => item[header]))
			];

			const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
			worksheet['!cols'] = headers.map(header => {
				if (header === 'fullname' || header === 'matric number') {
					return { width: 25 };
				}
				if (/\d{2}-\d{2}-\d{4}/.test(header)) {
					return { width: 20 };
				}
				return { width: 15 };
			});

			XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');

			// 1. Generate the Base64 string from the workbook
			const base64 = XLSX.write(workbook, {
				type: 'base64',
				bookType: 'xlsx'
			});

			// 2. Decode the Base64 string into a Uint8Array
			const binaryString = atob(base64);
			const len = binaryString.length;
			const bytes = new Uint8Array(len);
			for (let i = 0; i < len; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			if (Platform.OS === 'android') {
				const directory = await Directory.pickDirectoryAsync();
				if (!directory) {
					Alert.alert('Permission required', 'Please select a folder to save the file.');
					return;
				}

				const file = await directory.createFile(
					filename,
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				);
				
				// 3. Write the Uint8Array (raw binary data) to the file
				await file.write(bytes);

				displayToast('SUCCESS', 'Excel file saved successfully!');
			} else {
				// iOS fallback
				const file = new File(Paths.document, filename);
				
				// Also write the Uint8Array for iOS
				await file.write(bytes);
				
				Alert.alert(
					'File Saved',
					`Excel file saved: ${filename}`,
					[
						{
							text: 'Share',
							onPress: async () => {
								if (await Sharing.isAvailableAsync()) {
									await Sharing.shareAsync(file.uri);
								}
							}
						},
						{ text: 'OK' }
					]
				);
			}

		} catch (error: any) {
			console.log('Export error:', error);
			displayToast('ERROR', error?.message || 'Failed to export file');
		} finally {
			setIsExporting(false);
		}
	};

	// fetch attendance session for student
	useEffect(() => {
		const fetchAttendanceSession = async () => {
			try {
				const attendanceSessionResponse = await handleAttendanceSessions.getAttendanceSessionBySemesterAcademicSesssionAndCourseIds({
					course_ids: [_course_id as string],
					semester: parseInt(_semester as string) as Semester,
					session: _academic_session as string
				});
				setAttendanceSession(attendanceSessionResponse.data);

				if (attendanceSessionResponse.data.length === 0) {
					handleDisableDataLoading('attendanceRecords', setDataLoading)
					handleDisableDataLoading('lecturers', setDataLoading)
					handleDisableDataLoading('students', setDataLoading)
				}

				handleDisableDataLoading('attendanceSession', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceSession();
	}, []);
	
	// fetch attendance records for lecturer
	useEffect(() => {
		if (user?.account_type !== AccountType.Lecturer) return;
		if (attendanceSession.length === 0) return;

		const fetchAttendanceRecords = async () => {
			try {
				const attendanceRecordsResponse = await handleAttendanceRecords.getRecordsForAttendanceSession({
					semester: parseInt(_semester as string) as Semester,
					academic_session: _academic_session as string,
					attendance_session_ids: attendanceSession.map(item => item.id),
				});
				// console.log("🚀 ~ fetchAttendanceRecords ~ attendanceRecordsResponse:", attendanceRecordsResponse)
				setAttendanceRecords(attendanceRecordsResponse.data)

				if (attendanceRecordsResponse.data.length === 0) {
					handleDisableDataLoading('students', setDataLoading)
				}

				handleDisableDataLoading('attendanceRecords', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceRecords();
	}, [attendanceSession]);

	// fetch attendance records for lecturer
	useEffect(() => {
		if (user?.account_type !== AccountType.Student) return;
		if (attendanceSession.length === 0) return;

		const fetchAttendanceRecords = async () => {
			try {
				const attendanceRecordsResponse = await handleAttendanceRecords.getAttendanceRecordsByAttendanceSessionSemesterSessionAndStudent({
					semester: parseInt(_semester as string) as Semester,
					academic_session: _academic_session as string,
					attendance_session_ids: attendanceSession.map(item => item.id),
					student_id: user.id!
				});
				// console.log("🚀 ~ fetchAttendanceRecords ~ attendanceRecordsResponse:", attendanceRecordsResponse)
				setAttendanceRecords(attendanceRecordsResponse.data)

				if (attendanceRecordsResponse.data.length === 0) {
					handleDisableDataLoading('students', setDataLoading)
				}

				handleDisableDataLoading('attendanceRecords', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceRecords();
	}, [attendanceSession]);
	
	// fetch course registration
	useEffect(() => {
		if (user?.account_type !== AccountType.Lecturer) return;

		const fetchCourseRegistration = async () => {
			try {
				const courseRegistrationResponse = await handleCourseRegistration.getByCourseIdAndSession({
					course_id: _course_id as string,
					session: _academic_session as string,
				});
				setCourseResgistrations(courseRegistrationResponse.data)

				if (courseRegistrationResponse.data.length === 0) {
					handleDisableDataLoading('students', setDataLoading)
				}

				handleDisableDataLoading('courseRegistrations', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchCourseRegistration();
	}, []);

	// fetch students
	useEffect(() => {
		if (courseResgistrations.length === 0) return;
		if (user?.account_type !== AccountType.Lecturer) return;

		const fetchStudents = async (): Promise<void> => {
			try {
				const ids = courseResgistrations.map(item => item.student_id);
				const uniqueIds = Array.from(new Set(ids));

				if (ids.length !== 0) {
					const studentsResponse = await handleStudents.getByIds(uniqueIds)
					setStudents(studentsResponse.data)
				}

				handleDisableDataLoading('students', setDataLoading)
			} catch (error:any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchStudents()
	}, [courseResgistrations])

	// fetch student schedules
	useEffect(() => {
		const fetchSchedule = async () => {
			try {
				const scheduleResponse = await handleSchedule.getBySessionSemesterAndCourseCode({
					semester: parseInt(_semester as string) as Semester,
					session: _academic_session as string,
					course_codes: [_course_code as string],
				});
				// console.log("🚀 ~ fetchSchedule ~ scheduleResponse:", scheduleResponse)

				setSchedules(scheduleResponse.data);

				handleDisableDataLoading('schedules', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchSchedule();
	}, []);

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

	const dataStudents = useMemo((): Array<StudentAttendancRecordProps & {is_loading?: boolean, id: string}> => {
		if (dataLoading.attendanceRecords || dataLoading.students || dataLoading.schedules) {
			return getLoadingData([''], [''], 4);
		}

		const array: Array<StudentAttendancRecordProps & {is_loading?: boolean, id: string}> = attendanceRecords.map((item, index) => {
			const attendancd_session = (() => {
				if (index === 0) {
					return attendanceSession.find(i => i.id === item.attendance_session_id);
				} else if (item.attendance_session_id !== attendanceRecords[index - 1]?.attendance_session_id) {
					return attendanceSession.find(i => i.id === item.attendance_session_id);
				}
				return undefined
			})();

			return {
				id: item.id,
				created_at: item.created_at,
				student: students.find(i => i.id === item.student_id)!,
				attendancd_session,
				total_classes: attendanceRecords.filter(j => item.student_id === j.student_id && moment(j.created_at).unix() <= moment(item.created_at).unix())?.length,
				classes_per_week: schedules.find(item => item.course_id === _course_id || item?.course_code === _course_code)?.days_of_the_week?.length || 1,
				total_weeks: numberOfSemesterWeeks,
			}
		})

		if (searchQuery) {
			return array.filter(item => item.student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || item.student.email?.toLowerCase().includes(searchQuery.toLowerCase()))
		}

		return array
	}, [attendanceRecords, students, schedules, searchQuery, dataLoading.attendanceRecords, dataLoading.students, dataLoading.schedules])

	const renderStudents: ListRenderItem<StudentAttendancRecordProps & {is_loading?: boolean}> = useCallback(({item}) => (
		<StudentAttendancRecord
			{...item}
		/>
	), []);

	
	return (
		<React.Fragment>
			<Container
				height={HEIGHT}
				width={WIDTH}
				paddingHorizontal={20}
				backgroundColor={colors.white}
				style={{
					position: 'relative',
				}}
			>
				<FlashList
					data={dataStudents}
					// estimatedItemSize={100}
					contentContainerStyle={{
						paddingTop: 20
					}}
					showsVerticalScrollIndicator={false}
					ListHeaderComponent={(
						<Flex
							paddingBottom={30}
							gap={20}
						>
							<InterText>
								Attenndance records for {moment(_semester as string, 'd').format('do')} semeter, {_academic_session} session
							</InterText>
							<Input
								defaultValue={searchQuery}
								onChangeText={setSearchQuery}
								placeholder='Search for a student'
								returnKeyType='search'
							/>
						</Flex>
					)}
					renderItem={renderStudents}
					ListEmptyComponent={(
						<Flex
							height={HEIGHT/2}
							width={WIDTH - 40}
							justifyContent='center'
							alignItems='center'
							gap={20}
						>
							<EmptyAttendanceIcon />
							<InterText
								fontSize={16}
								lineHeight={20}
							>
								Cannot find any attendance records
							</InterText>
						</Flex>
					)}
				/>
				{exportedData.length > 0 && attendanceSession.length > 0 && (
					<FloatingButton
						Icon={<FontAwesome6 name="file-excel" size={30} color={colors.white} />}
						onPress={() => {
							exportToExcelWithStorageAccess(exportedData)
						}}
					/>
				)}
			</Container>
		</React.Fragment>
	)
}

export default CourseCode

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: colors.white,
		paddingTop: 30,
		paddingHorizontal: 20,
		paddingBottom: 150
	}
})