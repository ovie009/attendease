import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { router, useLocalSearchParams, useNavigation, useSegments } from 'expo-router'
import CustomButton from '@/components/CustomButton';
import { colors } from '@/utilities/colors';
import handleLecturers from '@/api/handleLecturers';
import { Course, Department, Lecturer, Schedule, Setting } from '@/types/api';
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading';
import { useAppStore } from '@/stores/useAppStore';
import handleCourses from '@/api/handleCourses';
import { FlashList } from '@shopify/flash-list';
import { getLoadingData } from '@/utilities/getLoadingData';
import LecturerListItem from '@/components/LecturerListItem';
import InterText from '@/components/InterText';
import { HEIGHT, WIDTH } from '@/utilities/dimensions';
import Flex from '@/components/Flex';
import CourseListItem from '@/components/CourseListItem';
import LinkText from '@/components/LinkText';
import handleSettings from '@/api/handleSettings';
import handleDepartments from '@/api/handleDepartments';
import handleSchedule from '@/api/handleSchedule';
import { Semester } from '@/types/general';
import moment from 'moment';
import EditableScheduleListItem from '@/components/EditableScheduleListItem';
import { useRouteStore } from '@/stores/useRouteStore';


type LecturersListItemProps = Lecturer & {
	is_loading?: boolean | undefined;
	department_name?: string | undefined;
	college_name?: string | undefined;
};


