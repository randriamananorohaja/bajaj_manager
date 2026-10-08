import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Colors, Radius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Props = {
  title: string;
  onPress?: () => void;
  icon?: string;
  variant?: 'primary' | 'outline' | 'danger' | 'success' | 'dark';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  loading,
  style,
}: Props) {
  const bg =
    variant === 'primary'
      ? Colors.light.primary
      : variant === 'danger'
        ? Colors.light.danger
        : variant === 'success'
          ? Colors.light.success
          : variant === 'dark'
            ? Colors.light.header
            : 'transparent';
  const textColor =
    variant === 'outline'
      ? Colors.light.header
      : variant === 'primary'
        ? '#1A1A1A'
        : '#fff';
  const borderColor = variant === 'outline' ? Colors.light.primary : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor, borderWidth: variant === 'outline' ? 2 : 0 },
        variant === 'primary' && styles.shadowPrimary,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <IconSymbol name={icon} size={20} color={textColor} /> : null}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  },
});
