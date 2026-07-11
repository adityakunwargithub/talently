import { isAxiosError } from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BannerHeader } from '@/components/banner-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { jobService } from '@/services/job';
import type { Job } from '@/types/models';

export default function DashboardJobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      jobService
        .list()
        .then(setJobs)
        .catch((err) => {
          if (isAxiosError(err) && err.response?.status === 401) {
            router.replace('/(auth)/login');
            return;
          }
          setError('Could not load jobs.');
        })
        .finally(() => setLoading(false));
    }, [router]),
  );

  return (
    <ThemedView style={styles.container}>
      <BannerHeader />
      <View style={styles.content}>
        <Breadcrumbs trail={[{ label: 'Jobs' }]} />
        <ThemedView style={styles.header}>
          <Button title="+ New job" size="sm" onPress={() => router.push('/(dashboard)/jobs/new')} />
        </ThemedView>

      {loading && <ActivityIndicator color={Colors.light.primary} />}
      {error && <ThemedText type="small">{error}</ThemedText>}
      {!loading && !error && jobs.length === 0 && <ThemedText type="small">No job postings yet.</ThemedText>}

        <FlatList
          style={styles.list}
          data={jobs}
          keyExtractor={(job) => job.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.jobRow}
              onPress={() => router.push({ pathname: '/(dashboard)/jobs/[jobId]', params: { jobId: item.id } })}
            >
              <ThemedText type="smallBold">{item.title}</ThemedText>
              <ThemedText type="small">
                {item.status} · {item.department} · {item.location}
              </ThemedText>
            </Pressable>
          )}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0 },
  content: { flex: 1, gap: 12, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  list: { alignSelf: 'stretch' },
  jobRow: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: Colors.light.background,
  },
});
