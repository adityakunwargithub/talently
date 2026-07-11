import { Href, useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useHomeHref } from '@/lib/auth';

export type Crumb = { label: string; href?: Href };

function HomeIcon({ size = 18 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size / 2,
          borderRightWidth: size / 2,
          borderBottomWidth: size / 2,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: Colors.light.primary,
        }}
      />
      <View style={{ width: size * 0.68, height: size * 0.42, backgroundColor: Colors.light.primary }} />
    </View>
  );
}

/**
 * Home icon + clickable breadcrumb trail, shown near the top of every screen.
 * The home icon's destination depends on the logged-in role (candidate/recruiter/
 * admin each have their own "home"); logged-out users go to the landing page.
 */
export function Breadcrumbs({ trail = [] }: { trail?: Crumb[] }) {
  const router = useRouter();
  const homeHref = useHomeHref();

  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.push(homeHref)} hitSlop={8} style={styles.homeButton}>
        <HomeIcon />
      </Pressable>
      {trail.map((crumb, index) => (
        <Fragment key={`${crumb.label}-${index}`}>
          <ThemedText type="small" style={styles.separator}>
            /
          </ThemedText>
          {crumb.href ? (
            <Pressable onPress={() => router.push(crumb.href!)} hitSlop={8}>
              <ThemedText type="small" themeColor="primary">
                {crumb.label}
              </ThemedText>
            </Pressable>
          ) : (
            <ThemedText type="small">{crumb.label}</ThemedText>
          )}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    flexWrap: 'wrap',
  },
  homeButton: { padding: 2 },
  separator: { color: Colors.light.textSecondary },
});
