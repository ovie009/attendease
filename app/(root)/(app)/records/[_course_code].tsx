import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { colors } from '@/utilities/colors'
import Flex from '@/components/Flex'
import InterText from '@/components/InterText'
import { AttendanceRecord, AttendanceSession, Lecturer } from '@/types/api'
import handleAttendanceSessions from '@/api/handleAttendanceSessions'
import { Semester } from '@/types/general'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import handleAttendanceRecords from '@/api/handleAttendanceRecords'
import { useAuthStore } from '@/stores/useAuthStore'
import handleLecturers from '@/api/handleLecturers'
import { getLoadingData } from '@/utilities/getLoadingData'
import ClassAttendedListItem from '@/components/ClassAttendedListItem'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'

type DataLoading = {
	attendanceSession: boolean,
	attendanceRecords: boolean,
	lecturers: boolean,
}

const CourseCode = () => {

	const {
		_course_code,
		_course_id,
		_academic_session,
		_semester
	} = useLocalSearchParams()

	const {
		displayToast
	} = useAppStore.getState();

	const user = useAuthStore(state => state.user);

	const [dataLoading, setDataLoading] = useState<DataLoading>({
		attendanceSession: true,
		attendanceRecords: true,
		lecturers: true,
	})

	const [attendanceSession, setAttendanceSession] = useState<AttendanceSession[]>([])
	const [lecturers, setLecturers] = useState<Lecturer[]>([]);
	const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])

	// fetch attendance session for student
	useEffect(() => {
		const fetchAttendanceSession = async () => {
			try {
				const attendanceSessionResponse = await handleAttendanceSessions.getAttendanceSessionBySemesterAcademicSesssionAndCourseIds({
					course_ids: [_course_id as string],
					semester: parseInt(_semester as string) as Semester,
					session: _academic_session as string
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

	// fetch attendance records for student
	useEffect(() => {
		if (attendanceSession.length === 0) return;

		const fetchAttendanceRecords = async () => {
			try {
				const attendanceRecordsResponse = await handleAttendanceRecords.getAttendanceRecordsByAttendanceSessionSemesterSessionAndStudent({
					semester: parseInt(_semester as string) as Semester,
					academic_session: _academic_session as string,
					student_id: user?.id!,
					attendance_session_ids: attendanceSession.map(item => item.id),
				});
				// console.log("🚀 ~ fetchAttendanceRecords ~ attendanceRecordsResponse:", attendanceRecordsResponse)

				setAttendanceRecords(attendanceRecordsResponse.data)

				handleDisableDataLoading('attendanceRecords', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchAttendanceRecords();
	}, [attendanceSession]);

	useEffect(() => {
		if (attendanceSession.length === 0) return;

		const fetchLecturers = async (): Promise<void> => {
			try {
				const ids = attendanceSession.map(item => item.lecturer_id);
				const uniqueIds = Array.from(new Set(ids));
				if (ids.length !== 0) {
					const lecturersResponse = await handleLecturers.getByIds(uniqueIds)
					// console.log("🚀 ~ fetchLecturers ~ lecturersResponse:", lecturersResponse)
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

	
	return (
		<React.Fragment>
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