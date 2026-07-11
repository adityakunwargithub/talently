import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'outline';
export type ButtonSize = 'md' | 'sm';

export type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
};

const RADIUS = 10;

export function Button({ title, onPress, disabled, loading, variant = 'primary', size = 'md', style }: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;
  const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeMd;

  const label = (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : Colors.light.primary}
          style={styles.spinner}
        />
      )}
      <ThemedText
        type={size === 'sm' ? 'small' : 'default'}
        style={variant === 'primary' ? styles.labelPrimary : styles.labelOutline}
      >
        {title}
      </ThemedText>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.outer,
        variant === 'primary' && styles.shadow,
        pressed && !isDisabled && variant === 'primary' && styles.pressedShadow,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={pressed ? [Colors.light.primary, Colors.light.primaryDark] : [Colors.light.primaryLight, Colors.light.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.inner, sizeStyle, styles.bevel, pressed && styles.pressedTranslate]}
        >
          {label}
        </LinearGradient>
      ) : (
        <ThemedView style={[styles.inner, sizeStyle, styles.outline, pressed && styles.outlinePressed]}>
          {label}
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: RADIUS,
    alignSelf: 'flex-start',
  },
  shadow: {
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    backgroundColor: Colors.light.primary,
  },
  pressedShadow: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  inner: {
    borderRadius: RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeMd: {
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
  },
  sizeSm: {
    paddingVertical: Spacing.two - 2,
    paddingHorizontal: Spacing.three,
  },
  bevel: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.light.primaryDark,
  },
  pressedTranslate: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 1,
  },
  outline: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.backgroundSelected,
  },
  outlinePressed: {
    backgroundColor: Colors.light.border,
  },
  labelPrimary: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  labelOutline: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  spinner: {
    marginRight: Spacing.two,
  },
});
