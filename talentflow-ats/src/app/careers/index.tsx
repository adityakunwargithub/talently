import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BannerHeader } from '@/components/banner-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { getRole } from '@/lib/api';
import { logout } from '@/lib/auth';
import { jobService } from '@/services/job';
import type { Job } from '@/types/models';

export default function CareersListingScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCandidate, setIsCandidate] = useState(false);

  useEffect(() => {
    jobService
      .listPublic()
      .then(setJobs)
      .catch(() => setError('Could not load open roles. Is the backend running on localhost:4000?'))
      .finally(() => setLoading(false));
    getRole().then((role) => setIsCandidate(role === 'CANDIDATE'));
  }, []);

  async function handleLogout() {
    await logout();
    setIsCandidate(false);
  }

  return (
    <ThemedView style={styles.screen}>
      <BannerHeader showLogout={isCandidate} />
      <View style={styles.content}>
        <Breadcrumbs trail={[{ label: 'Careers' }]} />
        <ThemedView style={styles.container}>
          <ThemedText type="title">Open Roles</ThemedText>

        {loading && <ActivityIndicator color={Colors.light.primary} />}
        {error && <ThemedText type="small">{error}</ThemedText>}
        {!loading && !error && jobs.length === 0 && <ThemedText type="small">No open roles right now.</ThemedText>}

        <FlatList
          style={styles.list}
          data={jobs}
          keyExtractor={(job) => job.id}
          renderItem={({ item }) => (
            <Pressable style={styles.jobRow} onPress={() => router.push(`/careers/${item.id}`)}>
              <ThemedText type="smallBold">{item.title}</ThemedText>
              <ThemedText type="small">
                {item.department} · {item.location}
              </ThemedText>
            </Pressable>
          )}
        />

          {isCandidate ? (
            <ThemedView style={styles.candidateBar}>
              <Button title="Resume Builder" size="sm" onPress={() => router.push('/(candidate)/resume-builder')} />
              <Button title="Log out" size="sm" variant="outline" onPress={handleLogout} />
            </ThemedView>
          ) : (
            <Link href="/(auth)/login">
              <ThemedText type="linkPrimary">Recruiter login</ThemedText>
            </Link>
          )}
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1 },
  container: { flex: 1, alignItems: 'center', gap: 12, padding: 24 },
  list: { alignSelf: 'stretch' },
  jobRow: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: Colors.light.background,
  },
  candidateBar: { flexDirection: 'row', gap: 8 },
});
