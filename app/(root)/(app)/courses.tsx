// ./app/(app)/courses.tsx
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Paragraph, Title } from 'react-native-paper'
import { FlashList } from '@shopify/flash-list'
import { Course } from '@/types/api'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import { useAppStore } from '@/stores/useAppStore'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { getLoadingData } from '@/utilities/getLoadingData'
import Input from '@/components/Input'
import AddCircleIcon from "@/assets/svg/AddCircleIcon.svg"
import { useNavigation, useRouter, useSegments } from 'expo-router'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import handleCourses from '@/api/handleCourses'
import CourseListItem from '@/components/CourseListItem'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Flex from '@/components/Flex'
import InterText from '@/components/InterText'

// Let's stick with 'is_loading' as used in useMemo annotation.
type CourseListItemProps = Course & {
    is_loading?: boolean | undefined;
	onPress?: () => void | undefined;
};

type AddButtonOption = {
	id: string;
	title: string;
	Icon: ReactNode,
	onPress: () => void,
}

const Courses = () => {

	const router = useRouter()
	const segments = useSegments();
	const navigation = useNavigation();

	const {
		displayToast,
	} = useAppStore.getState()
	
	const sheetRef = useRef<BottomSheetModal>(null);

	const openBottomSheet = () => {
		sheetRef?.current?.present();
	}

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}

	const addOptionsButtons = useMemo((): Array<AddButtonOption> => {
		return [
			{
				id: '1',
				title: 'Add with AI',
				Icon: <FontAwesome5 name="magic" size={12} color={colors.black} />,
				onPress: () => {
					closeBottomSheet()
					router.push({
						pathname: '/(root)/(app)/(course)/AddCourse',
						params: {
							_add_with_ai: 1
						}
					})				
				},
			},
			{
				id: '2',
				title: 'Add course manually',
				Icon: <FontAwesome6 name="add" size={12} color="black" />,
				onPress: () => {
					closeBottomSheet()
					router.push({
						pathname: '/(root)/(app)/(course)/AddCourse',
						params: {
							_add_with_ai: 1
						}
					})				
				},
			},
		]
	}, [])

	const [dataLoading, setDataloading] = useState<{courses: boolean}>({
		courses: true,
	});

	// list of collegs
	const [courses, setCourses] = useState<Course[]>([]);
	const [searchInput, setSearchInput] = useState<string>("");

	const data = useMemo((): Array<CourseListItemProps> => {
		if (dataLoading.courses) {
			return getLoadingData(['college_name'], ['loading...']);
		}

		if (courses.length === 0) {
			return []
		}

		if (searchInput) {
			return courses.filter(item => item.course_code.toLowerCase().includes(searchInput.toLowerCase()) || item.course_title.toLowerCase().includes(searchInput.toLowerCase()))
			.map(item => ({
				...item,
				onPress: () => {
					// router.push({
					// 	pathname: '/(root)/(app)/college/[_college_name]',
					// 	params: {
					// 		_college_name: item?.college_name,
					// 		_college_id: item?.id
					// 	}
					// })
				},
				is_loading: false
			}));
		}

		return courses.map(item => ({
			...item,
			onPress: () => {
				// router.push({
				// 	pathname: '/(root)/(app)/college/[_college_name]',
				// 	params: {
				// 		_college_name: item?.college_name,
				// 		_college_id: item?.id
				// 	}
				// })
			},
			is_loading: false
		}));
	}, [courses, dataLoading.courses, searchInput]);


	useEffect(() => {
		// (async () => )
		const fetchCourses = async () => {
			try {
				const courseResponse = await handleCourses.getAll();

				if (courseResponse.isSuccessful) {
					setCourses(courseResponse.data)
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('courses', setDataloading)
			}
		}

		fetchCourses();
			
	}, [segments])

	useEffect(() => {
		if (!dataLoading.courses && courses.length === 0) {
			navigation.setOptions({
				headerRight: () => <></>
			});
		} 
		navigation.setOptions({
			headerRight: () => (
				<CustomButton
					text='Add'
					width={70}
					buttonStyle={{minHeight: 30, borderRadius: 14}}
					onPress={openBottomSheet}
				/>
			)
		});
	}, [dataLoading.courses, courses]);

	const RenderItem = useCallback(({item}: {item: CourseListItemProps}) => (
		<CourseListItem
			isLoading={item?.is_loading}
			courseCode={item.course_code}
			courseTitle={item.course_title}
			level={item.level}
			semester={item.semester}
			onPress={() => {

			}}
		/>
	), []);

    return (<>
		<View style={styles.contentContainerStyle}>
			<FlashList
				keyExtractor={(item) => item.id}
				ListHeaderComponent={(data.length !== 0) ? (
					<View style={styles.header}>
						<Input
							defaultValue={searchInput}
							onChangeText={setSearchInput}
							placeholder='Search Courses'
						/>
					</View>
				) : <></>}
				data={data}
				showsVerticalScrollIndicator={false}
				renderItem={RenderItem}
				estimatedItemSize={100}
				ListEmptyComponent={(courses.length === 0 && data.length === 0) ? (
					<View style={styles.listEmptyComponent}>
						<View style={styles.text}>
							<Title>
								No courses added
							</Title>
							<Paragraph>
								Add course to your instituition
							</Paragraph>
						</View>
						<CustomButton
							onPress={() => {
								router.push({
									pathname: '/(root)/(app)/(course)/AddCourse',
									params: {
										_add_with_ai: 1
									}
								})				
							}}
							text={"Add with AI"}
							isSecondary={true}
							Icon={<FontAwesome5 name="magic" size={22.5} color={colors.primary} />}
						/>
						<CustomButton
							onPress={() => {
								router.push({
									pathname: '/(root)/(app)/(course)/AddCourse',
								})				
							}}
							text={"Add course mannually"}
							Icon={<AddCircleIcon width={22.5} height={22.5} />}
						/>
					</View>
				) : <></>}
			/> 
		</View>
		<CustomBottomSheet
			ref={sheetRef}
			snapPoints={[200]}
			sheetTitle=''
			hideSheetHeader={true}
			closeBottomSheet={closeBottomSheet}
			contentContainerStyle={{paddingTop: 30}}
		>
			{addOptionsButtons.map(item => (
				<TouchableOpacity 
					key={item.id}
					onPress={item.onPress}
				>
					<Flex
						flexDirection='row'
						justifyContent='space-between'
						alignItems='center'
						gap={10}
						style={styles.optionButton}
					>
						{item.Icon}
						<Flex
							flex={1}
							alignItems='flex-start'
							justifyContent='center'
							height={30}
						>
							<InterText
								fontWeight={500}
								fontSize={17}
								lineHeight={20}
							>
								{item.title}
							</InterText>
						</Flex>
						<MaterialCommunityIcons name="chevron-right" size={20} color="black" />
					</Flex>
				</TouchableOpacity>
			))}
		</CustomBottomSheet>
		{/* {(!dataLoading.courses && data.length !== 0) && (
			<FixedWrapper
				contentContainerStyle={styles.fixedWrapper}
			>
				<CustomButton
					onPress={() => {
						router.push({
							pathname: '/(root)/(app)/(course)/AddCourse',
							params: {
								_add_with_ai: 1
							}
						})				
					}}
					text={"Add with AI"}
					isSecondary={true}
					Icon={<FontAwesome5 name="magic" size={22.5} color={colors.primary} />}
				/>
				<CustomButton
					onPress={() => {
						router.push({
							pathname: '/(root)/(app)/(course)/AddCourse',
						})				
					}}
					text={"Add course mannually"}
					Icon={<AddCircleIcon width={22.5} height={22.5} />}
				/>
			</FixedWrapper>
		)} */}
	</>)
}

