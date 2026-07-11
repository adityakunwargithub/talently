import { isAxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useRequireAuth } from '@/lib/auth';
import { candidateService } from '@/services/candidate';
import type { Candidate } from '@/types/models';

export default function CandidateProfileScreen() {
  const { candidateId } = useLocalSearchParams<{ candidateId: string }>();
  const router = useRouter();
  const checking = useRequireAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const load = useCallback(() => {
    if (!candidateId) return;
    candidateService
      .get(candidateId)
      .then(setCandidate)
      .catch((err) => {
        if (isAxiosError(err) && err.response?.status === 401) {
          router.replace('/(auth)/login');
          return;
        }
        setError('Could not load this candidate.');
      });
  }, [candidateId, router]);

  useEffect(() => {
    if (!checking) load();
  }, [checking, load]);

  async function handleAddNote(applicationId: string) {
    if (!candidateId || !noteText.trim()) return;
    setSavingNote(true);
    try {
      await candidateService.addNote(candidateId, { applicationId, text: noteText.trim() });
      setNoteText('');
      load();
    } catch {
      setError('Could not save note.');
    } finally {
      setSavingNote(false);
    }
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="small">{error}</ThemedText>
      </ThemedView>
    );
  }

  if (checking || !candidate) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator color={Colors.light.primary} />
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.container}>
        <Breadcrumbs trail={[{ label: 'Candidates', href: '/candidates' }, { label: candidate.name }]} />
        <ThemedText type="title">{candidate.name}</ThemedText>
        <ThemedText type="small">{candidate.email}</ThemedText>
        {candidate.phone && <ThemedText type="small">{candidate.phone}</ThemedText>}

        {candidate.resumeText && (
          <>
            <ThemedText type="subtitle">Resume</ThemedText>
            <ThemedView style={styles.fieldValue}>
              <ThemedText type="small">{candidate.resumeText}</ThemedText>
            </ThemedView>
          </>
        )}

        <ThemedText type="subtitle">Applications</ThemedText>
        {(candidate.applications ?? []).length === 0 && (
          <ThemedText type="small">No applications yet.</ThemedText>
        )}
        {(candidate.applications ?? []).map((application) => (
          <ThemedView key={application.id} style={styles.applicationCard}>
            <ThemedText type="smallBold">{application.job?.title ?? application.jobId}</ThemedText>
            <ThemedText type="small">
              {application.status}
              {application.score != null ? ` · score ${application.score}` : ''}
            </ThemedText>

            {(application.notes ?? []).map((note) => (
              <ThemedText key={note.id} type="small" style={styles.note}>
                • {note.text}
              </ThemedText>
            ))}

            <TextInput
              style={styles.input}
              placeholder="Add a note about this application"
              value={noteText}
              onChangeText={setNoteText}
            />
            <Button
              title={savingNote ? 'Saving…' : 'Add note'}
              size="sm"
              onPress={() => handleAddNote(application.id)}
              loading={savingNote}
              disabled={!noteText.trim()}
              style={styles.button}
            />
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, alignItems: 'stretch', gap: 8, padding: 24 },
  applicationCard: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    gap: 6,
    backgroundColor: Colors.light.background,
  },
  note: { paddingLeft: 8 },
  fieldValue: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    backgroundColor: Colors.light.background,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    backgroundColor: Colors.light.background,
  },
  button: { alignSelf: 'stretch', marginTop: 4 },
});
