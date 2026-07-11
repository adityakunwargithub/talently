import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { jobService } from '@/services/job';
import type { JobStatus } from '@/types/models';

const STATUSES: JobStatus[] = ['DRAFT', 'PUBLISHED', 'CLOSED'];

export default function NewJobScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [status, setStatus] = useState<JobStatus>('DRAFT');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title && description && requirements && location && department && employmentType;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await jobService.create({ title, description, requirements, location, department, employmentType, status });
      router.replace('/(dashboard)/jobs');
    } catch {
      setError('Could not create this job.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.container}>
        <Breadcrumbs trail={[{ label: 'Jobs', href: '/(dashboard)/jobs' }, { label: 'New Job' }]} />
        <ThemedText type="title">New job</ThemedText>

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
          title="Create job"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
          style={styles.button}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
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
