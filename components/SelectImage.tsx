import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { colors } from '../utilities/colors'
// icons
import InterText from './InterText';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
// icons
import { useAppStore } from '../stores/useAppStore';
import { WIDTH } from '../utilities/dimensions';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface SelectImageProps {
    title: string | undefined;
    subtitle: string | undefined;
    image?: ImagePicker.ImagePickerAsset | null | undefined,
    onImageSelected: (image: any) => void,
}

const SelectImage: FC<SelectImageProps> = ({image, onImageSelected, title, subtitle}) => {

    // global states
    const {
        displayToast,
    } = useAppStore.getState();

    const pickDocument = async (): Promise<void> => {
        try {
            // No permissions request is necessary for launching the image library
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 1,
                allowsMultipleSelection: false
            });
        
            if (!result.canceled) {
                onImageSelected(result?.assets[0])
            }
        } catch (error: any) {
            displayToast('ERROR', error?.message);   
        }
    };

    const handleDeleteDocument = () => {
        onImageSelected(null)
    }

    if (image) return (
        <View style={styles.container}>
            <View style={[styles.button]}>
                <Image
                    style={styles.image}
                    source={{ uri: image?.uri }}
                    contentFit='cover'
                />
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDocument()}
                >
                    <AntDesign name="delete" size={14} color={colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[
                    styles.button,
                ]}
                onPress={pickDocument}
            >
                <MaterialCommunityIcons     
                    name="file-image-plus-outline" 
                    size={40} 
                    
                    color={colors.subtext} 
                />
                <View style={styles.textWrapper}>
                    <InterText
                        fontWeight={'medium'}
                        lineHeight={18.2}
                        textAlign={'center'}
                    >
                        {title}
                    </InterText>
                    <InterText
                        fontSize={11}
                        lineHeight={13}
                        textAlign={'center'}
                        color={colors.subtext}
                    >
                        {subtitle}
                    </InterText>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default SelectImage

const styles = StyleSheet.create({
    container: {
        width: WIDTH - 40,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 8,
    },
    button: {
        width: '100%',
        height: 120,
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
		borderColor: colors.inputBorder,
        // borderStyle: 'dashed',
        overflow: 'hidden',
    },
    textWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        gap: 4,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
        position: 'relative',
    },
    deleteButton: {
        width: 24,
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: colors.overlay,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 8,
        right: 9,
    },
})