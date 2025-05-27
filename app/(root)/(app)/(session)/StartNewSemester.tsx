import { ScrollView, StyleSheet } from 'react-native'
import React, { useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import Flex from '@/components/Flex'
import SelectInput from '@/components/SelectInput'
import FixedButton from '@/components/FixedButton'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomCalendar from '@/components/CustomCalendar'
import handleSettings, { SettingPayload } from '@/api/handleSettings'
import { useAppStore } from '@/stores/useAppStore'

const StartNewSemester = () => {

    const {
        displayToast,
        setIsLoading,
    } = useAppStore.getState();

    const isLoading = useAppStore((state) => state.isLoading);

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

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
            text='Start semester'
            isLoading={isLoading}
            onPress={handleCreateAcademicSession}
            disabled={!startDate || !endDate}
        />
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

export default StartNewSemester

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: 20,
        flexGrow: 1,
        backgroundColor: colors.white,
        paddingTop: 30,
    },
})