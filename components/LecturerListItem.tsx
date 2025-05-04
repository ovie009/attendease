import { StyleSheet, TouchableOpacity } from 'react-native'
import React, { FC } from 'react'
import { colors } from '@/utilities/colors'
import { WIDTH } from '@/utilities/dimensions'
import Skeleton from './Skeleton'
import InterText from './InterText'
import { Role } from '@/types/general';

type LecturerListItemProps = {
	fullName?: string | undefined;
	departmentName?: string  | undefined;
	collegeName?: string | undefined;
	courseIds?: string[] | null | undefined;
    role?: Role | undefined;
    onPress: () => void;
	isLoading?: boolean | undefined;
}

const LecturerListItem: FC<LecturerListItemProps> = ({fullName, departmentName, collegeName, courseIds, role, isLoading, onPress}) => {
    return (
        <TouchableOpacity 
            style={styles.container}
            disabled={isLoading}
            onPress={onPress}
        >
            {isLoading ? <>
                <Skeleton
                    height={15}
                    width={100}
                    borderRadius={2.5}
                />
                <Skeleton
                    height={13}
                    width={120}
                    borderRadius={2.5}
                />
                <Skeleton
                    height={13}
                    width={50}
                    borderRadius={2.5}
                />
                <Skeleton
                    height={13}
                    width={100}
                    borderRadius={2.5}
                />
            </> : <>
                <InterText
                    fontSize={15}
                    lineHeight={17}
                    fontWeight={500}
                >
                    {fullName}
                </InterText>
                
                <InterText
                    fontSize={13}
                    lineHeight={17}
                    color={colors.subtext}
                >
                    Department: {departmentName}
                </InterText>
                <InterText
                    fontSize={13}
                    lineHeight={17}
                    color={colors.subtext}
                >
                    Course: {courseIds ? courseIds.length : 0}
                </InterText>
                <InterText
                    fontSize={13}
                    lineHeight={17}
                    color={colors.subtext}
                >
                    Role: {role}
                    {role === 'HOD' && departmentName && ` of ${departmentName}`} 
                    {role === 'Dean' && collegeName && ` of ${collegeName}`}
                </InterText>
            </>}
        </TouchableOpacity>
    )
}

export default LecturerListItem

const styles = StyleSheet.create({
    container: {
        width: WIDTH - 40,
        marginBottom: 20,
        display: 'flex',
        gap: 5,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 14,
        borderColor: colors.border,
    },
    cardStatus: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 3,
    }
})