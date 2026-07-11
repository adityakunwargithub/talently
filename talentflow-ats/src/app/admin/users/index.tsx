import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { logout, useRequireAdmin } from '@/lib/auth';
import { adminService } from '@/services/admin';
import type { AdminUserRow } from '@/types/models';

const PAGE_SIZE = 10;

export default function AdminUsersScreen() {
  const router = useRouter();
  const checking = useRequireAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .listUsers({ search: search || undefined, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setRows(res.rows);
        setTotal(res.total);
      })
      .catch(() => setError('Could not load users.'))
      .finally(() => setLoading(false));
  }, [search, page]);

  useFocusEffect(
    useCallback(() => {
      if (checking) return;
      const timeout = setTimeout(load, 250);
      return () => clearTimeout(timeout);
    }, [checking, load]),
  );

  async function handleLogout() {
    await logout();
    router.replace('/admin/login');
  }

  async function handleConfirmDelete(row: AdminUserRow) {
    const key = `${row.type}-${row.id}`;
    setDeleteError(null);
    setDeletingKey(key);
    try {
      await adminService.deleteUser(row.type, row.id);
      setConfirmDeleteKey(null);
      load();
    } catch {
      setDeleteError('Could not delete — this record may have related jobs, applications, or notes attached.');
    } finally {
      setDeletingKey(null);
    }
  }

  if (checking) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={Colors.light.primary} />
      </ThemedView>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <ThemedView style={styles.container}>
      <Breadcrumbs trail={[{ label: 'Users' }]} />
      <ThemedView style={styles.header}>
        <ThemedText type="title">Registered users</ThemedText>
        <Button title="Log out" size="sm" variant="outline" onPress={handleLogout} />
      </ThemedView>

      <TextInput
        style={styles.search}
        placeholder="Search by name or username/email"
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setPage(1);
        }}
      />

      {loading && <ActivityIndicator color={Colors.light.primary} />}
      {error && <ThemedText type="small">{error}</ThemedText>}
      {deleteError && <ThemedText type="small">{deleteError}</ThemedText>}
      {!loading && !error && rows.length === 0 && <ThemedText type="small">No users found.</ThemedText>}

      <FlatList
        style={styles.list}
        data={rows}
        keyExtractor={(row) => `${row.type}-${row.id}`}
        renderItem={({ item }) => {
          const key = `${item.type}-${item.id}`;
          const confirming = confirmDeleteKey === key;
          const deleting = deletingKey === key;

          return (
            <ThemedView style={styles.row}>
              <ThemedView style={styles.rowInfo}>
                <ThemedText type="smallBold">{item.name}</ThemedText>
                <ThemedText type="small">{item.identifier}</ThemedText>
                <ThemedView style={styles.typePill}>
                  <ThemedText type="small" themeColor="primary">
                    {item.type}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedView style={styles.rowActions}>
                {confirming ? (
                  <>
                    <ThemedText type="small">Delete this user?</ThemedText>
                    <Button
                      title={deleting ? 'Deleting…' : 'Confirm'}
                      size="sm"
                      loading={deleting}
                      onPress={() => handleConfirmDelete(item)}
                    />
                    <Button
                      title="Cancel"
                      size="sm"
                      variant="outline"
                      disabled={deleting}
                      onPress={() => setConfirmDeleteKey(null)}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      title="Edit"
                      size="sm"
                      variant="outline"
                      onPress={() =>
                        router.push({
                          pathname: '/admin/users/[type]/[id]',
                          params: { type: item.type, id: item.id, name: item.name, identifier: item.identifier },
                        })
                      }
                    />
                    <Button
                      title="Delete"
                      size="sm"
                      variant="outline"
                      onPress={() => {
                        setDeleteError(null);
                        setConfirmDeleteKey(key);
                      }}
                    />
                  </>
                )}
              </ThemedView>
            </ThemedView>
          );
        }}
      />

      <ThemedView style={styles.pagination}>
        <Button title="◀ Prev" size="sm" variant="outline" disabled={page <= 1} onPress={() => setPage((p) => p - 1)} />
        <ThemedText type="small">
          Page {page} of {totalPages} ({total} total)
        </ThemedText>
        <Button
          title="Next ▶"
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onPress={() => setPage((p) => p + 1)}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 24, paddingTop: 64 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  search: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.light.background,
  },
  list: { alignSelf: 'stretch' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: Colors.light.background,
    gap: 8,
  },
  rowInfo: { flex: 1, gap: 4 },
  typePill: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  rowActions: { flexDirection: 'row', gap: 8 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
});
