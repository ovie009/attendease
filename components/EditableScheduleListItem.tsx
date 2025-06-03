import { StyleSheet, TouchableOpacity } from 'react-native'
import React, { FC } from 'react'
import Flex, { FlexProps } from './Flex'
import { colors } from '@/utilities/colors'
import InterText from './InterText';
import moment from 'moment';
import Feather from '@expo/vector-icons/Feather';
import Skeleton from './Skeleton';

interface EditableCourseListItemProps extends FlexProps {
    courseTitle: string,
    courseCode: string,
    daysOfTheWeek: number[],
    lectureHours: number[],
    lectureStartTime: number[],
    venue: string,
    hideEditButton?: boolean,
    isError?: boolean, 
    isLoading?: boolean,
    onPress?: () => void;
    onPressEdit?: () => void;
}

const EditableScheduleListItem: FC<EditableCourseListItemProps> = ({courseTitle, courseCode, onPress, onPressEdit, lectureHours, lectureStartTime, daysOfTheWeek, venue, isError, hideEditButton, isLoading, ...rest}) => {

    const formatLectureSchedule = () => {
        if (!daysOfTheWeek) return '';
        const array = daysOfTheWeek.map((day, index) => {
            return `${moment().day(day).format('ddd')}: ${moment(lectureStartTime[index], 'H').format('ha')} - ${moment(lectureHours[index] + lectureStartTime[index], 'H').format('ha')}`;
        })

        if (array.length === 0) return 'Period: N/A'

        return array.join('\n');
    }

    return (
        <TouchableOpacity onPress={onPress}>
            <Flex
                flexDirection='row'
                justifyContent='space-between'
                gap={20}
                style={{
                    padding: 15,
                    borderRadius: 14,
                    backgroundColor: colors.lightBackground,
                    borderWidth: 1,
                    borderColor: isError ? colors.error : colors.inputBorder,
                    marginBottom: 20,
                }}
                {...rest}
            >
                <Flex gap={5}>
                    {isLoading ? (
                        <React.Fragment>
                            <Skeleton
                                width={125}
                                height={19}
                            />
                            <Skeleton
                                width={150}
                                height={17}
                            />
                            <Skeleton
                                width={75}
                                height={15}
                            />
                            <Skeleton
                                width={75}
                                height={15}
                            />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <InterText
                                fontSize={16}
                                lineHeight={19}
                                fontWeight={500}
                            >
                                {courseCode}
                            </InterText>
                            <InterText
                                color={colors.subtext}
                                numberOfLines={1}
                            >
                                {courseTitle ? courseTitle : 'Course Title: N/A'}
                            </InterText>
                            <InterText
                                color={colors.subtext}
                                fontSize={12}
                                lineHeight={15}
                                // numberOfLines={1}
                            >
                                {formatLectureSchedule()}
                            </InterText>
                            <InterText
                                color={colors.subtext}
                                fontSize={12}
                                lineHeight={15}
                                numberOfLines={1}
                            >
                                Venue: {venue ? venue : 'N/A'}
                            </InterText>
                        </React.Fragment>
                    )}
                </Flex>
                {!hideEditButton && (
                    <TouchableOpacity
                        onPress={onPressEdit}
                    >
                        <Flex
                            justifyContent='center'
                            alignItems='center'
                            width={24}
                            height={24}
                            backgroundColor={colors.white}
                            borderRadius={5}
                        >
                            <Feather name="edit" size={16} color="black" />
                        </Flex>
                    </TouchableOpacity>
                )}
            </Flex>
        </TouchableOpacity>
    )
}

export default EditableScheduleListItem

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 14,
        backgroundColor: colors.lightBackground,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        marginBottom: 20,
    }
})