import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import QRCode from 'react-native-qrcode-svg';
import Flex from '@/components/Flex';
import { colors } from '@/utilities/colors';
import { WIDTH } from '@/utilities/dimensions';
import InterText from '@/components/InterText';
import { useAuthStore } from '@/stores/useAuthStore';
import moment from 'moment';

const AuthoriseStudent = () => {

    const user = useAuthStore(state => state.user);

    return (
        <Flex
            flex={1}
            backgroundColor={colors.white}
            justifyContent='center'
            alignItems='center'
            paddingTop={22}
            gap={30}
            paddingHorizontal={20}
        >
            <InterText>
                Students can change their device if they scan your auth code
            </InterText>
            <Flex
                flex={1}
                justifyContent='center'
                alignItems='center'
                paddingBottom={80}
            >
                <QRCode
                    size={WIDTH - 40}
                    value={`${process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL}?id=${user?.id}&created_at=${moment().toISOString(true)}`}
                />
            </Flex>    
        </Flex>
    )
}

export default AuthoriseStudent

const styles = StyleSheet.create({})