const CourseDetails = () => {

	const segments = useSegments();
	const navigation = useNavigation();

	// get route params
	const {
		_course_code,
		_course_id,
	} = useLocalSearchParams();

	const {
		displayToast
	} = useAppStore.getState();

	const {
		_setEditCourse,
	} = useRouteStore()

	const [dataLoading, setDataloading] = useState({
		settings: true,
		course: true,
		department: true,
		lecturers: true,
		schedule: true,
	})

	const [course, setCourse] = useState<Course | null>(null);
	// console.log("🚀 ~ CourseDetails ~ course:", course)
	const [lecturers, setLecturers] = useState<Lecturer[]>([]);
	const [department, setDepartment] = useState<Department | null>(null);
	const [settings, setSettings] = useState<Setting[]>([]);
	const [schedule, setSchedule] = useState<Schedule | null>(null);
	// console.log("🚀 ~ CourseDetails ~ settings:", settings)

	const handleEditCourse = useCallback(() => {
		if (!course) return;
		_setEditCourse(course);
		router.push('/EditCourse')
	}, [course])
	

	useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <CustomButton
                    onPress={handleEditCourse}
                    text='Edit'
                    buttonStyle={{
                        width: 'auto', 
                        borderRadius: 14,
                        minHeight: 30,
                    }}
                    isSecondary={true}
                />
            )
        });
    }, [handleEditCourse]);

	// fetch settings
	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const settingsResponse = await handleSettings.getAll();
				// console.log("🚀 ~ fetchSettings ~ settingsResponse:", settingsResponse)

				setSettings(settingsResponse.data);

				if (settingsResponse.data.length === 0) {
					handleDisableDataLoading('schedule', setDataloading)
				}

				handleDisableDataLoading('settings', setDataloading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchSettings();
	}, []);
	
	// fetch course
	useEffect(() => {
		const fetchCourse = async () => {
			try {
				const courseResponse = await handleCourses.getById(_course_id as string);
				// console.log("🚀 ~ fetchCourse ~ courseResponse:", courseResponse)

				setCourse(courseResponse.data);

				handleDisableDataLoading('course', setDataloading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchCourse();
	}, []);

	// fetch department
	useEffect(() => {
		if (!course?.department_id) return
		const fetchDepartment = async () => {
			try {
				const departmentResponse = await handleDepartments.getById(course?.department_id);

				setDepartment(departmentResponse.data);

				handleDisableDataLoading('department', setDataloading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchDepartment();
	}, [course]);
	
	
	// fetch schedule
	useEffect(() => {
		if (settings.length === 0) return
		if (!course?.course_code) return;
		const fetchSchedule = async () => {
			try {

				let semester: Semester =  parseInt(settings.find(item => item.key === 'semester')?.value as string) as Semester;

				const scheduleResponse = await handleSchedule.getBySessionSemesterAndCourseCode({
					semester,
					session: settings.find(item => item.key === 'academic_session')?.value as string,
					course_codes: [course?.course_code]
				});
				console.log("🚀 ~ fetchSchedule ~ scheduleResponse:", scheduleResponse)

				setSchedule(scheduleResponse.data[0] || null);

				handleDisableDataLoading('schedule', setDataloading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchSchedule();
	}, [course, settings]);

	// fetch lecturers
	useEffect(() => {
		if (!course?.id) return
		const fetchLecturers = async () => {
			try {
				const lecturersResponse = await handleLecturers.getByCourseId(course?.id);
				console.log("🚀 ~ fetchLecturers ~ lecturersResponse:", lecturersResponse)

				setLecturers(lecturersResponse.data);

				handleDisableDataLoading('lecturers', setDataloading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchLecturers();
	}, [course]);
	

	return (
		<ScrollView
			contentContainerStyle={styles.container}
		>
			<Flex
				gap={20}
				width={'100%'}
			>
				{(course && department) && (
					<Flex
						gap={10}
						width={'100%'}
						paddingVertical={15}
						paddingHorizontal={15}
						borderRadius={14}
						style={{
							borderWidth: 1,
							borderColor: colors.inputBorder,
						}}
					>
						<InterText
							fontSize={16}
							lineHeight={19}
							fontWeight={500}
						>
							{course?.course_title}							
						</InterText>
						<InterText
							// fontSize={16}
							// lineHeight={19}
							// fontWeight={500}
						>
							Department: {department?.department_name}
						</InterText>
						<InterText>
							Semester: {moment(course?.semester, "d").format('do')}
						</InterText>
						<InterText>
							Level: {course?.level}
						</InterText>
					</Flex>
				)}
				{(dataLoading.course || dataLoading.department) && (
					<EditableScheduleListItem
						{...getLoadingData(['course', 'department'], ['', ''], 1)[0]}
						hideEditButton={true}
						backgroundColor={colors.white}
						isLoading={true}
					/>
				)}

				<Flex
					gap={10}
				>
					<InterText
						fontSize={19}
						lineHeight={22}
						fontWeight={500}
					>
						Schedule:
					</InterText>
					{(schedule && course) && (
						<EditableScheduleListItem
							courseCode={schedule.course_code}
							courseTitle={course?.course_title}
							daysOfTheWeek={schedule.days_of_the_week}
							lectureHours={schedule.lecture_hours}
							lectureStartTime={schedule.lecture_start_time}
							backgroundColor={colors.white}
							venue={schedule.venue}
							hideEditButton={true}
							onPress={() => {
								router.push({
									pathname: '/(root)/(app)/(schedule)/EditSchedule',
									params: {
										_level: schedule?.level,
										_course_code: schedule?.course_code,
										_course_id: schedule?.course_id,
										_days_of_the_week: JSON.stringify(schedule?.days_of_the_week),
										_lecture_hours: JSON.stringify(schedule?.lecture_hours),
										_lecture_start_time: JSON.stringify(schedule?.lecture_start_time),
										_venue: schedule?.venue,
										_schedule_id: schedule?.id,
									}
								})
							}}
						/>
					)}
					{(dataLoading.course || dataLoading.schedule) && (
						<EditableScheduleListItem
							{...getLoadingData(['course', 'department'], ['', ''], 1)[0]}
							hideEditButton={true}
							backgroundColor={colors.white}
							isLoading={true}
						/>
					)}

					{(!dataLoading.schedule && !schedule) && (
						<InterText
							// fontSize={16}
							// lineHeight={19}
							// fontWeight={500}
							textStyle={{marginBottom: 20}}
						>
							No course schedule added&nbsp;
							<LinkText
								onPress={() => {
									router.push('/(root)/(app)/(schedule)/AddSchedule')
								}}
							>
								Add scehdule
							</LinkText>							
						</InterText>
					)}

					<Flex
						gap={10}
						>
						<InterText
							fontSize={19}
							lineHeight={22}
							fontWeight={500}
						>
							Lecturers:
						</InterText>
						{lecturers.length > 0 && (
							<Flex
								gap={10}
								width={'100%'}
								paddingVertical={15}
								paddingHorizontal={15}
								borderRadius={14}
								style={{
									borderWidth: 1,
									borderColor: colors.inputBorder,
								}}
							>
								{lecturers.map((lecturer, index) => (
									<InterText
										key={index}
										fontSize={16}
										lineHeight={19}
										fontWeight={500}
									>
										{lecturer?.full_name}							
									</InterText>
								))}
							</Flex>
						)}	
						{(!dataLoading.lecturers && lecturers.length === 0) && (
							<InterText
								// fontSize={16}
								// lineHeight={19}
								// fontWeight={500}
								textStyle={{marginBottom: 20}}
							>
								No lecturer assigned to this course&nbsp;
								<LinkText
									onPress={() => {
										router.push('/(root)/(app)/lecturers')
									}}
								>
									Assign lecturer
								</LinkText>							
							</InterText>
						)}
					</Flex>

					{(dataLoading.lecturers) && (
						<EditableScheduleListItem
							{...getLoadingData(['course', 'department'], ['', ''], 1)[0]}
							hideEditButton={true}
							backgroundColor={colors.white}
							isLoading={true}
						/>
					)}
				</Flex>
			</Flex>

		</ScrollView>
	)
}

export default CourseDetails

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		paddingHorizontal: 16,
		paddingTop: 30,
		paddingBottom: 50,
		backgroundColor: colors.white
	}
})