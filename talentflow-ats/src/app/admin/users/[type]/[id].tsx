import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useRequireAdmin } from '@/lib/auth';
import { adminService } from '@/services/admin';
import type { AdminUserType } from '@/types/models';

export default function EditAdminUserScreen() {
  const { type, id, name: initialName, identifier: initialIdentifier } = useLocalSearchParams<{
    type: AdminUserType;
    id: string;
    name: string;
    identifier: string;
  }>();
  const router = useRouter();
  const checking = useRequireAdmin();

  const [name, setName] = useState(initialName ?? '');
  const [identifier, setIdentifier] = useState(initialIdentifier ?? '');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const identifierLabel = type === 'ADMIN' ? 'Username' : 'Email';

  async function handleSubmit() {
    if (!type || !id) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload = type === 'ADMIN' ? { name, username: identifier } : { name, email: identifier, phone: phone || undefined };
      await adminService.updateUser(type, id, payload);
      router.back();
    } catch {
      setError('Could not save changes. That username/email may already be in use.');
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return null;

  return (
    <ThemedView style={styles.container}>
      <Breadcrumbs trail={[{ label: 'Users', href: '/admin/users' as Href }, { label: 'Edit User' }]} />
      <ThemedText type="title">Edit user</ThemedText>
      <ThemedText type="small">Type: {type}</ThemedText>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder={identifierLabel}
        autoCapitalize="none"
        value={identifier}
        onChangeText={setIdentifier}
      />
      {type === 'CANDIDATE' && (
        <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} />
      )}

      {error && <ThemedText type="small">{error}</ThemedText>}

      <Button title="Save changes" onPress={handleSubmit} loading={submitting} style={styles.button} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'stretch', gap: 8, padding: 24 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.light.background,
  },
  button: { alignSelf: 'stretch', marginTop: 12 },
});
