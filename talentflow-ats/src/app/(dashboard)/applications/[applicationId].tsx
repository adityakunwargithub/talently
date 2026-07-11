import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { EmbeddedHtml } from '@/components/ui/embedded-html';
import { Colors } from '@/constants/theme';
import { highlightResumeHtml, type KeywordMatch } from '@/lib/resume-fields';
import { aiScreeningService } from '@/services/ai-screening';
import type { ScreeningResult } from '@/types/models';

export default function ScreeningDetailScreen() {
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [matches, setMatches] = useState<KeywordMatch[]>([]);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) return;
    aiScreeningService
      .screen(applicationId)
      .then((res) => {
        setResult(res);
        const resumeText = res.candidate?.resumeText ?? '';
        if (resumeText) {
          const { html: highlighted, matches: computed } = highlightResumeHtml(resumeText, res.requiredKeywords);
          setHtml(highlighted);
          setMatches(computed);
        }
      })
      .catch(() => setError('Could not screen this application.'))
      .finally(() => setLoading(false));
  }, [applicationId]);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={Colors.light.primary} />
      </ThemedView>
    );
  }

  if (error || !result) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small">{error ?? 'Application not found.'}</ThemedText>
      </ThemedView>
    );
  }

  const exactMatches = matches.filter((m) => m.matchType === 'exact').map((m) => m.keyword);
  const relatedMatches = matches.filter((m) => m.matchType === 'related').map((m) => m.keyword);
  const matchedAll = [...exactMatches, ...relatedMatches];
  const missing = result.requiredKeywords.filter((kw) => !matches.some((m) => m.keyword === kw));

  return (
    <ThemedView style={styles.container}>
      <Breadcrumbs trail={[{ label: 'Applications', href: '/(dashboard)/applications' }, { label: 'Screening' }]} />
      <ThemedText type="title">{result.candidate?.name ?? 'Candidate'}</ThemedText>
      <ThemedText type="small">Applying for {result.job?.title ?? 'this role'}</ThemedText>

      <ThemedView style={styles.scoreCard}>
        <ThemedText type="subtitle">Fitment score: {result.score ?? 0}%</ThemedText>
        <ThemedText type="small">
          {matchedAll.length > 0 ? `Matched: ${matchedAll.join(', ')}` : 'No keyword matches found.'}
        </ThemedText>
        {missing.length > 0 && (
          <ThemedText type="small" style={styles.missing}>
            Not found: {missing.join(', ')}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedText type="subtitle">Resume</ThemedText>
      <View style={styles.previewFrame}>
        {html ? (
          <EmbeddedHtml html={html} style={styles.previewFrameInner} />
        ) : (
          <ThemedView style={styles.centered}>
            <ThemedText type="small">No resume text on file for this candidate.</ThemedText>
          </ThemedView>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 8, padding: 24 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scoreCard: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: 14,
    gap: 4,
    backgroundColor: Colors.light.background,
    marginTop: 4,
  },
  missing: { color: Colors.light.textSecondary },
  previewFrame: {
    flex: 1,
    minHeight: 300,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  previewFrameInner: { flex: 1 },
});
