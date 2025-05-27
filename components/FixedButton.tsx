import React, { FC } from 'react'
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