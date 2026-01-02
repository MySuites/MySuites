import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth, supabase } from '@mysuite/auth';
import { useUITheme, ThemeToggle, IconSymbol, useToast } from '@mysuite/ui';
import { useThemePreference } from '../../providers/AppThemeProvider';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BackButton } from '../../components/ui/BackButton';
import { ProfileButton } from '../../components/ui/ProfileButton';
import { BodyWeightCard } from '../../components/profile/BodyWeightCard';
import { WeightLogModal } from '../../components/profile/WeightLogModal';

type DateRange = 'Week' | 'Month' | '6Month' | 'Year';

export default function SettingsScreen() {
  const { user } = useAuth();
  const theme = useUITheme();
  const { preference, setPreference } = useThemePreference();
  const { showToast } = useToast();

  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [weightHistory, setWeightHistory] = useState<{ value: number; label: string; date: string }[]>([]);
  const [rangeAverage, setRangeAverage] = useState<number | null>(null);
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<DateRange>('Week');

  const fetchLatestWeight = useCallback(async () => {
    if (!user) return;
    
    // Fetch the most recent weight entry
    const { data: latestData, error: latestError } = await supabase
      .from('body_measurements')
      .select('weight')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
        console.log('Error fetching weight:', latestError);
    } else if (latestData) {
        setLatestWeight(latestData.weight);
    }
  }, [user]);

  // Helper to format date label
  const formatDateLabel = (dateStr: string, range: DateRange) => {
      const d = new Date(dateStr);
      const utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      
      if (range === 'Week' || range === 'Month' || range === '6Month') return utcDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (range === 'Year') return utcDate.toLocaleDateString(undefined, { month: 'short' });
      return utcDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const fetchWeightHistory = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    // 1. Generate Spine (Target Dates)
    let spine: string[] = [];
    const now = new Date();
    // Get "Today" as YYYY-MM-DD string (Local)
    const todayY = now.getFullYear();
    const todayM = String(now.getMonth() + 1).padStart(2, '0');
    const todayD = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayY}-${todayM}-${todayD}`;

    if (selectedRange === 'Week') {
        const d = new Date(todayStr); // UTC Mid
        for (let i = 6; i >= 0; i--) {
            const temp = new Date(d);
            temp.setUTCDate(d.getUTCDate() - i);
            spine.push(temp.toISOString().split('T')[0]);
        }
    } else if (selectedRange === 'Month') {
        const d = new Date(todayStr);
        for (let i = 29; i >= 0; i--) {
            const temp = new Date(d);
            temp.setUTCDate(d.getUTCDate() - i);
            spine.push(temp.toISOString().split('T')[0]);
        }
    } else if (selectedRange === '6Month') {
        const lastWeekStart = new Date(todayStr);
        lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 6);
        
        for (let i = 25; i >= 0; i--) {
             const temp = new Date(lastWeekStart);
             temp.setUTCDate(lastWeekStart.getUTCDate() - (i * 7));
             spine.push(temp.toISOString().split('T')[0]); 
        }
    } else if (selectedRange === 'Year') {
        const currentMonthStartStr = `${todayY}-${todayM}-01`;
        const d = new Date(currentMonthStartStr);
        for (let i = 11; i >= 0; i--) {
             const temp = new Date(d);
             temp.setUTCMonth(d.getUTCMonth() - i);
             spine.push(temp.toISOString().split('T')[0].substring(0, 7) + '-01'); 
        }
    }

    // 2. Fetch Data
    const { data: rawData, error } = await supabase
      .from('body_measurements')
      .select('weight, date')
      .eq('user_id', user.id)
      .gte('date', spine[0])
      .order('date', { ascending: true });
      
    if (error) {
        console.log('Error fetching weight history:', error);
        showToast({ message: "Failed to load weight history", type: 'error' });
        setIsLoading(false);
        return;
    }

    if (!rawData || rawData.length === 0) {
        setWeightHistory([]);
        setRangeAverage(null);
        return;
    }

    // Calculate true overall average from all individual logs in the range
    const totalSum = rawData.reduce((sum, item) => sum + parseFloat(item.weight.toString()), 0);
    setRangeAverage(Math.round((totalSum / rawData.length) * 10) / 10);

    // 3. Process Data (Aggregation)
    const groups: Record<string, { total: number, count: number }> = {};
    rawData.forEach(item => {
        let key = '';
        if (selectedRange === 'Week' || selectedRange === 'Month') {
            key = item.date;
        } else if (selectedRange === '6Month') {
            const itemDate = new Date(item.date).getTime();
            for (let i = spine.length - 1; i >= 0; i--) {
                const spineDate = new Date(spine[i]).getTime();
                if (itemDate >= spineDate) {
                    key = spine[i];
                    break;
                }
            }
        } else if (selectedRange === 'Year') {
            key = item.date.substring(0, 7) + '-01';
        }

        if (key && spine.includes(key)) {
            if (!groups[key]) groups[key] = { total: 0, count: 0 };
            groups[key].total += parseFloat(item.weight.toString());
            groups[key].count += 1;
        }
    });
    
    // 4. Map existing data to their positions in the spine.
    const result: { value: number; label: string; date: string; spineIndex: number }[] = [];
    
    spine.forEach((date, index) => {
        if (groups[date]) {
             let label = '';
             const len = spine.length;
             const indices = [
                0,
                Math.floor((len - 1) * 0.25),
                Math.floor((len - 1) * 0.5),
                Math.floor((len - 1) * 0.75),
                len - 1
             ];
             
             if (indices.includes(index)) {
                 label = formatDateLabel(date, selectedRange);
             }

             result.push({
                 value: parseFloat((groups[date].total / groups[date].count).toFixed(2)),
                 label: label,
                 date: date,
                 spineIndex: index
             });
        }
    });

    setWeightHistory(result);
    setIsLoading(false);
  }, [user, selectedRange, showToast]);

  useEffect(() => {
    if (user) {
        fetchLatestWeight();
    }
  }, [user, fetchLatestWeight]);

  useEffect(() => {
      if (user) {
          fetchWeightHistory().catch(err => console.error(err));
      }
  }, [user, fetchWeightHistory]);

  const handleSaveWeight = async (weight: number, date: Date) => {
    if (!user) return;

    const dateStr = date.toISOString().split('T')[0];
    const { data: existingData, error: fetchError } = await supabase
        .from('body_measurements')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .maybeSingle();

    if (fetchError) {
        console.log('Error checking existing weight:', fetchError);
        return;
    }

    let error;
    if (existingData) {
        const { error: updateError } = await supabase
            .from('body_measurements')
            .update({ weight: weight })
            .eq('id', existingData.id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from('body_measurements')
            .insert({
                user_id: user.id,
                weight: weight,
                date: dateStr,
            });
        error = insertError;
    }

    if (error) {
        console.log('Error saving weight:', error);
    } else {
        fetchLatestWeight();
        fetchWeightHistory();
    }
  };

  return (
    <View className="flex-1 bg-light dark:bg-dark">
      <ScreenHeader 
        title="Settings" 
        leftAction={<BackButton />} 
        rightAction={<ProfileButton />}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 140 }}>
        
        <View className="mb-6">
             <BodyWeightCard 
                weight={latestWeight} 
                history={weightHistory}
                rangeAverage={rangeAverage}
                onLogWeight={() => setIsWeightModalVisible(true)} 
                selectedRange={selectedRange}
                onRangeChange={setSelectedRange}
                primaryColor={theme.primary}
                textColor={theme.textMuted}
                isLoading={isLoading}
             />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase">Appearance</Text>
          <ThemeToggle preference={preference} setPreference={setPreference} />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase">Legal</Text>
          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-light dark:border-dark" onPress={() => Alert.alert('Privacy Policy', 'Link to Privacy Policy')}>
            <Text className="text-base text-light dark:text-dark">Privacy Policy</Text>
            <IconSymbol name="chevron.right" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-light dark:border-dark" onPress={() => Alert.alert('Terms of Service', 'Link to Terms of Service')}>
            <Text className="text-base text-light dark:text-dark">Terms of Service</Text>
            <IconSymbol name="chevron.right" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        <Text className="text-center text-xs text-gray-500 mt-6">Version 1.0.0</Text>
      </ScrollView>

      <WeightLogModal
        visible={isWeightModalVisible}
        onClose={() => setIsWeightModalVisible(false)}
        onSave={handleSaveWeight}
      />
    </View>
  );
}
