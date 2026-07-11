import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { Button } from '../ui/button';
import { logout } from '@/lib/auth';

interface DashboardHeaderProps {
  title: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      <Button
        title="Log out"
        size="sm"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    marginBottom: 0,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
