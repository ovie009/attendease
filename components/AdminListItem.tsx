import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { colors } from '@/utilities/colors'
import { WIDTH } from '@/utilities/dimensions'
import Skeleton from './Skeleton'
import InterText from './InterText'
import Avatar from './Avatar'

interface AdminListItemProps {
    profilePicture: string | null | undefined,
    fullName: string | undefined,
    email?: string | undefined,
    isLoading?: boolean | undefined,
    onPress?: () => void | undefined,
}

const AdminListItem: FC<AdminListItemProps> = ({profilePicture, fullName, email, isLoading, onPress}) => {
    return (
        <TouchableOpacity 
            style={styles.container}
            disabled={isLoading}
            onPress={onPress}
        >
            {isLoading && (
                <Skeleton
                    width={45}
                    height={45}
                    borderRadius={45/2}
                />
            )}
            {!isLoading && fullName && (
                <Avatar
                    diameter={40}
                    imageUri={profilePicture}
                    name={fullName}
                />
            )}
            <View style={styles.detailsWrapper}>
                {isLoading ? <>
                    <Skeleton
                        width={100}
                        height={16}
                        borderRadius={2.5}
                    />
                    <Skeleton
                        width={125}
                        height={12}
                        borderRadius={2.5}
                    />
                </> : <>
                    <InterText
                        fontSize={16}
                        lineHeight={16}
                    >
                        {fullName}
                    </InterText>
                    <InterText
                        color={colors.textSecondary}
                        fontSize={12}
                        lineHeight={12}
                    >
                        {email}
                    </InterText>
                </>}
            </View>
        </TouchableOpacity>
    )
}

export default AdminListItem

const styles = StyleSheet.create({
    container: {
        width: WIDTH - 40,
        marginBottom: 20,
        display: 'flex',
        gap: 10,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 16,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 14,
        borderColor: colors.border,
    },
    number: {
        width: 45,
        height: 45,
        borderRadius: 45/2,
        backgroundColor: colors.primary,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsWrapper: {
        display: 'flex',
        gap: 5,
    }
})