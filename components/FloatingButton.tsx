import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import React, { FC } from 'react'
import { colors } from '@/utilities/colors'

const FloatingButton: FC<{
    onPress: () => void,
    Icon: React.ReactNode,
    disabled?: boolean | undefined,
    style?: ViewStyle | undefined,
}> = ({onPress, Icon, disabled, style}) => {
    return (
        <TouchableOpacity 
            style={[styles.container, style]}
            onPress={onPress}
            disabled={disabled}
        >
            {Icon}
        </TouchableOpacity>
    )
}

export default FloatingButton

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 80,
        height: 80,
        borderRadius: 40,
        elevation: 5,
        backgroundColor: colors.primary,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }
})