import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { colors } from '@/utilities/colors'
import Flex from '@/components/Flex'
import InterText from '@/components/InterText'
import { AttendanceRecord, AttendanceSession, CourseRegistration, Lecturer, Student } from '@/types/api'
import handleAttendanceSessions from '@/api/handleAttendanceSessions'
import { AccountType, Semester } from '@/types/general'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import handleAttendanceRecords from '@/api/handleAttendanceRecords'
import { useAuthStore } from '@/stores/useAuthStore'
import handleLecturers from '@/api/handleLecturers'
import { getLoadingData } from '@/utilities/getLoadingData'
import ClassAttendedListItem from '@/components/ClassAttendedListItem'
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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import handleCourseRegistration from '@/api/handleCourseRegistration'

type DataLoading = {
	attendanceSession: boolean,
	attendanceRecords: boolean,
	courseRegistrations: boolean,
	lecturers: boolean,
	students: boolean,
}

const CourseCode = () => {

	const {
		_course_id,
		_academic_session,
		_semester,
		_course_code,
		_lecturer_id,
		_lecturer_fullname,
	} = useLocalSearchParams()

	const {
		displayToast
	} = useAppStore.getState();

	const user = useAuthStore(state => state.user);

	const [dataLoading, setDataLoading] = useState<DataLoading>({
		attendanceSession: true,
		attendanceRecords: true,
		lecturers: true,
		students: true,
		courseRegistrations: true,
	})
	// console.log("🚀 ~ CourseCode ~ dataLoading:", dataLoading)

	const [searchQuery, setSearchQuery] = useState<string>('')
	const [attendanceSession, setAttendanceSession] = useState<AttendanceSession[]>([])
	const [lecturers, setLecturers] = useState<Lecturer[]>([]);
	const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
	const [students, setStudents] = useState<Student[]>([]);
	const [courseResgistrations, setCourseResgistrations] = useState<CourseRegistration[]>([]);

	const [isExporting, setIsExporting] = useState(false);

	// Sample data - replace with your actual data
	const sampleData = [
		{ id: 1, name: 'John Doe', email: 'john@example.com', age: 30, department: 'Engineering' },
		{ id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, department: 'Marketing' },
		{ id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, department: 'Sales' },
		{ id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 32, department: 'HR' },
		{ id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 29, department: 'Finance' }
	];

	const exportedData = useMemo(() => {
		if (dataLoading.students || dataLoading.attendanceRecords || dataLoading.attendanceSession) {
			return [];
		}

		return students.map(item => {
			const object: { [key: string]: any } = {
				fullname: item.full_name,
				["matric number"]: item.matric_number,
			}

			attendanceSession.forEach(session => {
				const sessionDate: string = moment(session.created_at).format('ddd, DD-MM-YYYY');
				// Check if this student has a record for this session
				const hasRecord = attendanceRecords.some(
					record => record.student_id === item.id && record.attendance_session_id === session.id
				);
				object[sessionDate] = hasRecord ? 'PRESENT' : 'ABSENT';
			});

			// Calculate completion percentage
			const attendedCount = attendanceSession.filter(session =>
				attendanceRecords.some(
					record => record.student_id === item.id && record.attendance_session_id === session.id
				)
			).length;
			object['completion percentage'] = attendanceSession.length === 0
				? '0%'
				: `${Math.round((attendedCount / attendanceSession.length) * 100)}%`;

			return object;
		})
	}, [students, attendanceSession, attendanceRecords, dataLoading.students, dataLoading.attendanceRecords, dataLoading.attendanceSession])

	// Export with custom formatting
	const exportToExcelWithFormatting = async (data:Array<any>, filename = `${_course_code as string}_attendance_record.xlsx`) => {
		try {
			setIsExporting(true);

			const workbook = XLSX.utils.book_new();

			// Create worksheet with custom headers
			const headers = Object.keys(data[0] || {});
			const worksheetData = [
				headers,
				...data.map(item => headers.map(header => item[header]))
			];

			const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

			// Set column widths
			worksheet['!cols'] = headers.map(header => {
				if (header === 'fullname' || header === 'matric number') {
					return { width: 25 };
				}
				if (/\d{2}-\d{2}-\d{4}/.test(header)) { // matches date format like DD-MM-YYYY
					return { width: 20 };
				}
				return { width: 15 };
			});

			XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');

			const excelBuffer = XLSX.write(workbook, {
				type: 'base64',
				bookType: 'xlsx'
			});

			const uri = FileSystem.documentDirectory + filename;
			await FileSystem.writeAsStringAsync(uri, excelBuffer, {
				encoding: FileSystem.EncodingType.Base64
			});

			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(uri, {
				mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				dialogTitle: 'Export Formatted Excel File'
				});
			}

			Alert.alert('Success', 'Formatted Excel file exported successfully!');
		} catch (error:any) {
			console.error('Export error:', error);
			Alert.alert('Error', 'Failed to export Excel file: ' + error.message);
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
		if (dataLoading.attendanceRecords || dataLoading.students) {
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
			}
		})

		if (searchQuery) {
			return array.filter(item => item.student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || item.student.email?.toLowerCase().includes(searchQuery.toLowerCase()))
		}

		return array
	}, [attendanceRecords, students, searchQuery, dataLoading.attendanceRecords, dataLoading.students])

	const renderStudents: ListRenderItem<StudentAttendancRecordProps & {is_loading?: boolean}> = useCallback(({item}) => (
		<StudentAttendancRecord
			{...item}
		/>
	), []);

	
	return (
		<React.Fragment>
			{user?.account_type === AccountType.Lecturer && (
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
						estimatedItemSize={100}
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
								exportToExcelWithFormatting(exportedData)
							}}
						/>
					)}
				</Container>
			)}
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