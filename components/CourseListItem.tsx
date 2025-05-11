import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { Level, Semester } from '@/types/general'
import Flex from './Flex'
import InterText from './InterText'
import moment from 'moment'
import { WIDTH } from '@/utilities/dimensions'
import { colors } from '@/utilities/colors'
import Skeleton from './Skeleton'

interface CourseListItemProps {
    courseTitle: string | undefined,
    courseCode: string | undefined,
    level: Level | undefined,
    semester: Semester | undefined,
    isLoading?: boolean | undefined,
    onPress: () => void,
}

const CourseListItem:  FC<CourseListItemProps> = ({courseTitle, courseCode, level, semester, isLoading, onPress}) => {
    return (
        <TouchableOpacity
            disabled={isLoading}
            onPress={onPress}
        >
            <Flex
                width={WIDTH - 40}
                style={styles.container}
                // gap={5}
                flexDirection='row'
                alignItems='center'
                borderRadius={14}
            >
                <View 
                    style={styles.verticalStrip}
                />
                <Flex
                    style={{padding: 10}}
                    gap={5}
                >
                    {isLoading ? (
                        <Skeleton
                            width={75}
                            height={17}
                            borderRadius={2.5}
                        />
                    ) : (
                        <InterText
                            fontWeight={500}
                        >
                            {courseCode}
                        </InterText>
                    )}
                    <Flex gap={2}>
                        {isLoading ? (
                            <Skeleton
                                width={150}
                                height={17}
                                borderRadius={2.5}
                            />                            
                        ) : (
                            <InterText
                                fontSize={13}
                                numberOfLines={1}
                                color={colors.subtext}
                            >
                                {courseTitle}
                            </InterText>
                        )}
                        {isLoading ? (
                            <Skeleton
                                height={17+12}
                                width={150}
                                borderRadius={10}
                            />
                        ) : (
                            <Flex
                                gap={7}
                                flexDirection='row'
                                alignItems='center'
                                borderRadius={10}
                                style={styles.infoWrapper}
                            >
                                <InterText
                                    fontSize={12}
                                    color={colors.subtext}
                                >
                                    Level: {level}
                                </InterText>
                                <View style={styles.seperator} />
                                <InterText
                                    fontSize={12}
                                    color={colors.subtext}
                                >
                                    Semester: {moment(semester, 'd').format('do')}
                                </InterText>
                            </Flex>
                        )}
                    </Flex>
                </Flex>
            </Flex>
        </TouchableOpacity>
    )
}

export default CourseListItem

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        overflow: 'hidden',
    },
    verticalStrip: {
        width: 8,
        height: '100%',
        backgroundColor: colors.primary,
    },
    infoWrapper: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        padding: 6,
        // paddingHorizontal: 3
    },
    seperator: {
        width: 1,
        height: '100%',
        backgroundColor: colors.inputBorder
    }
})