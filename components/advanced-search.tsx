/**
 * Advanced Search Component
 * Provides filtering and search capabilities for tickets
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TicketStatus } from '@/types/ticket';

export interface SearchFilters {
  searchText: string;
  status: TicketStatus | 'all';
  technician: string;
  startDate: string;
  endDate: string;
}

interface AdvancedSearchProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  technicians: string[];
  initialFilters?: SearchFilters;
}

const TRANSLATIONS = {
  search: 'Căutare',
  filters: 'Filtre',
  status: 'Status',
  technician: 'Tehnician',
  dateRange: 'Interval Date',
  from: 'De la',
  to: 'Până la',
  apply: 'Aplică',
  clear: 'Șterge',
  all: 'Toate',
  pending: 'În așteptare',
  in_progress: 'În curs',
  completed: 'Finalizat',
  on_hold: 'Suspendat',
  clientName: 'Nume Client',
  clientPhone: 'Telefon Client',
};

export function AdvancedSearch({
  visible,
  onClose,
  onApply,
  technicians,
  initialFilters,
}: AdvancedSearchProps) {
  const [searchText, setSearchText] = useState(initialFilters?.searchText || '');
  const [status, setStatus] = useState<TicketStatus | 'all'>(initialFilters?.status || 'all');
  const [technician, setTechnician] = useState(initialFilters?.technician || '');
  const [startDate, setStartDate] = useState(initialFilters?.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters?.endDate || '');

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  const handleApply = () => {
    onApply({
      searchText,
      status,
      technician,
      startDate,
      endDate,
    });
    onClose();
  };

  const handleClear = () => {
    setSearchText('');
    setStatus('all');
    setTechnician('');
    setStartDate('');
    setEndDate('');
  };

  const getStatusLabel = (s: TicketStatus | 'all'): string => {
    const labels: Record<TicketStatus | 'all', string> = {
      all: TRANSLATIONS.all,
      pending: TRANSLATIONS.pending,
      in_progress: TRANSLATIONS.in_progress,
      completed: TRANSLATIONS.completed,
      on_hold: TRANSLATIONS.on_hold,
    };
    return labels[s];
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">{TRANSLATIONS.filters}</ThemedText>
          <Pressable onPress={onClose}>
            <ThemedText style={{ color: tintColor, fontSize: 16 }}>✕</ThemedText>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Text Input */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              {TRANSLATIONS.search}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor,
                  color: textColor,
                  backgroundColor: surfaceColor,
                },
              ]}
              placeholder={TRANSLATIONS.clientName}
              placeholderTextColor={secondaryTextColor}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Status Filter */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              {TRANSLATIONS.status}
            </ThemedText>
            <View style={styles.filterOptions}>
              {(['all', 'pending', 'in_progress', 'completed', 'on_hold'] as const).map(s => (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: status === s ? tintColor : surfaceColor,
                      borderColor,
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: status === s ? '#fff' : textColor,
                      fontSize: 12,
                    }}
                  >
                    {getStatusLabel(s)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Technician Filter */}
          {technicians.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                {TRANSLATIONS.technician}
              </ThemedText>
              <View style={styles.filterOptions}>
                <Pressable
                  onPress={() => setTechnician('')}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: technician === '' ? tintColor : surfaceColor,
                      borderColor,
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: technician === '' ? '#fff' : textColor,
                      fontSize: 12,
                    }}
                  >
                    {TRANSLATIONS.all}
                  </ThemedText>
                </Pressable>
                {technicians.map(tech => (
                  <Pressable
                    key={tech}
                    onPress={() => setTechnician(tech)}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor: technician === tech ? tintColor : surfaceColor,
                        borderColor,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: technician === tech ? '#fff' : textColor,
                        fontSize: 12,
                      }}
                    >
                      {tech}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Date Range */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              {TRANSLATIONS.dateRange}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor,
                  color: textColor,
                  backgroundColor: surfaceColor,
                  marginBottom: 8,
                },
              ]}
              placeholder={TRANSLATIONS.from}
              placeholderTextColor={secondaryTextColor}
              value={startDate}
              onChangeText={setStartDate}
            />
            <TextInput
              style={[
                styles.input,
                {
                  borderColor,
                  color: textColor,
                  backgroundColor: surfaceColor,
                },
              ]}
              placeholder={TRANSLATIONS.to}
              placeholderTextColor={secondaryTextColor}
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleClear}
            style={[styles.button, { borderWidth: 1, borderColor }]}
          >
            <ThemedText style={{ color: textColor, fontWeight: '600' }}>
              {TRANSLATIONS.clear}
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={handleApply}
            style={[styles.button, { backgroundColor: tintColor }]}
          >
            <ThemedText style={{ color: '#fff', fontWeight: '600' }}>
              {TRANSLATIONS.apply}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingTop: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
