import { FC, ReactNode } from 'react';
import { DimensionValue, StyleProp, View, ViewProps, ViewStyle } from 'react-native';


export interface ContainerProps extends ViewProps {
    children?: ReactNode | undefined,
    style?: StyleProp<ViewStyle>,
    width?: DimensionValue | undefined,
    height?: DimensionValue | undefined,
    paddingBottom?: number | undefined,
    paddingTop?: number | undefined,
    paddingLeft?: number | undefined,
    paddingRight?: number | undefined,
    paddingVertical?: number | undefined,
    paddingHorizontal?: number | undefined,
    backgroundColor?: string | undefined,
}

const Container: FC<ContainerProps> = ({
    width,
    height,
    backgroundColor,
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
                width !== undefined && {width},
                height !== undefined && {height},
                paddingBottom !== undefined && {paddingBottom},
                paddingHorizontal !== undefined && {paddingHorizontal},
                paddingLeft !== undefined && {paddingLeft},
                paddingRight !== undefined && {paddingRight},
                paddingTop!== undefined && {paddingTop},
                paddingVertical !== undefined && {paddingVertical},
                backgroundColor !== undefined && {backgroundColor},
                style,
            ]}
            {...rest}
        >
            {children}
        </View>
    )
}

export default Container;