// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
    return (<>
        <Stack>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    </>
    );
}