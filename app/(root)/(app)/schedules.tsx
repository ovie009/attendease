// ./app/(app)/session.tsx
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import React, { act, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatTab, Key, Level, Semester } from '@/types/general';
import handleSettings from '@/api/handleSettings';
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading';
import { useAppStore } from '@/stores/useAppStore';
import CustomButton from '@/components/CustomButton';
import { Link, usePathname, useRouter } from 'expo-router';
import handleSchedule from '@/api/handleSchedule';
import { Course, Response, Schedule } from '@/types/api';
import Flex from '@/components/Flex';
import { colors } from '@/utilities/colors';
import FlatTabs from '@/components/FlatTabs';
import { getLoadingData } from '@/utilities/getLoadingData';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import ScheduleCard from '@/components/ScheduleCard';
import { HEIGHT, WIDTH } from '@/utilities/dimensions';
import EditableScheduleListItem from '@/components/EditableScheduleListItem';
import InterText from '@/components/InterText';
import AddCircleIcon from "@/assets/svg/AddCircleIcon.svg"
import AntDesign from '@expo/vector-icons/AntDesign';
import handleCourses from '@/api/handleCourses';


const Schedules = () => {

	const router = useRouter();
	const pathname = usePathname();

	const {
		displayToast,
	} = useAppStore.getState();

	const [academicSession, setAcademicSession] = useState<string>('')
	const [semester, setSemester] = useState<Semester | null>(null)
	const [schedule, setSchedules] = useState<Schedule[]>([])
	// console.log("🚀 ~ Schedules ~ schedule:", schedule)
	const [courses, setCourses] = useState<Course[]>([]);

	const [dataLoading, setDataLoading] = useState<{schedules: boolean, settings: boolean, courses: boolean}>({
		settings: true,
		schedules: true,
		courses: true,
	});

	const [tabs, setTabs] = useState<FlatTab<string>[]>([
        {
            id: '100',
            name: '100 level',
            active: true,
        },
        {
            id: '200',
            name: '200 level',
            active: false,
        },
        {
            id: '300',
            name: '300 level',
            active: false,
        },
        {
            id: '400',
            name: '400 level',
            active: false,
        },
        {
            id: '500',
            name: '500 level',
            active: false,
        },
    ])

    const previousTabs = useRef<FlatTab<string>[]>(tabs);
    const previousTranslateX = useRef<number>(0);
    const previousWidth = useRef<number>(0);
	


	useEffect(() => {
		const fetchSetting = async  (keys: Key[]) => {
			try {
				const settingResponse = await handleSettings.getByKeys(keys);

				if (settingResponse.data) {
					const academicSessionValue = settingResponse.data.find(item => item.key === 'academic_session')?.value;
					const semesterValue = settingResponse.data.find(item => item.key === 'semester')?.value;
					setAcademicSession(academicSessionValue as string);
					setSemester(semesterValue ? parseInt(semesterValue) as Semester : null);
				} else {
					handleDisableDataLoading('schedules', setDataLoading);
				}

				handleDisableDataLoading('settings', setDataLoading);
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}

		fetchSetting(['academic_session', 'semester'])
	}, []);

	useEffect(() => {
		if (pathname !== '/schedules') return;
		if (!academicSession || !semester) return;
		const fetchSchedule = async  () => {
			try {
				const scheduleResponse = await handleSchedule.getBySessionAndSemester({
					semester,
					session: academicSession
				});

				if (scheduleResponse.data.length > 0) {
					setSchedules(scheduleResponse.data);
	
					const firstEntry: Schedule = scheduleResponse.data[0];

					previousTabs.current = tabs.map(item => {
						return {
							...item,
							active: parseInt(item.id) === firstEntry.level
						}
					});

					const index	= tabs.findIndex(item => parseInt(item.id) === firstEntry.level) || 0

					previousTranslateX.current = tabs[index]?.translateX || 0;
					previousWidth.current = tabs[index]?.width || 0;
	
					setTabs(prevState => {
						return prevState.map(item => {
							return {
								...item,
								active: parseInt(item.id) === firstEntry.level
							}
						})
					})
				}


				handleDisableDataLoading('schedules', setDataLoading);

			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}

		fetchSchedule()
	}, [academicSession, semester, pathname]);

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				let courseResponse
				courseResponse = await handleCourses.getAll();

				if (courseResponse.isSuccessful) {
					setCourses(courseResponse.data)
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('courses', setDataLoading)
			}
		}

		fetchCourses();
			
	}, [])


	const data = useMemo(() => {
		if (dataLoading.schedules || dataLoading.courses) {
			return getLoadingData(['course_code', 'course_title'], ['', ''])
		}

		const activeTab = tabs.find(item => item.active);

		return schedule.filter(item => item.level === (activeTab?.id && parseInt(activeTab?.id))).map(item => {
			return {
				...item,
				course_title: courses.find(course => course.course_code === item.course_code)?.course_title || '',
			}
		});
	}, [dataLoading, schedule, tabs]);
	// console.log("🚀 ~ data ~ data:", data[0])

	const renderItem = useCallback(({item}: ListRenderItemInfo<Schedule & {is_loading: boolean, course_title: string}>) => (
		<EditableScheduleListItem
			courseCode={item.course_code}
			courseTitle={item?.course_title}
			daysOfTheWeek={item.days_of_the_week}
			lectureHours={item.lecture_hours}
			lectureStartTime={item.lecture_start_time}
			venue={item.venue}
			isLoading={item?.is_loading}
			hideEditButton={true}
			onPress={() => {
				router.push({
					pathname: '/(root)/(app)/(schedule)/EditSchedule',
					params: {
						_level: item?.level,
						_course_code: item?.course_code,
						_course_id: item?.course_id,
						_days_of_the_week: JSON.stringify(item?.days_of_the_week),
						_lecture_hours: JSON.stringify(item?.lecture_hours),
						_lecture_start_time: JSON.stringify(item?.lecture_start_time),
						_venue: item?.venue,
						_schedule_id: item?.id,
					}
				})
			}}
			// onPress={() => router.push(`/schedule/${item.id}`)}
		/>
	), [])


	return (
		<React.Fragment>
			<Flex
				paddingTop={30}
				width={'100%'}
				backgroundColor={colors.white}
				flex={1}
				justifyContent='flex-start'
			>
				<Flex
					width={'100%'}
					paddingBottom={10}
				>
					<FlatTabs
						tabs={tabs}
						setTabs={setTabs}
						previousTabs={previousTabs}
						previousTranslateX={previousTranslateX}
						previousWidth={previousWidth}
						gap={5}
						// justifyContent='center'
						indicatorHeight={3}
						hideTrack={true}
						activeColor={colors.black}
						inActiveColor={colors.grey}
						fontProps={{
							fontWeight: undefined,
							fontSize: 14,
							lineHeight: 20
						}}
					/>
				</Flex>
				<Flex
					width={'100%'}
					flex={1}
					justifyContent='flex-start'
					paddingHorizontal={20}
					// backgroundColor='pink'
				>
					<FlashList
						data={data}
						keyExtractor={(item) => item.id}
						estimatedItemSize={170}
						contentContainerStyle={{
							paddingBottom: 100,
							paddingTop: 20
						}}
						showsVerticalScrollIndicator={false}
						estimatedListSize={{
							width: WIDTH,
							height: 170*data.length
						}}
						renderItem={renderItem}
						ListEmptyComponent={(
							<Flex
								width={'100%'}
								height={HEIGHT/3}
								justifyContent='flex-end'
								alignItems='center'	
								gap={20}
							>
								<InterText
									fontWeight={500}
									fontSize={16}
									lineHeight={19}
								>
									{semester ? "No schedule added for this level" : "No settings for semester and session added, add settings first"}
								</InterText>
								<CustomButton
									onPress={() => {
										if (!semester) {
											router.push('/(root)/(app)/session')
										}
										router.push('/(root)/(app)/(schedule)/AddSchedule')				
									}}
									text={semester ? "Add Schedule" : "Add settings"}
									Icon={<AddCircleIcon width={22.5} height={22.5} />}

								/>
							</Flex>
						)}
					/>
				</Flex>
			</Flex>
			{data.length !== 0 && (
				<Flex
					width={60}
					height={60}
					justifyContent='center'
					alignItems='center'
					backgroundColor={colors.primary}
					borderRadius={30}
					style={{
						position: 'absolute',
						bottom: 120,
						right: 20,
						shadowColor: colors.black,
						shadowRadius: 30,
						elevation: 5,
						overflow: 'hidden'
					}}
				>
					<TouchableOpacity
						onPress={() => {
							router.push({
								pathname: '/(root)/(app)/(schedule)/AddSchedule',
								params: {
									_level: tabs.some(item => item.active && item.id) ? tabs.find(item => item.active)?.id : null
								}
							})				
						}}
					>
						<Flex
							width={60}
							height={60}
							justifyContent='center'
							alignItems='center'
						>
							<AntDesign name="plus" size={24} color="white" />	
						</Flex>
					</TouchableOpacity>
				</Flex>
			)}
		</React.Fragment>
	)
}

export default Schedules

const styles = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		backgroundColor: 'white',
		paddingHorizontal: 20,
	}
})