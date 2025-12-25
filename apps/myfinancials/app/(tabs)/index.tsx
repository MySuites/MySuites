import { View, StyleSheet, Text } from 'react-native';
import { SharedButton } from '@mysuite/ui';

export default function HomeScreen() {
  return (
    <View className="bg-light dark:bg-dark" style={styles.container}>
      <Text className="text-3xl font-bold leading-8 text-light dark:text-dark">Tab One</Text>
      <SharedButton title="This is a v4 NativeWind button!" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
