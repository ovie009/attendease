// ./app/(app)/(tabs)/profile.tsx
import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';

const Profile = () => {
    const user = useAuthStore((state) => state.user);

    const handleLogout = async () => {
        // Optional: Show loading state
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        }
         // Auth listener in root layout will handle redirect
    };

    return (
        <View style={styles.container}>
        	<Text style={styles.title}>{user?.email ?? 'User'}!</Text>
			{/* Example Logout Button - Often placed in Settings or Profile */}
			<View style={{ marginTop: 20 }}>
				<Button title="Logout" onPress={handleLogout} color="red" />
			</View>
        </View>
    );
}

export default Profile;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, marginBottom: 10 },
});