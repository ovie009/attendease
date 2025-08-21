import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Flex from '@/components/Flex'
import { colors } from '@/utilities/colors'
import { useAuthStore } from '@/stores/useAuthStore'
import { Course, Setting } from '@/types/api'
import handleCourses from '@/api/handleCourses'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import Container from '@/components/Container'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import FixedButton from '@/components/FixedButton'
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list'
import OptionListItem from '@/components/OptionListItem'
import Skeleton from '@/components/Skeleton'
import InterText from '@/components/InterText'
import SelectInput from '@/components/SelectInput'
import { Level } from '@/types/general'
import CustomButton from '@/components/CustomButton'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import handleSettings from '@/api/handleSettings'
import handleCourseRegistration from '@/api/handleCourseRegistration'
import { router } from 'expo-router'

type SelectableCourse = Course & {
    is_selected: boolean;
};

type SelectableLevel = {
	id: string,
	value: Level,
	is_selected: boolean
}


type BottomSheetContent = 'Select course' | 'Select level';

const RegisterCourse = () => {

    const user = useAuthStore(state => state.user);
    console.log("🚀 ~ RegisterCourse ~ user:", user)

    const {
        displayToast,
        setIsLoading,
    } = useAppStore.getState();

    const isLoading = useAppStore(state => state.isLoading);

    // list of collegs
    const [courses, setCourses] = useState<SelectableCourse[]>([]);
    console.log("🚀 ~ RegisterCourse ~ courses:", courses)
    const [otherCourse, setOtherCourse] = useState<SelectableCourse[]>([]);
    const [level, setLevel] = useState<Level | null>(null)
    const [settings, setSettings] = useState<Setting[]>([])

    const [dataLoading, setDataLoading] = useState<{courses: boolean, otherCourses: boolean, settings: boolean}>({
        courses: true,
        otherCourses: false,
        settings: true,
    })
    console.log("🚀 ~ RegisterCourse ~ dataLoading:", dataLoading)

    const [levelOptions, setLevelOptions] = useState<SelectableLevel[]>(() => {
        if (user?.level === 100) return [];
        const levelsArray: any = Array.from({ length: (user?.level!/100 - 1) }, (_, index: number) => ({
			id: `level-${index + 1}`,
			value: (index + 1)*100,
			is_selected: false,
		}));

        return levelsArray
    });

    const sheetRef = useRef<BottomSheetModal>(null);
	const [sheetParameters, setSheetParameters] = useState<{snapPoints: [string | number], content: BottomSheetContent}>({
		snapPoints: ['50%'],
		content: 'Select level',
	})

	const openBottomSheet = useCallback((content: BottomSheetContent) => {
		const minHeight = 130;
		const listItemHieght = 60;

		let height = 0;
		if (content === 'Select level') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*levelOptions.length);
		} else {
			height = HEIGHT;
		}

		setSheetParameters({
			snapPoints: [height],
			content,
		})

		sheetRef?.current?.present();
	}, [levelOptions, courses])

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const courseResponse = await handleCourses.getByDepartmentIdAndLevels({
                    department_id: user?.department_id!,
                    levels: [user?.level!]
                });
                console.log("🚀 ~ fetchCourses ~ courseResponse:", courseResponse)
                
                setCourses(courseResponse.data.map(item => ({...item, is_selected: false})))

            } catch (error: any) {
                displayToast('ERROR', error?.message)
            } finally {
                handleDisableDataLoading('courses', setDataLoading)
            }
        }

        fetchCourses();
    }, [])

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsResponse = await handleSettings.getAll();

                if (settingsResponse.isSuccessful) {
                    setSettings(settingsResponse.data)
                }
            } catch (error: any) {
                displayToast('ERROR', error?.message)
            } finally {
                handleDisableDataLoading('settings', setDataLoading)
            }
        }

        fetchSettings();
            
    }, []);

    useEffect(() => {
        if (!level) return;
        const fetchCourses = async () => {
            try {
                setDataLoading({...dataLoading, otherCourses: true})

                const courseResponse = await handleCourses.getByDepartmentIdAndLevels({
                    department_id: user?.department_id!,
                    levels: [level]
                });
                
                setOtherCourse(courseResponse.data.map(item => ({...item, is_selected: false})))

            } catch (error: any) {
                displayToast('ERROR', error?.message)
            } finally {
                handleDisableDataLoading('otherCourses', setDataLoading)
            }
        }

        fetchCourses();
    }, [level])

    const handleSelectCourse = useCallback((id: string): void => {
        // console.log("🚀 ~ handleSelectCourse ~ id:", id)
        // This check ensures that 'find' below will succeed.
        if (courses.some(item => item.id === id)) {
            // Add '!' after find(...) to assert it's not null/undefined

            // update lecturer list
            setCourses(prevState => {
                return prevState.map(item => {
                    if (item.id === id) {
                        return {
                            ...item,
                            is_selected: !item.is_selected,
                        }
                    }
                    return item;
                })
            })
        }
        // Optional: Handle the else case if needed, though 'some' prevents it here.
        // else { console.warn(`Lecturer with id ${id} not found unexpectedly.`); }
    }, [courses]); // <-- Add setDean to dependencies
    
    const handleSelectOtherCourse = useCallback((id: string): void => {
        // console.log("🚀 ~ handleSelectCourse ~ id:", id)
        // This check ensures that 'find' below will succeed.
        if (otherCourse.some(item => item.id === id)) {
            // Add '!' after find(...) to assert it's not null/undefined

            // update lecturer list
            setOtherCourse(prevState => {
                return prevState.map(item => {
                    if (item.id === id) {
                        return {
                            ...item,
                            is_selected: !item.is_selected,
                        }
                    }
                    return item;
                })
            })
        }
        // Optional: Handle the else case if needed, though 'some' prevents it here.
        // else { console.warn(`Lecturer with id ${id} not found unexpectedly.`); }
    }, [otherCourse]); // <-- Add setDean to dependencies

    const handleSelectLevel = useCallback((id: string): void => {
        // This check ensures that 'find' below will succeed.
        if (levelOptions.some(item => item.id === id)) {
            // Add '!' after find(...) to assert it's not null/undefined
            const foundValue = levelOptions.find((item) => item.id === id)!;
            setLevel(foundValue.value); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

            // update lecturer list
            setLevelOptions(prevState => {
                return prevState.map(item => {
                    if (item.id === id) {
                        return {
                            ...item,
                            is_selected: true,
                        }
                    }
                    return {
                        ...item,
                        is_selected: false,
                    }
                })
            })

            closeBottomSheet()
        }
        // Optional: Handle the else case if needed, though 'some' prevents it here.
        // else { console.warn(`Lecturer with id ${id} not found unexpectedly.`); }
    }, [levelOptions]); // <-- Add setDean to dependencies

    const handleIncludeOtherCOurse = useCallback(() => {
        setCourses(prevState => {
            return [...prevState, ...otherCourse.filter(item => item.is_selected && prevState.some(i => i.id !== item.id))]
        });

        setOtherCourse(prevState => {
            return prevState.filter(item => !item.is_selected)
        })

        closeBottomSheet()
    }, [courses,  otherCourse, setCourses, setOtherCourse])
    
    

    const renderCourseItem = useCallback(({item}: ListRenderItemInfo<SelectableCourse>) => (
		<OptionListItem
			id={item?.id}
			text={item?.course_code}
			subtext={item?.course_title}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectCourse(item.id)
			}}
		/>
	), [handleSelectCourse]);

    const renderOtherCourseItem = useCallback(({item}: ListRenderItemInfo<SelectableCourse>) => (
		<OptionListItem
			id={item?.id}
			text={item?.course_code}
			subtext={item?.course_title}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectOtherCourse(item.id)
			}}
		/>
	), [handleSelectOtherCourse]);


    const renderLevelItem = useCallback(({item}: ListRenderItemInfo<SelectableLevel>) => (
		<OptionListItem
			id={item?.id}
			text={item?.value ? `${item.value} level` : ""}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectLevel(item.id)
			}}
		/>
	), [handleSelectLevel]);

    const handleRegisterCourse = async () => {
        try {
            setIsLoading(true);

            const session = settings.find(item => item.key === 'academic_session')?.value;

            if (!session) {
                throw new Error("Cannot fetch academic session");
            }

            const courseRegisteration = await handleCourseRegistration.create({
                student_id: user?.id!,
                level: user?.level!,
                session,
                course_ids: courses.map(item => item.id)
            })

            console.log("🚀 ~ handleRegisterCourse ~ courseRegisteration:", courseRegisteration)
            router.back()
        } catch (error:any) {
            displayToast('ERROR', error?.message)
        } finally {
            setIsLoading(false)
        }
    }
    

    return (
        <React.Fragment>
            <Flex
                flex={1}
                backgroundColor={colors.white}
            >
                <Container
                    height={HEIGHT}
                    width={WIDTH}
                    paddingHorizontal={20}
                >
                    <FlashList
                        data={courses}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{paddingTop: 50, paddingBottom: 180}}
                        estimatedItemSize={81}
                        renderItem={renderCourseItem}
                        ListEmptyComponent={(dataLoading.courses && courses.length === 0) ? (
                            <Flex
                                gap={20}
                            >
                                {[1, 2, 3, 4].map(item => (
                                    <Skeleton
                                        width={WIDTH - 40}
                                        height={60}
                                        borderRadius={5}
                                        key={item}
                                    />
                                ))}
                            </Flex>
                        ) : (
                            <Flex
                                height={HEIGHT/2}
                                width={'100%'}
                                justifyContent='center'
                                alignItems='center'
                            >
                                <InterText
                                    fontWeight={600}
                                    fontSize={16}
                                >
                                    No courses found for your departments and level
                                </InterText>
                            </Flex>
                        )}
                        ListFooterComponent={(!dataLoading.courses && user?.level !== 100) ? (
                            <Flex
                                borderRadius={5}
                                paddingHorizontal={16}
                                paddingVertical={16}
                                gap={20}
                                style={{
                                    borderWidth: 1,
                                    borderColor: colors.primary,
                                }}
                            >
                                <InterText
                                    fontWeight={600}
                                    fontSize={16}
                                    lineHeight={19}
                                >
                                    REGISTER CARRY OVER(S) {'\n'}
                                    <InterText
                                        color={colors.subtext}
                                    >
                                        Use the button below to register carry over course(s) before registering other courses for this semester. Select  umber of carry over courses and click the Add course button.
                                    </InterText>
                                </InterText>
                                <SelectInput
                                    value={level?.toString() ?? ''}
                                    placeholder='Select Level'
                                    onPress={() => {
                                        openBottomSheet('Select level')
                                    }}
                                />
                                <CustomButton
                                    text='Add course'
                                    disabled={!level}
                                    onPress={() => {
                                        openBottomSheet('Select course')
                                    }}
                                    width={150}
                                />
                            </Flex>
                        ) : undefined}
                    />
                </Container>
            </Flex>
            {courses.length !== 0 && !dataLoading.courses && (
                <FixedButton
                    text='Register'
                    isLoading={isLoading}
                    disabled={!courses.some(item => item.is_selected)}
                    onPress={handleRegisterCourse}
                />
            )}
            <CustomBottomSheet
                ref={sheetRef}
                sheetTitle={sheetParameters.content}
                snapPoints={sheetParameters.snapPoints}
                closeBottomSheet={closeBottomSheet}
            >
                {sheetParameters.content === 'Select level' && (
                    <BottomSheetFlashList
                        data={levelOptions}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{paddingTop: 50}}
                        estimatedItemSize={81}
                        renderItem={renderLevelItem}
                    />
                )}
                {sheetParameters.content === 'Select course' && (
                    <Container
                        height={HEIGHT - 50}
                        width={WIDTH - 40}
                        style={{
                            position: "relative",
                            paddingBottom: 20,
                        }}
                    >
                        <BottomSheetFlashList
                            data={otherCourse}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{paddingTop: 50, paddingBottom: 150}}
                            estimatedItemSize={81}
                            renderItem={renderOtherCourseItem}
                            ListEmptyComponent={dataLoading.otherCourses ? (
                                <Flex
                                    gap={20}
                                >
                                    {[1, 2, 3, 4].map(item => (
                                        <Skeleton
                                            width={WIDTH - 40}
                                            height={60}
                                            borderRadius={5}
                                            key={item}
                                        />
                                    ))}
                                </Flex>
                            ) : (
                                <Flex
                                    width={'100%'}
                                    height={HEIGHT/1.5}
                                    justifyContent='center'
                                    alignItems='center'
                                >
                                    <Flex
                                        gap={20}
                                    >
                                        <InterText
                                            fontWeight={600}
                                            fontSize={16}
                                            lineHeight={19}
                                        >
                                            No courses found
                                        </InterText>
                                    </Flex>
                                </Flex>
                            )}
                        />
                        {otherCourse.length !== 0 && (
                            <CustomButton
                                text='Done'
                                disabled={!otherCourse.some(item => item.is_selected)}
                                onPress={handleIncludeOtherCOurse}
                            />
                        )}
                    </Container>
                )}
            </CustomBottomSheet>
        </React.Fragment>
    )
}

export default RegisterCourse

const styles = StyleSheet.create({})