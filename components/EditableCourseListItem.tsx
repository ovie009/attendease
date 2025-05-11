import { StyleSheet, TouchableOpacity } from 'react-native'
import React, { FC } from 'react'
import Flex, { FlexProps } from './Flex'
import { colors } from '@/utilities/colors'
import Entypo from '@expo/vector-icons/Entypo';
import InterText from './InterText';

interface EditableCourseListItemProps extends FlexProps {
    courseTitle: string,
    courseCode: string,
    onPress: () => void;
}

const EditableCourseListItem: FC<EditableCourseListItemProps> = ({courseTitle, courseCode, onPress, ...rest}) => {
    return (
        <Flex
            flexDirection='row'
            justifyContent='space-between'
            style={styles.container}
            gap={20}
            {...rest}
        >
            <Flex gap={5}>
                <InterText
                    fontWeight={500}
                >
                    {courseCode}
                </InterText>
                <InterText
                    color={colors.subtext}
                    fontSize={12}
                    lineHeight={15}
                    numberOfLines={1}
                >
                    {courseTitle}
                </InterText>
            </Flex>
            <TouchableOpacity
                onPress={onPress}
            >
                <Flex
                    justifyContent='center'
                    alignItems='center'
                    width={24}
                    height={24}
                    backgroundColor={colors.white}
                    borderRadius={5}
                >
                    <Entypo name="dots-three-vertical" size={12} color="black" />
                </Flex>
            </TouchableOpacity>
        </Flex>
    )
}

export default EditableCourseListItem

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 14,
        backgroundColor: colors.lightBackground,
        borderWidth: 1,
        borderColor: colors.inputBorder,
    }
})