import { ScrollView, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { BannerHeader } from '@/components/banner-header';
import { FunnelChart } from '@/components/dashboard/funnel-chart';
import { WorkloadSummary } from '@/components/dashboard/workload-summary';

export default function DashboardOverviewScreen() {
  return (
    <ThemedView style={styles.screen}>
      <BannerHeader />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <WorkloadSummary />
        <FunnelChart />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  container: { gap: 16, padding: 16 },
});
