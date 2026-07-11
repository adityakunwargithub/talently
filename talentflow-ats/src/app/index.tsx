import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

function Logo({ size = 64 }: { size?: number }) {
  return (
    <View style={[styles.logo, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <LinearGradient
        colors={[Colors.light.primaryLight, Colors.light.primary, Colors.light.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ThemedText style={[styles.logoLetter, { fontSize: size * 0.48 }]}>T</ThemedText>
    </View>
  );
}

function PersonBadge({ size = 72 }: { size?: number }) {
  return (
    <View style={[styles.personBadge, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient
        colors={[Colors.light.primaryLight, Colors.light.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.personHead, { width: size * 0.32, height: size * 0.32, borderRadius: size * 0.16, top: size * 0.17 }]} />
      <View
        style={[
          styles.personBody,
          { width: size * 0.62, height: size * 0.48, borderRadius: size * 0.28, top: size * 0.54 },
        ]}
      />
    </View>
  );
}

function LoginTile({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[styles.tile, hovered && styles.tileHovered]}
    >
      <PersonBadge />
      <ThemedText style={styles.tileTitle}>{title}</ThemedText>
      <ThemedText type="small" style={styles.tileDescription}>
        {description}
      </ThemedText>
    </Pressable>
  );
}

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const stackedTiles = width < 560;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.page}>
        <Pressable style={styles.adminLink} onPress={() => router.push('/admin/login')}>
          <ThemedText type="small" style={styles.adminLinkText}>
            Admin login
          </ThemedText>
        </Pressable>

        <View style={styles.content}>
          <View style={styles.hero}>
            <Logo />
            <ThemedText style={styles.brandTitle}>Talently</ThemedText>
            <ThemedText type="small" style={styles.subtext}>
              The all-in-one hiring platform — post roles, screen candidates, and track every
              application in one place.
            </ThemedText>
          </View>

          <View style={[styles.tiles, stackedTiles && styles.tilesStacked]}>
            <LoginTile
              title="Candidate Login"
              description="Browse open roles and apply in minutes."
              onPress={() => router.push('/(candidate)/login')}
            />
            <LoginTile
              title="Recruiter Login"
              description="Post jobs, screen applicants, and manage your pipeline."
              onPress={() => router.push('/(auth)/login')}
            />
          </View>

          <Pressable onPress={() => router.push('/(auth)/signup')} style={styles.cta}>
            <ThemedText type="linkPrimary">New recruiter? Create an account</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  page: { flex: 1, alignItems: 'center' },
  content: { flex: 1, alignItems: 'center', width: '100%', maxWidth: MaxContentWidth, padding: Spacing.four, gap: Spacing.five },
  adminLink: {
    alignSelf: 'flex-end',
    marginTop: Spacing.three,
    marginRight: Spacing.three,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    backgroundColor: '#EEEFF3',
  },
  adminLinkText: { color: '#8A8D97' },
  hero: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.four },
  logo: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoLetter: { color: '#FFFFFF', fontWeight: '700' },
  brandTitle: {
    fontSize: 40,
    fontWeight: '500',
    color: Colors.light.title,
  },
  subtext: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    maxWidth: 480,
  },
  tiles: { flexDirection: 'row', gap: Spacing.four, alignSelf: 'stretch', justifyContent: 'center' },
  tilesStacked: { flexDirection: 'column' },
  tile: {
    flex: 1,
    maxWidth: 320,
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.five,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  tileHovered: {
    borderColor: Colors.light.primary,
    shadowOpacity: 0.45,
    shadowRadius: 26,
    elevation: 14,
    transform: [{ translateY: -4 }],
  },
  personBadge: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  personHead: { position: 'absolute', backgroundColor: '#FFFFFF' },
  personBody: { position: 'absolute', backgroundColor: '#FFFFFF' },
  tileTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.title },
  tileDescription: { textAlign: 'center', color: Colors.light.textSecondary },
  cta: { marginTop: Spacing.two, paddingBottom: Spacing.five },
});
