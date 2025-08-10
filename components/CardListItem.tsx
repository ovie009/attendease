import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { colors } from '@/utilities/colors'
import { WIDTH } from '@/utilities/dimensions'
import Skeleton from './Skeleton'
import InterText from './InterText'
import { UserType } from '@/types/general';
import StatusAssignedIcon from '@/assets/svg/StatusAssignedIcon.svg';
import StatusUnassignedIcon from '@/assets/svg/StatusUnassignedIcon.svg';
import { Lecturer, Student } from '@/types/api'

type CardListItemProps = {
	cardUid?: string | undefined;
	assignedFor?: UserType | undefined;
    student?: Student,
    lecturer?: Lecturer,
	status?: boolean | undefined;
    onPress?: () => void | undefined;
	isLoading?: boolean | undefined;
}

const CardListItem: FC<CardListItemProps> = ({cardUid, assignedFor, student, lecturer,  status, isLoading, onPress}) => {
    return (
        <TouchableOpacity 
            style={styles.container}
            disabled={isLoading}
            onPress={onPress}
        >
            {isLoading ? <>
                <Skeleton
                    height={15}
                    width={75}
                    borderRadius={2.5}
                />
                <Skeleton
                    height={13}
                    width={120}
                    borderRadius={2.5}
                />
                <Skeleton
                    height={13}
                    width={100}
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
                    {cardUid}
                </InterText>
                <View style={styles.cardStatus}>
                    <InterText
                        fontSize={13}
                        lineHeight={17}
                        color={colors.subtext}

                    >
                        Status:
                    </InterText>
                    {status && <StatusAssignedIcon />}
                    {!status && <StatusUnassignedIcon />}
                    <InterText
                        fontSize={13}
                        lineHeight={17}
                        color={colors.subtext}
                    >
                        {status ? "Assigned" : "Unassigned"}
                    </InterText>
                </View>
                
                <InterText
                    fontSize={13}
                    lineHeight={17}
                    color={colors.subtext}
                >
                    Type: {assignedFor}
                </InterText>
                
                {!(student === undefined && lecturer  === undefined) && (
                    <InterText
                        fontSize={13}
                        lineHeight={17}
                        color={colors.subtext}
                        fontWeight={500}
                    >
                        {student?.full_name ? student?.full_name : ""}
                        {lecturer?.full_name ? lecturer?.full_name +" • "+ lecturer?.role : ""}
                    </InterText>
                )}
            </>}
        </TouchableOpacity>
    )
}

export default CardListItem

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