import { ScrollView, StyleSheet } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import Flex from '@/components/Flex'
import { Semester } from '@/types/general'
import SelectInput from '@/components/SelectInput'
import moment from 'moment'
import FixedButton from '@/components/FixedButton'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { HEIGHT } from '@/utilities/dimensions'
import { ListRenderItemInfo } from '@shopify/flash-list'
import OptionListItem from '@/components/OptionListItem'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import CustomCalendar from '@/components/CustomCalendar'
import handleSettings, { SettingPayload } from '@/api/handleSettings'
import { useAppStore } from '@/stores/useAppStore'

type SelectableSemester = {
    id: string,
    value: Semester,
    is_selected: boolean
}

type SelectableAcademicSession = {
    id: string,
    value: string,
    is_selected: boolean
}

type BottomSheetContent = 'Select Session' | 'Select Semester';

const AddSession = () => {

    const {
        displayToast,
        setIsLoading,
    } = useAppStore.getState();

    const isLoading = useAppStore((state) => state.isLoading);

    const [semester, setSemester] = useState<Semester | null>(null)

    const [academicSession, setAcademicSession] = useState<string>('')

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const [semesterOptions, setSemesterOptions] = useState<SelectableSemester[]>([
        {
            id: '1',
            value: 1,
            is_selected: false,
        },
        {
            id: '2',
            value: 2,
            is_selected: false,
        },
    ]);

    const [sessionOptions, setSessionOptions] = useState<SelectableAcademicSession[]>([
        {
            id: '1',
            value: `${moment().year()}/${moment().add(1, 'year').year()}`,
            is_selected: false,
        },
        {
            id: '2',
            value: `${moment().subtract(1, 'year').year()}/${moment().year()}`,
            is_selected: false,
        },
    ]);

    const sheetRef = useRef<BottomSheetModal>(null);
	const [sheetParameters, setSheetParameters] = useState<{snapPoints: [string | number], content: BottomSheetContent}>({
		snapPoints: ['50%'],
		content: 'Select Session',
	})

	const openBottomSheet = useCallback((content: BottomSheetContent) => {
		const minHeight = 130;
		const listItemHieght = 60;

		let height = 0;
		if (content === 'Select Session') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*sessionOptions.length);
		} else if (content === 'Select Semester') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*semesterOptions.length);
		}

		setSheetParameters({
			snapPoints: [height],
			content,
		})

		sheetRef?.current?.present();
	}, [semesterOptions, sessionOptions])

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}

    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const calendarRef = useRef<BottomSheetModal>(null);
    const [selecteCalendarType, setSelectedCalendarType] = useState<'start' | 'end'>('start');

    const openCalendar = (type: 'start' | 'end'): void => {
        calendarRef?.current?.present();
        setIsCalendarVisible(true)

        setSelectedCalendarType(type);
    }

    const closeCalendar = (): void => {
        calendarRef?.current?.close();
        setIsCalendarVisible(false)
    };

    const handleSelectSemster = useCallback((id: string): void => {
        // This check ensures that 'find' below will succeed.
        if (semesterOptions.some(item => item.id === id)) {
            // Add '!' after find(...) to assert it's not null/undefined
            const foundValue = semesterOptions.find((item) => item.id === id)!;
            setSemester(foundValue.value); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

            // update lecturer list
            setSemesterOptions(prevState => {
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
    }, [semesterOptions]);

    const handleSelectSession = useCallback((id: string): void => {
        // This check ensures that 'find' below will succeed.
        if (sessionOptions.some(item => item.id === id)) {
            // Add '!' after find(...) to assert it's not null/undefined
            const foundValue = sessionOptions.find((item) => item.id === id)!;
            setAcademicSession(foundValue.value); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

            // update lecturer list
            setSessionOptions(prevState => {
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
    }, [sessionOptions]);

    const renderSemsterItem = useCallback(({item}: ListRenderItemInfo<SelectableSemester>) => (
		<OptionListItem
			id={item?.id}
			text={`${moment(item.value, 'd').format('do')} semester`}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectSemster(item.id)
			}}
		/>
	), [handleSelectSemster]);

    const renderSessionItem = useCallback(({item}: ListRenderItemInfo<SelectableAcademicSession>) => (
		<OptionListItem
			id={item?.id}
			text={`${item.value} academic session`}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectSession(item.id)
			}}
		/>
	), [handleSelectSemster]);

    const handleCreateAcademicSession = async () => {
        try {
            setIsLoading(true);

            const sessionData: SettingPayload[] = [
                // {
                //     key: 'academic_session',
                //     value: academicSession,
                //     type: 'string'
                // },
                // {
                //     key: 'semester',
                //     value: semester?.toString() ?? '',
                //     type: 'number'
                // },
                {
                    key: 'start_of_semester',
                    value: startDate,
                    type: 'date'
                },
                {
                    key: 'end_of_semester',
                    value: endDate,
                    type: 'date'
                }
            ]

            for (const object of sessionData) {
                await handleSettings.create(object);
            }
        } catch (error: any) {
            displayToast('ERROR', error?.message)
        } finally {
            setIsLoading(false);
        }
    }

    return <>
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
        >
            <Flex
                flex={1}
                gap={20}
            >
                {/* <InterText>
                    Add session details
                </InterText> */}
                <SelectInput
                    label='Academic session'
                    value={academicSession}
                    placeholder='Select the current academic session'
                    onPress={() => {
                        openBottomSheet('Select Session')
                    }}
                />
				<SelectInput
					label='Select Semester'
					placeholder='1st semester'
					onPress={() => {
                        openBottomSheet('Select Semester')
                    }}
					value={semester ? `${moment(semester, 'd').format('do')} semester` : ''}
				/>

				<SelectInput
					label='Start date'
					placeholder='When will the session start?'
					onPress={() => {
                        openCalendar('start')
                    }}
                    value={startDate}
				/>

				<SelectInput
					label='End date'
					placeholder='When will the semester end?'
					onPress={() => {
                        openCalendar('end')
                    }}
                    value={endDate}
				/>
                
            </Flex>
        </ScrollView>
        <FixedButton
            text='Save'
            isLoading={isLoading}
            onPress={handleCreateAcademicSession}
            disabled={!semester || !academicSession || !startDate || !endDate}
        />
		<CustomBottomSheet
			ref={sheetRef}
			sheetTitle={sheetParameters.content}
			snapPoints={sheetParameters.snapPoints}
			closeBottomSheet={closeBottomSheet}
		>
			{sheetParameters.content === 'Select Session' && (
				<BottomSheetFlashList
					data={sessionOptions}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderSessionItem}
				/>
			)}
			{sheetParameters.content === 'Select Semester' && (
				<BottomSheetFlashList
					data={semesterOptions}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderSemsterItem}
				/>
			)}
		</CustomBottomSheet>
        <CustomCalendar
            ref={calendarRef}
            closeBottomSheet={closeCalendar}
            isCalendarVisible={isCalendarVisible}
            startDate={selecteCalendarType === 'start' ? startDate : endDate}
            closeCalendar={closeCalendar}
            maxDate={(selecteCalendarType === 'start' && endDate) ? endDate : undefined}
            minDate={(selecteCalendarType === 'end' && startDate) ? startDate : undefined}
            onSelectDateCallback={(date: string) => {
                if (selecteCalendarType === 'start') {
                    setStartDate(date);
                } else {
                    setEndDate(date);
                }
                closeCalendar();
            }}
        />
    </>
}

export default AddSession

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: 20,
        flexGrow: 1,
        backgroundColor: colors.white,
        paddingTop: 30,
    },
})