import { ActivityIndicator, Button, ScrollView, StyleSheet, View } from 'react-native'
import React from 'react'
import Input from '@/components/Input'
import handleAuth from '@/api/handleAuth';
import { useAuthStore } from '@/stores/useAuthStore';

const login = () => {

    const [email, setEmail] = React.useState('aheroboovie@yopmail.com');
    const [password, setPassword] = React.useState('Qwerty@12345');
    const [isLoading, setIsLoading] = React.useState(false);

    const session = useAuthStore(state => state.session);
    console.log("🚀 ~ login ~ session:", session)


    const handleLogin = async (): Promise<void> => {
        try {
            setIsLoading(true);
            await handleAuth.login({
                email,
                password
            });

        } catch (error) {
            console.log('error: ', error)
        } finally {
            setIsLoading(false);
        }
    }
    

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.container}
        >
            <View style={styles.main}>
                {isLoading && <ActivityIndicator color={'black'} />}
                <Input
                    placeholder='email'
                    value={email}
                    onChangeText={setEmail}
                />
                <Input
                    placeholder='password'
                    value={password}
                    onChangeText={setPassword}
                    isPasswordInput={false}
                />
                <Button
                    title='Login'
                    onPress={handleLogin}
                />
            </View>
        </ScrollView>
    )
}

export default login

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        flexGrow: 1,
    },
    main: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        paddingBottom: 50,
    }
})