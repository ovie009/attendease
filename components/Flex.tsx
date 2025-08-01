import { FC, ReactNode } from 'react';
import { DimensionValue, StyleProp, View, ViewProps, ViewStyle } from 'react-native';


export interface FlexProps extends ViewProps {
    children?: ReactNode | undefined,
    justifyContent?: 'center' | 'space-between' | 'space-evenly' | 'space-around' | 'flex-start' | 'flex-end' | undefined,
    alignItems?: 'center' | 'stretch' |'baseline' | 'flex-start' | 'flex-end' | undefined,
    alignSelf?: 'auto' | 'center' | 'stretch' |'baseline' | 'flex-start' | 'flex-end' | undefined,
    flexDirection?: 'row' | 'column' | undefined,
    flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse' | undefined,
    style?: StyleProp<ViewStyle>,
    gap?: number,
    width?: DimensionValue,
    flex?: number,
    height?: DimensionValue,
    paddingBottom?: number,
    paddingTop?: number,
    paddingLeft?: number,
    paddingRight?: number,
    paddingVertical?: number,
    paddingHorizontal?: number,
    borderRadius?: number,
    backgroundColor?: string,
}

const Flex: FC<FlexProps> = ({
    justifyContent = 'flex-start', 
    alignItems = 'flex-start',
    alignSelf = 'auto',
    flexDirection = 'column',
    flexWrap = 'nowrap',
    gap,
    width,
    flex,
    height,
    backgroundColor,
    borderRadius,
    paddingBottom,
    paddingHorizontal,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingVertical,
    children,
    style,
    ...rest
}) => {
    
    return (
        <View 
            style={[
                {justifyContent},
                {alignItems},
                {alignSelf},
                {flexDirection},
                {flexWrap},
                gap !== undefined && {gap},
                flex !== undefined && {flex},
                width !== undefined && {width},
                height !== undefined && {height},
                paddingBottom !== undefined && {paddingBottom},
                paddingHorizontal !== undefined && {paddingHorizontal},
                paddingLeft !== undefined && {paddingLeft},
                paddingRight !== undefined && {paddingRight},
                paddingTop!== undefined && {paddingTop},
                paddingVertical !== undefined && {paddingVertical},
                backgroundColor !== undefined && {backgroundColor},
                borderRadius !== undefined && {borderRadius},
                style,
            ]}
            {...rest}
        >
            {children}
        </View>
    )
}

export default Flex;