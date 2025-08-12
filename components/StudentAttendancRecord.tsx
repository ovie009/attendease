import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import Flex from './Flex';
import OutlinedContainer from './OutlinedContainer';
import { AttendanceSession, Student } from '@/types/api';
import Avatar from './Avatar';
import InterText from './InterText';
import { colors } from '@/utilities/colors';
import moment from 'moment';
import Skeleton from './Skeleton';
import { WIDTH } from '@/utilities/dimensions';

export interface StudentAttendancRecordProps {
    student: Student,
    created_at?: string,
    is_loading?: boolean,
    attendancd_session?: AttendanceSession,
}

const StudentAttendancRecord: FC<StudentAttendancRecordProps> = ({student, created_at, attendancd_session, is_loading}) => {
    console.log("🚀 ~ StudentAttendancRecord ~ attendancd_session:", attendancd_session)
    return (
        <Flex
            width={WIDTH - 40}
            gap={8}
            style={{
                marginBottom: 20
            }}
        >
            {attendancd_session && (
                <Flex>
                    <InterText
                    
                    >
                        Lecture period •&nbsp;
                        <InterText
                            fontWeight={500}
                            // fontSize={16}
                            // lineHeight={20}
                        >
                            {moment(attendancd_session?.started_at).format('h:mma')} -&nbsp;
                            {moment(attendancd_session?.ended_at).format('h:mma')}&nbsp;
                            ({moment(attendancd_session?.created_at).format('ddd MM, YYYY')})
                        </InterText>
                    </InterText>
                </Flex>
            )}
            <OutlinedContainer
                gap={16}
                width={WIDTH - 40}
                paddingHorizontal={16}
                paddingVertical={16}
            >
                <Flex
                    flexDirection='row'
                    alignItems='center'
                    gap={16}
                >
                    {is_loading ? (
                        <React.Fragment>
                            <Skeleton
                                width={40}
                                height={40}
                                borderRadius={20}
                            />
                            <Flex
                                gap={2}
                            >
                                <Skeleton 
                                    width={100}
                                    height={20}
                                />
                                <Skeleton 
                                    width={75}
                                    height={17}
                                />
                            </Flex>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Avatar
                                name={student?.full_name}
                                imageUri={null}
                            />
                            <Flex
                            >
                                <InterText
                                    fontSize={16}
                                    lineHeight={20}
                                    fontWeight={500}
                                >
                                    {student?.full_name}
                                </InterText>
                                <InterText
                                    color={colors.subtext}
                                >
                                    {student?.email}
                                </InterText>
                            </Flex>
                        </React.Fragment>
                    )}
                </Flex>
                {is_loading && (
                    <Skeleton
                        width={125}
                        height={17}
                    />
                )}
                
                {!is_loading && created_at && (
                    <InterText
                        color={colors.subtext}
                    >
                        Logged at:&nbsp;
                        <InterText>
                            {moment(created_at).format('h:mma')}
                        </InterText>
                    </InterText>
                )}
            </OutlinedContainer>
        </Flex>
    )
}

export default StudentAttendancRecord;