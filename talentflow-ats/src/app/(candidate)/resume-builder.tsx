import * as DocumentPicker from 'expo-document-picker';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { EmbeddedHtml } from '@/components/ui/embedded-html';
import { Colors } from '@/constants/theme';
import {
  EMPTY_RESUME_FIELDS,
  composeResumeHtml,
  composeResumePlainText,
  extractResumeFields,
  mergeResumeFields,
  type ResumeFields,
} from '@/lib/resume-fields';
import { resumeService } from '@/services/resume';

const PICKER_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default function ResumeBuilderScreen() {
  const [fields, setFields] = useState<ResumeFields>(EMPTY_RESUME_FIELDS);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [linkedinFileName, setLinkedinFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState<'cv' | 'linkedin' | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState<'docx' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: keyof ResumeFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function pickAndParse(kind: 'cv' | 'linkedin') {
    const result = await DocumentPicker.getDocumentAsync({ type: PICKER_TYPES, copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setError(null);
    setParsing(kind);
    try {
      const text = await resumeService.parseFile(asset.file ?? { uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
      const extracted = extractResumeFields(text);
      if (kind === 'cv') {
        setFields(extracted);
        setCvFileName(asset.name);
      } else {
        setFields((prev) => mergeResumeFields(prev, extracted));
        setLinkedinFileName(asset.name);
      }
    } catch {
      setError('Could not read that file. You can still fill in the fields manually below.');
    } finally {
      setParsing(null);
    }
  }

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    try {
      setPreviewHtml(composeResumeHtml(fields));
      await resumeService.persist(fields, composeResumePlainText(fields));
    } catch {
      setError('Generated the preview below, but could not save it to your profile.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload(format: 'docx' | 'pdf') {
    setError(null);
    setDownloading(format);
    try {
      await resumeService.download(fields, composeResumePlainText(fields), format);
    } catch {
      setError(`Could not download the ${format.toUpperCase()} file.`);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.container}>
        <Breadcrumbs trail={[{ label: 'Careers', href: '/careers' }, { label: 'Resume Builder' }]} />
        <ThemedText type="title">Resume Builder</ThemedText>
        <ThemedText type="small" style={styles.hint}>
          Upload your CV to auto-fill the fields below (a simple keyword-based parser, not real AI — please
          review everything), tweak anything, then generate an updated resume.
        </ThemedText>

        <View style={styles.uploadRow}>
          <Button
            title={
              parsing === 'cv' ? 'Reading…' : cvFileName ? `CV: ${cvFileName}` : 'Upload CV (.pdf, .docx, .txt)'
            }
            variant="outline"
            size="sm"
            loading={parsing === 'cv'}
            onPress={() => pickAndParse('cv')}
            style={styles.uploadButton}
          />
          <Button
            title={
              parsing === 'linkedin'
                ? 'Reading…'
                : linkedinFileName
                  ? `LinkedIn: ${linkedinFileName}`
                  : 'Upload LinkedIn PDF export'
            }
            variant="outline"
            size="sm"
            loading={parsing === 'linkedin'}
            onPress={() => pickAndParse('linkedin')}
            style={styles.uploadButton}
          />
        </View>

        <ThemedText type="subtitle">Details</ThemedText>
        <TextInput style={styles.input} placeholder="Full name" value={fields.name} onChangeText={(v) => updateField('name', v)} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          value={fields.email}
          onChangeText={(v) => updateField('email', v)}
        />
        <TextInput style={styles.input} placeholder="Phone" value={fields.phone} onChangeText={(v) => updateField('phone', v)} />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Summary"
          multiline
          value={fields.summary}
          onChangeText={(v) => updateField('summary', v)}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Skills (comma-separated)"
          multiline
          value={fields.skills}
          onChangeText={(v) => updateField('skills', v)}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Experience"
          multiline
          value={fields.experience}
          onChangeText={(v) => updateField('experience', v)}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Education"
          multiline
          value={fields.education}
          onChangeText={(v) => updateField('education', v)}
        />

        {error && <ThemedText type="small">{error}</ThemedText>}

        <Button title="Generate updated resume" onPress={handleGenerate} loading={generating} style={styles.button} />

        {previewHtml && (
          <>
            <ThemedText type="subtitle">Preview</ThemedText>
            <View style={styles.previewFrame}>
              <EmbeddedHtml html={previewHtml} style={styles.previewFrameInner} />
            </View>

            <View style={styles.uploadRow}>
              <Button
                title={downloading === 'docx' ? 'Preparing…' : 'Download .docx'}
                variant="outline"
                loading={downloading === 'docx'}
                onPress={() => handleDownload('docx')}
                style={styles.downloadButton}
              />
              <Button
                title={downloading === 'pdf' ? 'Preparing…' : 'Download .pdf'}
                variant="outline"
                loading={downloading === 'pdf'}
                onPress={() => handleDownload('pdf')}
                style={styles.downloadButton}
              />
            </View>
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, alignItems: 'stretch', gap: 8, padding: 24 },
  hint: { color: Colors.light.textSecondary },
  uploadRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  uploadButton: { flex: 1 },
  downloadButton: { flex: 1 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    backgroundColor: Colors.light.background,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  button: { alignSelf: 'stretch', marginTop: 12 },
  previewFrame: {
    height: 420,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  previewFrameInner: { flex: 1 },
});
