// react native components
import { StyleSheet, ViewStyle } from "react-native";
// skeleton components
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../utilities/colors";
import { FC } from "react";

const shimmerColorArray = [colors.skeleton1, colors.skeleton2, colors.skeleton1,];

const Shimmer = createShimmerPlaceholder(LinearGradient);

interface SkeletonProps {
    style?: ViewStyle | null,
    height: number,
	width: number,
	borderRadius?: number | undefined,
}

const Skeleton: FC<SkeletonProps> = ({style, width, height, borderRadius}) => {
  return (
    <Shimmer 
        height={height}
        width={width}
        shimmerColors={shimmerColorArray}
        duration={1500}
        style={[
            styles.container,
            style && style,
            height && {height},
            width && {width},
            borderRadius !== undefined && {borderRadius},
        ]}

    />
  )
}

export default Skeleton

const styles = StyleSheet.create({
    container: {
        borderRadius: 2.5,
        width: '100%',
        height: 50,
    }
})