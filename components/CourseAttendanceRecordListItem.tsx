import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import Flex from './Flex'
import { WIDTH } from '@/utilities/dimensions'
import InterText from './InterText'
import { colors } from '@/utilities/colors'
import { Course } from '@/types/api'
import Skeleton from './Skeleton'

interface CourseAttendanceRecordListItemProps {
    course: Course,
    isLoading?: boolean,
    totalWeeks: number,
    totalClasses: number,
    classesPerWeek: number,
}

const CourseAttendanceRecordListItem: FC<CourseAttendanceRecordListItemProps> = ({ course, isLoading, totalWeeks, totalClasses, classesPerWeek }) => {
    return (
        <Flex
            width={WIDTH - 40}
            flexDirection='row'
            alignItems='center'
            paddingHorizontal={20}
            paddingVertical={10}
            justifyContent='space-between'
            borderRadius={10}
            style={{
                marginBottom: 10,
                borderWidth: 1,
                borderColor: colors.border
            }}
        >
            {isLoading ? (
                <Skeleton
                    width={80}
                    height={15}
                />
            ) : (
                <InterText
                    fontWeight={500}
                    fontSize={12}
                    lineHeight={15}
                >
                    {course?.course_code}
                </InterText>
            )}
            <Flex
                gap={2}
                alignItems='center'
            >
                {isLoading ? (
                    <Skeleton
                        width={75}
                        height={15}
                    />
                ) : (
                    <InterText
                        fontSize={10}
                        lineHeight={15}
                        color={colors.subtext}
                    >
                        {((totalClasses/(totalWeeks*classesPerWeek))*100)?.toFixed(2)}%
                    </InterText>
                )}
                {isLoading ? (
                    <Skeleton
                        width={100}
                        height={15}
                        borderRadius={10}
                    />
                ) : (
                    <Flex
                        width={100}
                        height={15}
                        borderRadius={10}
                        backgroundColor={colors.recordBackground}
                    >
                        <Flex
                            width={Math.min((totalClasses/(totalWeeks*classesPerWeek)) * 100, 100)}
                            height={15}
                            // borderRadius={10}
                            backgroundColor={colors.green}
                            style={{
                                borderTopLeftRadius: 10,
                                borderBottomLeftRadius: 10,
                            }}
                        />
                    </Flex>
                )}
            </Flex>
            {isLoading ? (
                <Skeleton
                    width={50}
                    height={17}
                />
            ) : (
                <InterText
                    fontSize={10}
                    fontWeight={500}
                    color={colors.subtext}
                >
                    {totalClasses}/{(totalWeeks*classesPerWeek)} lectures
                </InterText>
            )}
        </Flex>
    )
}

export default CourseAttendanceRecordListItem

const styles = StyleSheet.create({})