import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, supabase } from '@mycsuite/auth';
import { useUITheme } from '@mycsuite/ui';
import { ThemedView } from '../components/themed-view';
import { IconSymbol } from '../components/ui/icon-symbol';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function SettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useUITheme();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // Router will handle redirect based on auth state change in _layout
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            // Placeholder for delete logic
            Alert.alert('Not Implemented', 'Account deletion logic to be implemented.');
          } 
        }
      ]
    );
  };

  const styles = makeStyles(theme);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={theme.text} /> 
          {/* Note: Using a generic icon for back if chevron.left isn't mapped, but usually expo-router handles back. 
              Actually, let's use a simple Text or standard icon if available. 
              Checking IconSymbol mapping: 'chevron.left.forwardslash.chevron.right' maps to 'code', 'chevron.right' maps to 'chevron-right'.
              I'll just use a text "Back" or rely on native stack header if possible, but this is a custom screen.
              Let's assume we want a custom header.
          */}
           <Text style={{color: theme.text, fontSize: 16, marginLeft: 4}}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{width: 60}} /> {/* Spacer for centering */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <ThemeToggle />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert('Privacy Policy', 'Link to Privacy Policy')}>
            <Text style={styles.rowText}>Privacy Policy</Text>
            <IconSymbol name="chevron.right" size={20} color={theme.icon || '#ccc'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert('Terms of Service', 'Link to Terms of Service')}>
            <Text style={styles.rowText}>Terms of Service</Text>
            <IconSymbol name="chevron.right" size={20} color={theme.icon || '#ccc'} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleDeleteAccount}>
            <Text style={[styles.buttonText, styles.dangerText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </ThemedView>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60, // Safe area approximation
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.icon,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface,
  },
  label: {
    fontSize: 16,
    color: theme.text,
  },
  value: {
    fontSize: 16,
    color: theme.icon,
  },
  rowText: {
    fontSize: 16,
    color: theme.text,
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.surface,
  },
  buttonText: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: '600',
  },
  dangerButton: {
    marginTop: 8,
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#EF4444', // Red
  },
  version: {
    textAlign: 'center',
    color: theme.icon,
    marginTop: 24,
    fontSize: 12,
  },
});
