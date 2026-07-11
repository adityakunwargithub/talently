import { File as ExpoFile, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { api, getToken } from '@/lib/api';
import type { ResumeFields } from '@/lib/resume-fields';

export type ResumeFormat = 'docx' | 'pdf';

export const resumeService = {
  /** Parses an uploaded CV/LinkedIn PDF into raw text (reuses the public resume parser). */
  parseFile: (file: File | { uri: string; name: string; mimeType?: string }) => {
    const formData = new FormData();
    if (typeof File !== 'undefined' && file instanceof File) {
      formData.append('resume', file, file.name);
    } else {
      const asset = file as { uri: string; name: string; mimeType?: string };
      formData.append('resume', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/octet-stream',
      } as unknown as Blob);
    }
    return api.post<{ text: string }>('/public/parse-resume', formData).then((res) => res.data.text);
  },

  /** Triggers backend generation once, discarding the file — used to persist resumeText on "Generate". */
  persist: (fields: ResumeFields, plainText: string) =>
    api.post('/resume/generate', { fields, plainText, format: 'pdf' }, { responseType: 'blob' }),

  async download(fields: ResumeFields, plainText: string, format: ResumeFormat): Promise<void> {
    const filename = `resume.${format}`;

    if (Platform.OS === 'web') {
      const { data } = await api.post<Blob>(
        '/resume/generate',
        { fields, plainText, format },
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return;
    }

    const token = await getToken();
    const response = await fetch(`${api.defaults.baseURL}/resume/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ fields, plainText, format }),
    });
    const arrayBuffer = await response.arrayBuffer();

    const file = new ExpoFile(Paths.cache, filename);
    if (file.exists) file.delete();
    file.create();
    file.write(new Uint8Array(arrayBuffer));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri);
    }
  },
};
