// react native components
import { StyleSheet, View, Pressable } from "react-native";
import { colors } from "../utilities/colors";
// bottomsheet components
import React, { useEffect, useMemo, useState } from "react";
// calendarPicker component
// import CalendarPicker from 'react-native-calendar-picker'; 
// import icons
// components
import { WIDTH } from "../utilities/dimensions";
// gloabl variables from App context
import { Calendar } from 'react-native-calendars';
import moment from "moment";
import CustomBottomSheet, { CustomBottomSheetProps } from "./CustomBottomSheet";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";


interface CustomCalendarProps extends Omit<CustomBottomSheetProps, 'snapPoints'> {
    isCalendarVisible: boolean;
    startDate?: string;
    closeCalendar: () => void;
    minDate?: string;
    maxDate?: string;
    onSelectDateCallback: (date: string) => void;
}


const CustomCalendar = React.forwardRef<BottomSheetModal, CustomCalendarProps>(({isCalendarVisible, startDate, closeCalendar, minDate, maxDate, onSelectDateCallback, ...rest}, ref) => {

    // temporary date variable
    const [tempStartDate, setTempStartDate] = useState(startDate ?? "");

    // initital date
    const [initialDate, setInitaiDate] = useState(moment().format("YYYY-MM-DD"))

    useEffect(() => {
        if (!isCalendarVisible) {
            // reset temp values
            setTempStartDate('')
        } else {
            // if start date changes, update temp date
            setTempStartDate(startDate ?? "");

            // if start date changes, update initial date
            if (startDate) {
                setInitaiDate(startDate);
            }
        }
    }, [isCalendarVisible, startDate])

    const markedDates = useMemo(() => {
        if (tempStartDate) {
            // console.log('here')
            return {
                [tempStartDate]: {selected: true, color: colors.primary, textColor: colors.white, startingDay: true, endingDay: true},
            }
        }
        return {}
    }, [tempStartDate, startDate])

   
    // render calendar sheet component
    return (
        <CustomBottomSheet
            index={0}
            ref={ref}
            opacity={0.2}
            hideSheetHeader={true}
            snapPoints={['100%']}
            backgroundStyle={styles.backgroundStyle}
            handleComponent={() => <></>}
            {...rest}
        >
            <BottomSheetView 
                style={styles.modal}
            >
                <Pressable onPress={closeCalendar} style={styles.container} />
                <View style={styles.calenderWrapper}>
                    <Calendar
                        minDate={minDate}
                        maxDate={maxDate}
                        initialDate={initialDate}
                        onDayPress={day => {
                            setTempStartDate(day.dateString);
                            onSelectDateCallback(day.dateString);
                        }}
                        theme={{
                            // backgroundColor: 'red',
                            // calendarBackground: 'red',
                            textSectionTitleColor: colors.subtext,
                            selectedDayBackgroundColor: colors.primary,
                            selectedDayTextColor: colors.white,
                            todayTextColor: colors.primary,
                            dayTextColor: colors.black,
                            textDisabledColor: colors.neutral
                        }}
                        markingType={'period'}
                        markedDates={markedDates}
                        disableAllTouchEventsForDisabledDays={true}
                        disableAllTouchEventsForInactiveDays={true}
                    />
                </View>
            </BottomSheetView>
        </CustomBottomSheet>
    );
})
 
// stylesheet
const styles = StyleSheet.create({
    backgroundStyle: {
        backgroundColor: colors.transparent,
        borderRadius: 0,
    },
    container: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 2,
        width: '100%',
        height: '100%',
        // backgroundColor: 'red',
    },
    modal: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        // backgroundColor: 'red',
    },
    calenderWrapper: {
        backgroundColor: colors.white,
        borderRadius: 24,
        paddingTop: 20,
        width: WIDTH - 49,
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 20,
        paddingBottom: 30,
    },
    calendarBaseContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        padding: 20,
        width: '100%',
    },
    actionButtonsWrapper: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 14,
    },
    selectedButton: {
        borderWidth: 1,
        borderColor: colors.primary,
    }
});


export default CustomCalendar;