import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function IndexScreen() {

  // Example of how logging in HERE could set isFirstLaunch to false
  // This is often handled by the auth listener in _layout, but can be explicit
  // const handleProceed = () => {
  //   // If user chooses Login/Signup, we know it's no longer the "very first" launch experience
  //   // Even if they don't log in successfully yet.
  //   // Note: The auth listener in RootLayout already handles this on SIGNED_IN.
  //   // setIsFirstLaunch(false); // You might or might not need this explicit call depending on flow.
  //   // Let's navigate instead, the listener will handle the flag on successful sign-in.
  //    router.push('/(auth)/login');
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text>This is the initial startup screen.</Text>
      <Link href="/(auth)/login" asChild>
         <Button title="Go to Login" />
      </Link>
      <View style={{ marginVertical: 10 }} />
      <Link href="/(auth)/signup" asChild>
        <Button title="Go to Sign Up" />
      </Link>
       {/* Example alternative button that sets the flag */}
       {/* <Button title="Proceed to Login (Sets Flag)" onPress={handleProceed} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, marginBottom: 20 }
});