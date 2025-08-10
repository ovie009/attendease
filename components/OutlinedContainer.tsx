import { colors } from '@/utilities/colors'
import { WIDTH } from '@/utilities/dimensions'
import React, { FC } from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import Flex, { FlexProps } from './Flex'

export interface OutlinedContainerProps extends FlexProps {
    style?: ViewStyle,
}

const OutlinedContainer: FC<OutlinedContainerProps> = ({style, ...rest}) => {
    return (
        <Flex
            {...rest}
            width={rest?.width || WIDTH - 32}
            borderRadius={16}
            style={[
                {
                    borderWidth: 1,
                    borderColor: colors.inputBorder
                },
                style,
            ]}
        >
            {rest.children}
        </Flex>
    )
}

export default OutlinedContainer

const styles = StyleSheet.create({})