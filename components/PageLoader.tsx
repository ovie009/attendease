import { ActivityIndicator, StyleSheet, View } from 'react-native'
import React, { FC } from 'react'
import { colors } from '../utilities/colors'

interface PageLoaderProps {
    isLoading: boolean;
}

const PageLoader: FC<PageLoaderProps> = ({isLoading}) => {

    if (!isLoading) {
        return <></>;
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator
                size='large'
                color={colors.white}
            />
        </View>
    )
}

export default PageLoader

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        display: 'flex',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 5000000,
        backgroundColor: colors.overlay,
    }
})