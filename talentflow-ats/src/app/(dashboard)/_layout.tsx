import { Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { useRequireAuth } from '@/lib/auth';

export default function DashboardLayout() {
  const checking = useRequireAuth();

  if (checking) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Overview', headerShown: false }} />
      <Tabs.Screen name="jobs" options={{ title: 'Jobs', headerShown: false }} />
      <Tabs.Screen name="candidates" options={{ title: 'Candidates', headerShown: false }} />
      <Tabs.Screen name="applications" options={{ title: 'Applications', headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
