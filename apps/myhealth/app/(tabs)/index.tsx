import { ThemedView } from '../../components/ui/ThemedView';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

export default function HomeScreen() {
  return (
    <ThemedView className="flex-1 p-4">
          <ScreenHeader title="Home" />
    </ThemedView>
  );
}