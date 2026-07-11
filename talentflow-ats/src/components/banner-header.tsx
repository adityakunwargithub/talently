import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { Button } from './ui/button';
import { logout } from '@/lib/auth';

interface BannerHeaderProps {
  showLogout?: boolean;
}

export function BannerHeader({ showLogout = true }: BannerHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.banner}>
      <View style={styles.logoAndText}>
        <ThemedText style={styles.brandText}>Talently</ThemedText>
      </View>
      {showLogout && (
        <Button
          title="Log out"
          size="sm"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    minHeight: 56,
  },
  logoAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
