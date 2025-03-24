import { Button, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Input from '@/components/Input'

const login = () => {

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.container}
        >
            <View style={styles.main}>
                <Input
                    placeholder='email'
                    value={email}
                    onChangeText={setEmail}
                />
                <Input
                    placeholder='password'
                    value={email}
                    onChangeText={setEmail}
                    isPasswordInput={true}
                />
                <Button
                    title='Login'
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