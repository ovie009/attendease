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
	console.log("🚀 ~ CourseCode ~ exportedData:", exportedData)

	const exportToExcel = async (data: Array<any>, filename = 'export.xlsx') => {
		try {
			setIsExporting(true);

			// Create a new workbook
			const workbook = XLSX.utils.book_new();

			// Convert array of objects to worksheet
			const worksheet = XLSX.utils.json_to_sheet(data);

			// Add worksheet to workbook
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

			// Generate Excel file as base64
			const excelBuffer = XLSX.write(workbook, {
				type: 'base64',
				bookType: 'xlsx'
			});

			// Create file URI
			const uri = FileSystem.documentDirectory + filename;

			// Write file to device
			await FileSystem.writeAsStringAsync(uri, excelBuffer, {
				encoding: FileSystem.EncodingType.Base64
			});

			// Share the file
			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(uri, {
				mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				dialogTitle: 'Export Excel File'
				});
			} else {
				Alert.alert('Success', `Excel file saved to: ${uri}`);
			}

			Alert.alert('Success', 'Excel file exported successfully!');
		} catch (error:any) {
			console.error('Export error:', error);
			Alert.alert('Error', 'Failed to export Excel file: ' + error.message);
		} finally {
			setIsExporting(false);
		}
	};

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

	// Export multiple sheets
	const exportMultipleSheets = async () => {
		try {
			setIsExporting(true);

			const workbook = XLSX.utils.book_new();

			// Sheet 1: All employees
			const allEmployees = XLSX.utils.json_to_sheet(sampleData);
			XLSX.utils.book_append_sheet(workbook, allEmployees, 'All Employees');

			// Sheet 2: Engineering department only
			const engineeringData = sampleData.filter(emp => emp.department === 'Engineering');
			const engineeringSheet = XLSX.utils.json_to_sheet(engineeringData);
			XLSX.utils.book_append_sheet(workbook, engineeringSheet, 'Engineering');

			// Sheet 3: Summary statistics
			const departments = [...new Set(sampleData.map(emp => emp.department))];
			const summaryData = departments.map(dept => ({
				Department: dept,
				'Employee Count': sampleData.filter(emp => emp.department === dept).length,
				'Average Age': Math.round(
				sampleData
					.filter(emp => emp.department === dept)
					.reduce((sum, emp) => sum + emp.age, 0) / 
				sampleData.filter(emp => emp.department === dept).length
				)
			}));
			
			const summarySheet = XLSX.utils.json_to_sheet(summaryData);
			XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

			const excelBuffer = XLSX.write(workbook, {
				type: 'base64',
				bookType: 'xlsx'
			});

			const uri = FileSystem.documentDirectory + 'multi_sheet_export.xlsx';
			await FileSystem.writeAsStringAsync(uri, excelBuffer, {
				encoding: FileSystem.EncodingType.Base64
			});

			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(uri, {
				mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				dialogTitle: 'Export Multi-Sheet Excel File'
				});
			}

			Alert.alert('Success', 'Multi-sheet Excel file exported successfully!');
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

	// fetch attendance records for student
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

	const data = useMemo(() => {
		if (dataLoading.attendanceRecords || dataLoading.attendanceSession || dataLoading.lecturers) {
			return getLoadingData([''], [''], 3);
		}

		return attendanceRecords.map(item => {
			return {
				created_at: item.created_at,
				attendance_session: attendanceSession.find(i => i.id === item.attendance_session_id),
				lecturer: lecturers.find(j => j.id === attendanceSession.find(i => i.id === item.attendance_session_id)?.lecturer_id),
			}
		})
	}, [attendanceRecords, attendanceSession, lecturers])

	const dataMissedClasses = useMemo(() => {
		if (dataLoading.attendanceRecords || dataLoading.attendanceSession || dataLoading.lecturers) {
			return getLoadingData([''], [''], 3);
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
			{user?.account_type === AccountType.Student && (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.container}
				>
					<Flex
						gap={20}
						style={{
							marginBottom: 50,
						}}
					>
						<InterText
							fontSize={16}
							lineHeight={20}
							fontWeight={500}
						>
							Lectures attended
						</InterText>
						<Flex
							gap={20}
						>
							{data.map((item, index) => (
								<ClassAttendedListItem 
									key={index}
									{...item}
								/>
							))}
							{data.length === 0 && (
								<Flex
									justifyContent='center'
									alignItems='center'
									gap={20}
									height={HEIGHT/3}
									width={WIDTH - 40}
								>
									<InterText
										lineHeight={20}
										color={colors.subtext}
									>
										No attendance records for this course
									</InterText>
								</Flex>
							)}
						</Flex>
					</Flex>
					{dataMissedClasses.length !== 0 && dataMissedClasses.some(item => !item.is_loading) && (
						<Flex
							gap={20}
						>
							<InterText
								fontSize={16}
								lineHeight={20}
								fontWeight={500}
							>
								Missed lecturers
							</InterText>
							<Flex
								gap={20}
							>
								{dataMissedClasses.map((item, index) => (
									<ClassAttendedListItem 
										key={index}
										{...item}
									/>
								))}
							</Flex>
						</Flex>
					)}
				</ScrollView>
			)}
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