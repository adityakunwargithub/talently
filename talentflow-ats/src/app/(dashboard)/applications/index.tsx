import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BannerHeader } from '@/components/banner-header';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { applicationService } from '@/services/application';
import type { Application, ApplicationStatus } from '@/types/models';

const COLUMNS: ApplicationStatus[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
const FORWARD_ORDER: ApplicationStatus[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'];

const columnBackgrounds: { [key in ApplicationStatus]: string } = {
  APPLIED: '#f3e8ff',
  SCREENING: '#dbeafe',
  INTERVIEW: '#dcfce7',
  OFFER: '#fef3c7',
  HIRED: '#fce7f3',
  REJECTED: '#fee2e2',
};

function getColumnStyle(status: ApplicationStatus) {
  return {
    backgroundColor: columnBackgrounds[status],
    borderRadius: 8,
  };
}

function nextStatus(status: ApplicationStatus): ApplicationStatus | null {
  const index = FORWARD_ORDER.indexOf(status);
  if (index === -1 || index === FORWARD_ORDER.length - 1) return null;
  return FORWARD_ORDER[index + 1];
}

export default function DashboardApplicationsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    applicationService
      .list()
      .then(setApplications)
      .catch((err) => {
        if (isAxiosError(err) && err.response?.status === 401) {
          router.replace('/(auth)/login');
          return;
        }
        setError('Could not load applications.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMove(application: Application, status: ApplicationStatus) {
    setBusyId(application.id);
    try {
      const updated = await applicationService.updateStatus(application.id, { status });
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch {
      setError('Could not update status.');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={Colors.light.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <BannerHeader />
      {error && <ThemedText type="small" style={styles.error}>{error}</ThemedText>}
      {applications.length === 0 && <ThemedText type="small" style={styles.empty}>No applications yet.</ThemedText>}

      <View style={styles.boardWrapper}>
        <ScrollView horizontal style={styles.board} contentContainerStyle={styles.boardContent} showsHorizontalScrollIndicator>
          {COLUMNS.map((status) => (
            <View key={status} style={[styles.columnContainer, getColumnStyle(status)]}>
              <ThemedText type="smallBold" style={styles.columnHeader}>
                {status} ({applications.filter((a) => a.status === status).length})
              </ThemedText>
              <ScrollView
                style={styles.column}
                contentContainerStyle={styles.columnContent}
                scrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {applications
                  .filter((application) => application.status === status)
                  .map((application) => {
                    const forward = nextStatus(application.status);
                    const busy = busyId === application.id;

                    return (
                      <ThemedView key={application.id} style={styles.card}>
                        <ThemedText type="smallBold">{application.candidate?.name ?? application.candidateId}</ThemedText>
                        <ThemedText type="small">{application.job?.title ?? application.jobId}</ThemedText>
                        <ThemedText type="small">{application.score != null ? `Score: ${application.score}` : 'Not screened'}</ThemedText>

                        <Button
                          title="Screen"
                          size="sm"
                          variant="outline"
                          onPress={() =>
                            router.push({
                              pathname: '/(dashboard)/applications/[applicationId]',
                              params: { applicationId: application.id },
                            })
                          }
                          disabled={busy}
                          style={styles.cardButton}
                        />

                        {forward && (
                          <Button
                            title={`Move to ${forward} →`}
                            size="sm"
                            onPress={() => handleMove(application, forward)}
                            disabled={busy}
                            style={styles.cardButton}
                          />
                        )}

                        {status !== 'REJECTED' && status !== 'HIRED' && (
                          <Button
                            title="Reject"
                            size="sm"
                            variant="outline"
                            onPress={() => handleMove(application, 'REJECTED')}
                            disabled={busy}
                            style={styles.cardButton}
                          />
                        )}
                      </ThemedView>
                    );
                  })}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 0, padding: 0, paddingTop: 0 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  boardWrapper: { flex: 1 },
  board: { flex: 1 },
  boardContent: { gap: 12, paddingHorizontal: 16, paddingBottom: 24 },
  columnContainer: {
    width: 220,
    flex: 1,
    padding: 12,
    marginHorizontal: 0,
  },
  column: {
    width: '100%',
    flex: 1,
    maxHeight: 500,
  },
  columnContent: { gap: 8, paddingVertical: 0 },
  columnHeader: { paddingBottom: 8, marginBottom: 12, fontWeight: '600' },
  error: { paddingHorizontal: 16, paddingTop: 12, color: '#dc2626' },
  empty: { paddingHorizontal: 16, paddingTop: 12 },
  card: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: 10,
    gap: 4,
    backgroundColor: Colors.light.background,
    marginBottom: 8,
  },
  cardButton: { alignSelf: 'stretch', marginTop: 4 },
});
