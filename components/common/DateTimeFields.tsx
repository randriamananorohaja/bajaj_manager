import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors, Radius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

function parseDate(value: string): Date {
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + 'T12:00:00');
  }
  return new Date();
}

function parseTime(value: string): Date {
  const d = new Date();
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
  }
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateDisplay(value: string): string {
  if (!value) return 'Choisir une date';
  const d = parseDate(value);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
}

type DateFieldProps = {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
};

export function DateField({ label, value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  const onPick = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (date) onChange(formatDate(date));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={() => setOpen(true)}>
        <IconSymbol name="calendar" size={18} color={Colors.light.primary} />
        <Text style={[styles.value, !value && styles.placeholder]}>{formatDateDisplay(value)}</Text>
      </TouchableOpacity>
      {open && (
        <DateTimePicker
          value={value ? parseDate(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPick}
          locale="fr-FR"
        />
      )}
      {Platform.OS === 'ios' && open && (
        <TouchableOpacity style={styles.done} onPress={() => setOpen(false)}>
          <Text style={styles.doneText}>OK</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

type TimeFieldProps = {
  label: string;
  value: string; // HH:MM
  onChange: (v: string) => void;
};

export function TimeField({ label, value, onChange }: TimeFieldProps) {
  const [open, setOpen] = useState(false);

  const onPick = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (date) onChange(formatTime(date));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={() => setOpen(true)}>
        <IconSymbol name="clock" size={18} color={Colors.light.primary} />
        <Text style={[styles.value, !value && styles.placeholder]}>{value || 'Choisir une heure'}</Text>
      </TouchableOpacity>
      {open && (
        <DateTimePicker
          value={value ? parseTime(value) : new Date()}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPick}
        />
      )}
      {Platform.OS === 'ios' && open && (
        <TouchableOpacity style={styles.done} onPress={() => setOpen(false)}>
          <Text style={styles.doneText}>OK</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.light.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  value: { fontSize: 15, color: Colors.light.text, flex: 1 },
  placeholder: { color: Colors.light.textMuted },
  done: { alignSelf: 'flex-end', padding: 8 },
  doneText: { color: Colors.light.primary, fontWeight: '700', fontSize: 15 },
});
