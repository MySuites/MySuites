import { Link } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';


export default function ModalScreen() {
  return (
    <View className="bg-light dark:bg-dark" style={styles.container}>
      <Text className="text-3xl font-bold leading-8 text-light dark:text-dark">This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text className="text-base leading-[30px] text-[#0a7ea4]">Go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
