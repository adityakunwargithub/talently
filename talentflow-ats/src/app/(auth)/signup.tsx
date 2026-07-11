import { Href, Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { signup } from '@/lib/auth';

export default function SignupScreen() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await signup({ name, email, password });
      router.replace((redirect || '/(dashboard)') as Href);
    } catch {
      setError('Could not create account. That email may already be in use.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <Breadcrumbs trail={[{ label: 'Recruiter Login', href: '/(auth)/login' }, { label: 'Sign Up' }]} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Sign up</ThemedText>

        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <ThemedText type="small">{error}</ThemedText>}

        <Button title="Sign up" onPress={handleSubmit} loading={submitting} style={styles.button} />

        <Link href={{ pathname: '/(auth)/login', params: redirect ? { redirect } : undefined }}>
          <ThemedText type="linkPrimary">Already have an account? Log in</ThemedText>
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
