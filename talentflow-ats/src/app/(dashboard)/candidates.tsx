import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BannerHeader } from '@/components/banner-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Colors } from '@/constants/theme';
import { candidateService } from '@/services/candidate';
import type { Candidate } from '@/types/models';

export default function DashboardCandidatesScreen() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    candidateService
      .list()
      .then(setCandidates)
      .catch((err) => {
        if (isAxiosError(err) && err.response?.status === 401) {
          router.replace('/(auth)/login');
          return;
        }
        setError('Could not load candidates.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <ThemedView style={styles.container}>
      <BannerHeader />
      <View style={styles.content}>
        <Breadcrumbs trail={[{ label: 'Candidates' }]} />
        <ThemedText type="title">Candidates</ThemedText>

      {loading && <ActivityIndicator color={Colors.light.primary} />}
      {error && <ThemedText type="small">{error}</ThemedText>}
      {!loading && !error && candidates.length === 0 && <ThemedText type="small">No candidates yet.</ThemedText>}

        <FlatList
          style={styles.list}
          data={candidates}
          keyExtractor={(candidate) => candidate.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => router.push({ pathname: '/candidate/[candidateId]', params: { candidateId: item.id } })}
            >
              <ThemedText type="smallBold">{item.name}</ThemedText>
              <ThemedText type="small">{item.email}</ThemedText>
            </Pressable>
          )}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0 },
  content: { flex: 1, alignItems: 'center', gap: 12, padding: 24 },
  list: { alignSelf: 'stretch' },
  row: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: Colors.light.background,
  },
});
