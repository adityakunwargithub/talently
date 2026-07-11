import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BannerHeader } from '@/components/banner-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { applicationService } from '@/services/application';
import { jobService } from '@/services/job';
import type { Job } from '@/types/models';

export default function JobDetailScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    jobService
      .getPublic(jobId)
      .then(setJob)
      .catch(() => setLoadError('Could not load this job.'));
  }, [jobId]);

  async function handlePickResume() {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setSubmitError(null);
    setParsingResume(true);
    try {
      const name = asset.name.toLowerCase();
      const needsServerParsing = asset.mimeType !== 'text/plain' && !name.endsWith('.txt');
      const text = needsServerParsing
        ? await applicationService.parseResume(asset.file ?? { uri: asset.uri, name: asset.name, mimeType: asset.mimeType })
        : await fetch(asset.uri).then((res) => res.text());
      setResumeText(text);
      setResumeFileName(asset.name);
    } catch {
      setSubmitError('Could not read that file. Paste your resume text below instead.');
    } finally {
      setParsingResume(false);
    }
  }

  async function handleSubmit() {
    if (!jobId) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      await applicationService.submitToJob(jobId, {
        name,
        email,
        phone: phone || undefined,
        resumeText: resumeText || undefined,
        resumeUrl: resumeFileName ?? undefined,
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <ThemedView style={styles.screen}>
        <BannerHeader showLogout={false} />
        <View style={styles.errorContainer}>
          <ThemedText type="small">{loadError}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!job) {
    return (
      <ThemedView style={styles.screen}>
        <BannerHeader showLogout={false} />
        <View style={styles.errorContainer}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </ThemedView>
    );
  }

  if (submitted) {
    return (
      <ThemedView style={styles.screen}>
        <BannerHeader showLogout={false} />
        <View style={styles.container}>
          <Breadcrumbs trail={[{ label: 'Careers', href: '/careers' }, { label: job.title }]} />
          <ThemedText type="title">Application sent</ThemedText>
          <ThemedText type="small">Thanks for applying to {job.title}. We&apos;ll be in touch.</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <BannerHeader showLogout={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.container}>
        <Breadcrumbs trail={[{ label: 'Careers', href: '/careers' }, { label: job.title }]} />
        <ThemedText type="title">{job.title}</ThemedText>
        <ThemedText type="small">
          {job.department} · {job.location} · {job.employmentType}
        </ThemedText>
        <ThemedText type="subtitle">Description</ThemedText>
        <ThemedView style={styles.fieldValue}>
          <ThemedText>{job.description}</ThemedText>
        </ThemedView>
        <ThemedText type="subtitle">Requirements</ThemedText>
        <ThemedView style={styles.fieldValue}>
          <ThemedText>{job.requirements}</ThemedText>
        </ThemedView>

        <ThemedText type="subtitle">Apply</ThemedText>
        <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput style={styles.input} placeholder="Phone (optional)" value={phone} onChangeText={setPhone} />

        <Button
          title={
            parsingResume
              ? 'Reading resume…'
              : resumeFileName
                ? `Attached: ${resumeFileName}`
                : 'Attach resume (.pdf, .docx or .txt)'
          }
          variant="outline"
          loading={parsingResume}
          onPress={handlePickResume}
          style={styles.secondaryButton}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Or paste your resume text here"
          multiline
          numberOfLines={6}
          value={resumeText}
          onChangeText={setResumeText}
        />

        {submitError && <ThemedText type="small">{submitError}</ThemedText>}

        <Button
          title="Submit application"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!name || !email}
          style={styles.button}
        />
      </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, alignItems: 'stretch', gap: 8, padding: 24 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    backgroundColor: Colors.light.background,
  },
  fieldValue: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    backgroundColor: Colors.light.background,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  secondaryButton: { alignSelf: 'stretch', marginTop: 8 },
  button: { alignSelf: 'stretch', marginTop: 12 },
});
