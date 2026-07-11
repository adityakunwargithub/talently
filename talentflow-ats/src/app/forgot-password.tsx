import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Dummy flow — no email is actually sent. Wire this up to a real reset-token
  // endpoint when password reset is implemented.
  function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <ThemedView style={styles.screen}>
        <Breadcrumbs trail={[{ label: 'Forgot Password' }]} />
        <ThemedView style={styles.container}>
          <ThemedText type="title">Check your inbox</ThemedText>
          <ThemedText type="small" style={styles.centerText}>
            If an account matches &quot;{identifier}&quot;, we&apos;ve sent password reset instructions to it.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <Breadcrumbs trail={[{ label: 'Forgot Password' }]} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Forgot password</ThemedText>
        <ThemedText type="small" style={styles.centerText}>
          Enter your username or email and we&apos;ll send you reset instructions.
        </ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Username or email"
          autoCapitalize="none"
          value={identifier}
          onChangeText={setIdentifier}
        />

        <Button title="Send reset instructions" onPress={handleSubmit} disabled={!identifier} style={styles.button} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  centerText: { textAlign: 'center', maxWidth: 360 },
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