export default Courses

const styles = StyleSheet.create({
	contentContainerStyle: {
		flex: 1,
		// backgroundColor: 'white',
		paddingHorizontal: 20,
		paddingVertical: 30,
		display: 'flex',
		// justifyContent: 'center',
		// alignItems: 'center',
		gap: 20,
		width: WIDTH,
		backgroundColor: colors.white,
		position: 'relative',
	},
	header: {
		marginBottom: 20,
	},
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
	buttonWrapper: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		width: '100%',
		backgroundColor: colors.grey,
		height: 100,
	},
	// BOTTOM SHEEET
	// BOTTOM SHEEET
	// BOTTOM SHEEET
	sheetWrapper: {
		// height: '100%',
		flex: 1,
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		paddingBottom: 30,
		width: '100%',
		// backgroundColor: 'pink',
		gap: 20
	},
	sheetForm: {
		width: '100%',
		gap: 20,
		// backgroundColor: 'teal'
	},
	input: {
		flexGrow: 0,
		width: WIDTH - 40,
		flex: 0,
		// maxHeight: 50,
		// backgroundColor: 'red',
		// opacity: 0.3,
	},
	inputOutline: {
		backgroundColor: 'orange',
	},
	modalButtonWrapper: {
		flex: 1,
		justifyContent: 'flex-end',
		// display: 'flex',`
		width: '100%'
	},
	fixedWrapper: {
		height: 'auto',
		display: 'flex',
		gap: 16,
	},
	optionButton: {
		paddingBottom: 10,
		marginBottom: 20,
		borderBottomWidth: 1,
		borderColor: colors.inputBorder,
	}
})