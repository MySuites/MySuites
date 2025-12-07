import { useState, useEffect } from 'react';
import { TextInput, Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useAuth, supabase } from '@mycsuite/auth';
import { SharedButton, useUITheme } from '@mycsuite/ui';
import { ThemedView } from '../../components/themed-view';
import { useRouter } from 'expo-router';
import { IconSymbol } from '../../components/ui/icon-symbol';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) {
      // Fetch existing profile data when the component mounts
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) console.log('Error fetching profile:', error);
          if (data) {
            setUsername(data.username);
            setFullName(data.full_name);
          }
        });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    });

    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // The protected routing in _layout.tsx will handle the redirect
  };
  
  const theme = useUITheme();
  const bg = theme.background;
  const text = theme.text;
  const border = theme.surface;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: text }]}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <IconSymbol name="gearshape.fill" size={24} color={text} />
        </TouchableOpacity>
      </View>
      <TextInput
        style={[styles.input, { backgroundColor: bg, borderColor: border, color: text }]}
        placeholder="Username"
        placeholderTextColor={'#9CA3AF'}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={[styles.input, { backgroundColor: bg, borderColor: border, color: text }]}
        placeholder="Full Name"
        placeholderTextColor={'#9CA3AF'}
        value={fullName}
        onChangeText={setFullName}
      />
      <SharedButton title="Update Profile" onPress={handleUpdateProfile} />
      <SharedButton title="Sign Out" onPress={handleSignOut} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40, // Adjust for safe area if needed, or use SafeAreaView
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  input: {
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
});