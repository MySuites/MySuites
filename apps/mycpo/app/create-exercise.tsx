import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '../components/ui/ThemedView';
import { ThemedText } from '../components/ui/ThemedText';
import { useUITheme } from '@mycsuite/ui';
import { useWorkoutManager } from '../hooks/useWorkoutManager';

export default function CreateExerciseScreen() {
  const router = useRouter();
  const theme = useUITheme();
  const { createCustomExercise } = useWorkoutManager();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
        Alert.alert('Error', 'Please enter an exercise name');
        return;
    }

    setIsSubmitting(true);
    try {
        const { error } = await createCustomExercise(name, category);
        if (error) {
            Alert.alert('Error', 'Failed to create exercise');
            console.error(error);
        } else {
            // Success
            router.back();
        }
    } catch (e) {
        Alert.alert('Error', 'An unexpected error occurred');
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  const styles = makeStyles(theme);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ThemedText type="link">Cancel</ThemedText>
        </TouchableOpacity>
        <ThemedText type="subtitle">New Exercise</ThemedText>
        <TouchableOpacity onPress={handleCreate} disabled={isSubmitting} style={styles.headerButton}>
            <ThemedText type="link" style={{ fontWeight: 'bold', opacity: isSubmitting ? 0.5 : 1 }}>Save</ThemedText>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.formGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>Name</ThemedText>
            <TextInput 
                style={styles.input} 
                placeholder="e.g. Bench Press" 
                placeholderTextColor={theme.icon}
                value={name}
                onChangeText={setName}
                autoFocus
            />
        </View>

        <View style={styles.formGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>Category</ThemedText>
            {/* Simple text input for now, could be a picker */}
            <TextInput 
                style={styles.input} 
                placeholder="e.g. Chest, Legs, etc." 
                placeholderTextColor={theme.icon}
                value={category}
                onChangeText={setCategory}
            />
        </View>

      </KeyboardAvoidingView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  headerButton: {
      padding: 8,
  },
  content: {
      flex: 1,
      padding: 24,
  },
  formGroup: {
      marginBottom: 24,
  },
  label: {
      marginBottom: 8,
  },
  input: {
      backgroundColor: theme.surface,
      color: theme.text,
      padding: 16,
      borderRadius: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.border || 'transparent',
  }
});
