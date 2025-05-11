import { StyleSheet, View, ViewStyle } from 'react-native'
// expo image
import { Image, ImageStyle } from 'expo-image';
// components
import SvgInterText from './SvgInterText';
import { colors } from '../utilities/colors';
import handleUpload from '../api/handleStorage';
import { FC, ReactNode, useEffect, useState } from 'react';
import Skeleton from './Skeleton';
import { FontWeight } from '@/types/general';

interface AvatarProps {
    imageUri?: string | null | undefined,
    imageUriLocal?: string | undefined,
    name: string,
    diameter?: number | undefined,
    width?: number | undefined,
    height?: number | undefined,
    borderRadius?: number | undefined,
    removeBorderRadius?: boolean | undefined,
    fontWeight?: FontWeight | undefined,
    fontSize?: number | undefined,
    color?: string | undefined,
    backgroundColor?: string | undefined,
    contentContainerStyle?: ViewStyle | undefined,
    style?: ImageStyle | undefined,
    ImageComponent?: ReactNode | undefined
}

const Avatar: FC<AvatarProps> = ({imageUri, imageUriLocal, name, diameter, width, height, borderRadius, removeBorderRadius, fontWeight, fontSize, color, backgroundColor, contentContainerStyle, style, ImageComponent}) => {
    // get only first two initials
    const getInitials = (): string => {
        if (!name) return '';

        const words = name.toUpperCase()?.split(' ');
        if (words?.length >= 2) {
            return words[0]?.charAt(0) + words[1]?.charAt(0);
        } else if (words?.length === 1) {
            return words[0]?.charAt(0);
        } else {
            return '';
        }
    };

    const [uri, setUri] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState<boolean>(false);

    useEffect(() => {
        const downloadImage = async () => {
            try {
                if (!imageUri) {
                    setImageLoading(false);
                    return;
                }
                if (imageUriLocal) {
                    setImageLoading(false);
                    return;
                }
                setImageLoading(true);
                
                // Download file
                const response = await handleUpload.downloadFile({
                    uri: imageUri,
                    bucketName: 'profile',
                    base64: true,
                });
                
                setUri(response.uri);

            } catch (error: any) {
                console.log('Error in image download:', error.message);
            }
        };
    
        downloadImage();
    }, [imageUri, imageUriLocal]);

    useEffect(() => {
        if (uri || imageUriLocal) {
            setImageLoading(false)
        }
    }, [uri, imageUriLocal]);

    

    return (
        <View 
            style={[
                styles.container,
                {backgroundColor: !imageUri ? colors.secondary : colors.skeleton1},
                diameter !== undefined && {
                    borderRadius: diameter / 2,
                    width: diameter, 
                    height: diameter,
                },
                width !== undefined && {width},
                height !== undefined && {height},
                borderRadius !== undefined && {borderRadius},
                removeBorderRadius && styles.noRadius,
                backgroundColor && {backgroundColor},
                contentContainerStyle && contentContainerStyle,
            ]}
        >
            {ImageComponent && ImageComponent}
            {!ImageComponent && !imageUri && !imageUriLocal && (
                <SvgInterText
                    fontSize={(() => {
                        if (fontSize) return fontSize;
                        if (!diameter) return 16;
                        return (1 + (diameter - 40)/40) * 16;
                    })()}
                    fontWeight={fontWeight || 'semibold'}
                    color={color || colors.primary}
                    width={width || diameter || 40}
                    height={height || diameter || 40}
                >
                    {getInitials()}
                </SvgInterText>
            )}
            {!ImageComponent && (imageUri || imageUriLocal) && (
                <Image
                    source={(() => {
                        if (imageUriLocal) return {uri: imageUriLocal};
                        if (uri) return {uri};
                        return {uri: imageUri};
                    })()}
                    style={[
                        styles.image,
                        diameter !== undefined && {
                            borderRadius: diameter / 2,
                            width: diameter, 
                            height: diameter,
                        },
                        width !== undefined && {width},
                        height !== undefined && {height},
                        borderRadius !== undefined && {borderRadius},
                        removeBorderRadius && styles.noRadius,
                        style && style,
                    ]}
                />
            )}

            {imageLoading && (
                <Skeleton
                    width={(() => {
                        if (width) return width;
                        if (diameter) return diameter;
                        return 40;
                    })()}
                    height={(() => {
                        if (height) return height;
                        if (diameter) return diameter;
                        return 40;
                    })()}
                    borderRadius={(() => {
                        if (removeBorderRadius) return 0;
                        if (borderRadius) return borderRadius;
                        if (diameter) return diameter / 2;
                        return 20;
                    })()}
                    style={{position: 'absolute', zIndex: 1}}
                />
            )}
        </View>
    )
}

export default Avatar

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        width: 40,
        height: 40,
        backgroundColor: colors.secondary,
        overflow: 'hidden',
        position: 'relative'
    },
    noRadius: {
        borderRadius: 0,
    },
    image: {
        borderRadius: 20,
        width: 40,
        height: 40,
    }
})