import { Href, Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { adminLogin } from '@/lib/auth';

export default function AdminLoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await adminLogin({ username, password });
      // Typed-route generation lags behind newly added files; this is the correct runtime path.
      router.replace('/admin/users' as Href);
    } catch {
      setError('Invalid admin username or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <Breadcrumbs trail={[{ label: 'Admin Login' }]} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Admin login</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Admin username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Admin password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <ThemedText type="small">{error}</ThemedText>}

        <Button title="Log in" onPress={handleSubmit} loading={submitting} style={styles.button} />

        <Link href="/forgot-password">
          <ThemedText type="linkPrimary">Forgot password?</ThemedText>
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
