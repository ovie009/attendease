import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Link, RelativePathString } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      // Navigation is handled by the root layout's auth state listener
      // console.log('Login successful');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
      <Link href={"/(root)/(auth)/signup" as RelativePathString} style={styles.link}>Don't have an account? Sign Up</Link>
      <Link href={"/(root)/(auth)/forgotPassword" as RelativePathString} style={styles.link}>Forgot Password?</Link>
    </View>
  );
}

const styles = StyleSheet.create({ // Add basic styles
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
    link: { marginTop: 15, textAlign: 'center', color: 'blue' }
});