import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { api } from '@/lib/api';

interface FunnelData {
  stage: string;
  count: number;
}

export function FunnelChart() {
  const [data, setData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunnelData();
  }, []);

  async function fetchFunnelData() {
    try {
      setLoading(true);
      const response = await api.get('/analytics/pipeline-funnel');
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch funnel data:', err);
      setError('Could not load funnel data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading pipeline funnel...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">{error}</ThemedText>
      </ThemedView>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count || 0), 1);

  const stageColors: { [key: string]: string } = {
    'APPLIED': '#8b5cf6',
    'SCREENING': '#ec4899',
    'INTERVIEW': '#f59e0b',
    'OFFER': '#10b981',
    'HIRED': '#06b6d4',
    'REJECTED': '#6b7280',
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Pipeline Funnel</ThemedText>
      <ScrollView style={styles.funnel}>
        {data.map((item, idx) => {
          const widthPercent = ((item.count / maxCount) * 100).toFixed(0);
          const barColor = stageColors[item.stage] || '#6366f1';
          return (
            <View key={idx} style={styles.funnelStage}>
              <View
                style={[
                  styles.funnelBar,
                  { width: `${widthPercent}%`, backgroundColor: barColor },
                ]}
              >
                <ThemedText style={styles.funnelText} numberOfLines={1}>
                  {item.stage}: {item.count}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  funnel: {
    gap: 12,
  },
  funnelStage: {
    marginVertical: 8,
  },
  funnelBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    minHeight: 40,
    justifyContent: 'center',
  },
  funnelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
