import { View, ViewStyle } from 'react-native'
import { FC, ReactNode } from 'react'
import { ViewProps } from 'react-native'


export interface FlexProps extends ViewProps {
    children?: ReactNode | undefined,
    justifyContent?: 'center' | 'space-between' |'space-evenly' | 'space-around' | 'flex-start' | 'flex-end' | undefined,
    alignItems?: 'center' | 'stretch' |'baseline' | 'flex-start' | 'flex-end' | undefined,
    alignSelf?: 'auto' | 'center' | 'stretch' |'baseline' | 'flex-start' | 'flex-end' | undefined,
    flexDirection?: 'row' | 'column' | undefined,
    style?: ViewStyle | undefined,
    gap?: number | undefined,
}

const Flex: FC<FlexProps> = ({
    justifyContent = 'flex-start', 
    alignItems = 'flex-start',
    alignSelf = 'auto',
    flexDirection = 'column',
    gap,
    children,
    style,
    ...rest
}) => {
    
    return (
        <View 
            style={[
                style !== undefined && style,
                // {justifyContent},
                {justifyContent},
                {alignItems},
                {alignSelf},
                {flexDirection},
                gap !== undefined && {gap}
            ]}
            {...rest}
        >
            {children}
        </View>
    )
}

export default Flex;