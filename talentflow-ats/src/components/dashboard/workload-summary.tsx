import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { api } from '@/lib/api';

interface WorkloadData {
  pendingScreening: number;
  recentApplications: number;
  averageTimeToHire: number;
  activeJobs: number;
}

export function WorkloadSummary() {
  const [data, setData] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkloadData();
  }, []);

  async function fetchWorkloadData() {
    try {
      setLoading(true);
      const response = await api.get('/analytics/workload-summary');
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch workload data:', err);
      setError('Could not load workload summary');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading workload summary...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !data) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">{error || 'No data available'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Workload Summary</ThemedText>
      <View style={styles.grid}>
        <View style={styles.card}>
          <ThemedText style={[styles.cardValue, styles.colorPurple]}>{data.pendingScreening}</ThemedText>
          <ThemedText style={styles.cardLabel}>Pending Screening</ThemedText>
        </View>
        <View style={styles.card}>
          <ThemedText style={[styles.cardValue, styles.colorGreen]}>{data.recentApplications}</ThemedText>
          <ThemedText style={styles.cardLabel}>Recent Applications</ThemedText>
        </View>
        <View style={styles.card}>
          <ThemedText style={[styles.cardValue, styles.colorOrange]}>{data.averageTimeToHire}</ThemedText>
          <ThemedText style={styles.cardLabel}>Avg Time to Hire (days)</ThemedText>
        </View>
        <View style={styles.card}>
          <ThemedText style={[styles.cardValue, styles.colorTeal]}>{data.activeJobs}</ThemedText>
          <ThemedText style={styles.cardLabel}>Active Jobs</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  colorPurple: {
    color: '#7c3aed',
  },
  colorGreen: {
    color: '#10b981',
  },
  colorOrange: {
    color: '#f59e0b',
  },
  colorTeal: {
    color: '#14b8a6',
  },
  cardLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
