import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Link, RelativePathString } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors } from '@/utilities/colors';
import Input from '@/components/Input';
import CustomButton from '@/components/CustomButton';
import InterText from '@/components/InterText';
import { useAppStore } from '@/stores/useAppStore';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const keyboardHeight = useAppStore(state => state.keyboardHeight);

	const {
		displayToast
	} = useAppStore.getState()

	const passwordRef = useRef<TextInput>(null);
	
	const isLoading = useAppStore(state => state.isLoading)
	const {
		setIsLoading,
	} = useAppStore.getState()

	const handleLogin = async (): Promise<void> => {
		try {
			setIsLoading(true);
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) throw error;
		} catch (error: any) {
			// Alert.alert('Login Error', error.message);
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false)
		}
	};

  return (
	<ScrollView
		contentContainerStyle={[styles.container, { paddingBottom: 50 }]}
		keyboardShouldPersistTaps={'handled'}
	>
		<View style={styles.form}>
			<InterText
				fontWeight={'semibold'}
				fontSize={20}
				lineHeight={23}
			>
				Login
			</InterText>
			<Input
				placeholder="Email"
				defaultValue={email}
				onChangeText={setEmail}
				keyboardType="email-address"
				returnKeyType='next'
				onSubmitEditing={() => passwordRef.current?.focus()}
			/>
			<Input
				ref={passwordRef}
				placeholder="Password"
				defaultValue={password}
				onChangeText={setPassword}
				isPasswordInput={true}
			/>
			<CustomButton
				text={"Login"}
				onPress={handleLogin}
				isLoading={isLoading}
				disabled={isLoading || !email || !password}
			/>
		</View>
		<Link href={"/(root)/(auth)/signup" as RelativePathString} style={styles.link}>Don't have an account? Sign Up</Link>
		<Link href={"/(root)/(auth)/forgotPassword" as RelativePathString} style={styles.link}>Forgot Password?</Link>
	</ScrollView>
  );
}

export default Login

const styles = StyleSheet.create({ // Add basic styles
    container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
	form: {
		display: 'flex',
		// justifyContent: 'flex-start',
		// alignItems: 'flex-start',
		gap: 20,
	},
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
    link: { marginTop: 15, textAlign: 'center', color: colors.primary }
});