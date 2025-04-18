import { StyleSheet } from 'react-native'
import React, { FC, ReactNode } from 'react';
// text
import { colors } from '../utilities/colors';
import InterText, { InterTextProps } from './InterText';

export interface LinkTextProps extends InterTextProps {
    onPress: () => any,
    children: ReactNode,
    color?: string | undefined,
}

const LinkText: FC<LinkTextProps> = ({onPress, children, color, ...rest}) => {
    return (
        <InterText
            {...rest}
            color={color !== undefined ? color : colors.primary}
            textStyle={styles.linkText}
            onPress={onPress}
        >
            {children}
        </InterText>
    )
}

export default LinkText

const styles = StyleSheet.create({
    linkText: {
        textDecorationStyle: 'solid',
        textDecorationLine: 'underline',
        textDecorationColor: colors.primary,
    },
})