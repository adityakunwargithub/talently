import { Href, Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { candidateLogin } from '@/lib/auth';

export default function CandidateLoginScreen() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await candidateLogin({ username, password });
      router.replace((redirect || '/careers') as Href);
    } catch {
      setError('Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <Breadcrumbs trail={[{ label: 'Candidate Login' }]} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Candidate login</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <ThemedText type="small">{error}</ThemedText>}

        <Button title="Log in" onPress={handleSubmit} loading={submitting} style={styles.button} />

        <Link href="/forgot-password">
          <ThemedText type="linkPrimary">Forgot password?</ThemedText>
        </Link>

        <Link href={{ pathname: '/(candidate)/signup', params: redirect ? { redirect } : undefined }}>
          <ThemedText type="linkPrimary">New candidate? Sign up</ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.light.background,
  },
  button: { alignSelf: 'stretch' },
});
