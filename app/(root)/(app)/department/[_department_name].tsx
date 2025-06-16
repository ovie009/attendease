import { StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { router, useLocalSearchParams, useNavigation, useSegments } from 'expo-router'
import CustomButton from '@/components/CustomButton';
import { colors } from '@/utilities/colors';
import handleLecturers from '@/api/handleLecturers';
import { Course, Lecturer } from '@/types/api';
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading';
import { useAppStore } from '@/stores/useAppStore';
import handleCourses from '@/api/handleCourses';
import { FlashList } from '@shopify/flash-list';
import { getLoadingData } from '@/utilities/getLoadingData';
import LecturerListItem from '@/components/LecturerListItem';
import InterText from '@/components/InterText';
import { HEIGHT } from '@/utilities/dimensions';
import Flex from '@/components/Flex';
import CourseListItem from '@/components/CourseListItem';
import LinkText from '@/components/LinkText';


type LecturersListItemProps = Lecturer & {
	is_loading?: boolean | undefined;
	department_name?: string | undefined;
	college_name?: string | undefined;
};


const DepartmentDetails = () => {

	const segments = useSegments();
	const navigation = useNavigation();

	// get route params
	const {
		_department_name,
		_department_id,
		_college_id,
	} = useLocalSearchParams();

	const {
		displayToast
	} = useAppStore.getState();

	const handleEditCollege = () => {
        router.push({
            pathname: '/(root)/(app)/(department)/editDepartment',
            params: {
                _department_name,
                _department_id,
            }
        })
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <CustomButton
                    onPress={handleEditCollege}
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
    }, []);

	const [lecturers, setLecturers] = useState<Lecturer[]>([])
	// console.log("🚀 ~ DepartmentDetails ~ lecturers:", lecturers)
	const [courses, setCourses] = useState<Course[]>([])
	// console.log("🚀 ~ DepartmentDetails ~ courses:", courses)

	const [dataLoading, setDataloading] = useState({
		courses: true,
		lecturers: true,
	})

	// fetch lecturers
	useEffect(() => {
		const fetchLecturers = async (): Promise<void> => {
			try {
				const lecturerResponse = await handleLecturers.getByDepartmentId(_department_id as string);
				// console.log("🚀 ~ fetchLecturers ~ lecturerResponse:", lecturerResponse)

				setLecturers(lecturerResponse.data)
				handleDisableDataLoading('lecturers', setDataloading)

			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchLecturers();
	}, [])

	// fetch courses
	useEffect(() => {
		const fetchCourses = async (): Promise<void> => {
			try {
				const courseResponse = await handleCourses.getByDepartmentId(_department_id as string);
				// console.log("🚀 ~ fetchCourses ~ courseResponse:", courseResponse)

				setCourses(courseResponse.data)
				handleDisableDataLoading('courses', setDataloading)

			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		fetchCourses();
	}, []);

	const data = useMemo(() => {
		if (dataLoading.lecturers) {
			return getLoadingData([''], [''])
		}

		return lecturers;
	}, [lecturers, dataLoading])

	const renderItem = useCallback(({item}: {item: LecturersListItemProps}) => (
		<LecturerListItem
			isLoading={item?.is_loading}
			fullName={item?.full_name}
			collegeName={item?.college_name}
			departmentName={item?.department_name}
			courseIds={item?.course_ids}
			role={item?.role}
			onPress={() => {

			}}
		/>
	), []);

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: colors.white,
				paddingHorizontal: 20,
				paddingTop: 10,
			}}
		>
			<FlashList
				keyExtractor={(item) => item.id}
				ListHeaderComponent={(
					<Flex
						paddingTop={20}
						paddingBottom={30}
					>
						{dataLoading.courses && getLoadingData([''], [''], 2).map(item => (
							<CourseListItem
								key={item.id}
								isLoading={item?.is_loading}
								{...item}
							/>
						))}
						{!dataLoading.courses && courses.filter((_, index) => index < 2).map(item => (
							<CourseListItem
								key={item.id}
								courseCode={item.course_code}
								courseTitle={item.course_title}
								level={item.level}
								semester={item.semester}
								onPress={() => {
									router.push({
										pathname: '/(root)/(app)/course/[_course_code]',
										params: {
											_course_code: item.course_code,
											_course_id: item.id,
										}
									})
								}}
							/>
						))}
						{courses.length > 2 && (
							<Flex
								width={'100%'}
								alignItems='flex-end'
							>
								<LinkText
									onPress={() => {
										router.push({
											pathname: '/(root)/(app)/courses',
											params: {
												_department_id,
											}
										})
									}}
								>
									View all
								</LinkText>
							</Flex>
						)}

						{courses.length === 0 && !dataLoading.courses && (
							<Flex>
								<InterText>
									No courses added to this department.&nbsp;
									<LinkText
										onPress={() => {
											router.push({
												pathname: '/(root)/(app)/(course)/AddCourse',
												params: {
													_add_with_ai: 1,
													_department_id,
												}
											})
										}}
									>
										Add courses
									</LinkText>
								</InterText>
							</Flex>
						)}
					</Flex>
				)}
				data={data}
				renderItem={renderItem}
				estimatedItemSize={100}
				contentContainerStyle={{
					paddingBottom: 120
				}}
				ListEmptyComponent={(
					<Flex
						gap={20}
					>
						<InterText
							fontWeight={500}
							fontSize={16}
							lineHeight={19}
						>
							No lecturer added
						</InterText>
						<InterText>
							Add lecturers to this department
						</InterText>
						<CustomButton
							text='Add lecturer'
							onPress={() => {
								router.push({
									pathname: '/(root)/(app)/(lecturer)/AddLecturer',
									params: {
										_department_id
									}
								})
							}}
						/>
					</Flex>
				)}
			/> 
		</View>
	)
}

export default DepartmentDetails

const styles = StyleSheet.create({
	text: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	listEmptyComponent: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 20,
		height: HEIGHT/2,
		width: '100%',
		// width: WIDTH - 20,
	},
})