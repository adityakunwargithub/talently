import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { jobService } from '@/services/job';
import type { JobStatus } from '@/types/models';

const STATUSES: JobStatus[] = ['DRAFT', 'PUBLISHED', 'CLOSED'];

export default function EditJobScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [status, setStatus] = useState<JobStatus>('DRAFT');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    jobService
      .get(jobId)
      .then((job) => {
        setTitle(job.title);
        setDescription(job.description);
        setRequirements(job.requirements);
        setLocation(job.location);
        setDepartment(job.department);
        setEmploymentType(job.employmentType);
        setStatus(job.status);
      })
      .catch(() => setLoadError('Could not load this job.'))
      .finally(() => setLoading(false));
  }, [jobId]);

  async function handleSubmit() {
    if (!jobId) return;
    setError(null);
    setSubmitting(true);
    try {
      await jobService.update(jobId, { title, description, requirements, location, department, employmentType, status });
      router.replace('/(dashboard)/jobs');
    } catch {
      setError('Could not save changes.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!jobId) return;
    setDeleting(true);
    try {
      await jobService.remove(jobId);
      router.replace('/(dashboard)/jobs');
    } catch {
      setError('Could not delete this job.');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={Colors.light.primary} />
      </ThemedView>
    );
  }

  if (loadError) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small">{loadError}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.container}>
        <Breadcrumbs trail={[{ label: 'Jobs', href: '/(dashboard)/jobs' }, { label: 'Edit Job' }]} />
        <ThemedText type="title">Edit job</ThemedText>

        <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Description"
          multiline
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Requirements (keywords used for screening)"
          multiline
          value={requirements}
          onChangeText={setRequirements}
        />
        <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
        <TextInput style={styles.input} placeholder="Department" value={department} onChangeText={setDepartment} />
        <TextInput
          style={styles.input}
          placeholder="Employment type (e.g. Full-time)"
          value={employmentType}
          onChangeText={setEmploymentType}
        />

        <ThemedText type="small">Status</ThemedText>
        <ThemedView style={styles.pillRow}>
          {STATUSES.map((option) => (
            <Pressable
              key={option}
              style={[styles.pill, status === option && styles.pillActive]}
              onPress={() => setStatus(option)}
            >
              <ThemedText type="small" themeColor={status === option ? 'background' : 'primary'}>
                {option}
              </ThemedText>
            </Pressable>
          ))}
        </ThemedView>

        {error && <ThemedText type="small">{error}</ThemedText>}

        <Button
          title={submitting ? 'Saving…' : 'Save changes'}
          onPress={handleSubmit}
          loading={submitting}
          disabled={deleting}
          style={styles.button}
        />

        <Button
          title={deleting ? 'Deleting…' : 'Delete job'}
          onPress={handleDelete}
          loading={deleting}
          disabled={submitting}
          variant="outline"
          style={styles.button}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, alignItems: 'stretch', gap: 8, padding: 24 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.light.background,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  pillRow: { flexDirection: 'row', gap: 8, backgroundColor: 'transparent' },
  pill: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillActive: { backgroundColor: Colors.light.primary },
  button: { alignSelf: 'stretch', marginTop: 12 },
});
