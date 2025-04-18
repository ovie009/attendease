import { StyleSheet } from 'react-native'
import React, { FC, ReactNode } from 'react'
import { colors } from '../utilities/colors'
import CustomButton, { CustomButtonProps } from './CustomButton'
import FixedWrapper, { FixedWrapperProps } from './FixedWrapper'


const FixedButton: FC<CustomButtonProps & FixedWrapperProps> = ({text, onPress, disabled, contentContainerStyle, backgroundColor, isLoading, ...rest}) => {

    return (
        <FixedWrapper>
            <CustomButton
                {...rest}
                text={text}
                onPress={onPress}
                disabled={disabled}
                isLoading={isLoading}
            />
        </FixedWrapper>
    )
}

export default FixedButton

const styles = StyleSheet.create({
    fixedButton: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: 100,
        paddingTop: 26,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
    }
})