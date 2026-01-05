/**
 * Home Screen
 * Displays list of all service tickets with search and filter
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  Pressable,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTickets } from '@/hooks/use-tickets';
import { ServiceTicket, TicketStatus } from '@/types/ticket';
import { getDashboardStats } from '@/lib/reports';
import { syncTicketsFromTelegram } from '@/lib/telegram-sync';
import { useSettings } from '@/hooks/use-settings';

interface DashboardStats {
  totalTickets: number;
  completedTickets: number;
  pendingTickets: number;
  todayTickets: number;
  totalRevenue: number;
}

// Romanian translations for Home Screen
const TRANSLATIONS = {
  title: 'Manager Servicii',
  totalTickets: 'Total',
  completedTickets: 'Finalizate',
  pendingTickets: 'În curs',
  search: 'Cauta client, model...',
  noTickets: 'Nu sunt fișe de service',
  noResults: 'Niciun rezultat pentru căutarea ta',
  addNew: 'Apasă + pentru a adăuga o nouă fișă',
  phone: 'Telefon:',
  cost: 'Cost:',
  sentTelegram: '✓ Trimis pe Telegram',
  pending: 'În așteptare',
  inProgress: 'În curs',
  completed: 'Finalizat',
  onHold: 'Suspendat',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tickets, loading, loadTickets } = useTickets();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filteredTickets, setFilteredTickets] = useState<ServiceTicket[]>([]);
  const [syncing, setSyncing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    };
    loadStats();
  }, [tickets]);

  // Filter tickets based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTickets(tickets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = tickets.filter(
      ticket =>
        ticket.clientName.toLowerCase().includes(query) ||
        ticket.productModel.toLowerCase().includes(query) ||
        ticket.clientPhone.includes(query)
    );
    setFilteredTickets(filtered);
  }, [searchQuery, tickets]);

  // Handle sync from Telegram
  const handleSync = async () => {
    if (!settings?.telegramConfig?.botToken || !settings?.telegramConfig?.groupId) {
      Alert.alert('Eroare', 'Configurați token-ul Telegram și ID-ul grupului în Setări');
      return;
    }

    try {
      setSyncing(true);
      const result = await syncTicketsFromTelegram(
        settings.telegramConfig.botToken,
        settings.telegramConfig.groupId
      );

      if (result.success) {
        // Reload tickets after sync
        await loadTickets();
        Alert.alert('Succes', `${result.count} fișe sincronizate de pe Telegram`);
      } else {
        Alert.alert('Eroare', result.error || 'Eroare la sincronizare');
      }
    } catch (error) {
      Alert.alert('Eroare', error instanceof Error ? error.message : 'Eroare necunoscută');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: TicketStatus): string => {
    const colors: Record<TicketStatus, string> = {
      pending: '#FFA500',
      in_progress: tintColor,
      completed: '#00A86B',
      on_hold: '#FF6B35',
    };
    return colors[status];
  };

  const getStatusLabel = (status: TicketStatus): string => {
    const labels: Record<TicketStatus, string> = {
      pending: TRANSLATIONS.pending,
      in_progress: TRANSLATIONS.inProgress,
      completed: TRANSLATIONS.completed,
      on_hold: TRANSLATIONS.onHold,
    };
    return labels[status];
  };

  const renderTicketCard = ({ item }: { item: ServiceTicket }) => (
    <Pressable
      onPress={() => router.push(`/ticket-detail/${item.id}` as any)}
      style={({ pressed }) => [
        styles.ticketCard,
        {
          backgroundColor: surfaceColor,
          borderColor,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <ThemedText type="defaultSemiBold" style={{ color: textColor }}>
            {item.clientName}
          </ThemedText>
          <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>
            {item.productModel}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <ThemedText style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
            {getStatusLabel(item.status)}
          </ThemedText>
        </View>
      </View>

        <View style={styles.ticketDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={{ fontSize: 12, color: secondaryTextColor }}>
              {TRANSLATIONS.phone}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, fontWeight: '500', color: textColor }}>
              {item.clientPhone}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={{ fontSize: 12, color: secondaryTextColor }}>
              {TRANSLATIONS.cost}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, fontWeight: '600', color: tintColor }}>
              {item.cost} RON
            </ThemedText>
          </View>
        </View>

        <View style={styles.ticketFooter}>
          <ThemedText style={{ fontSize: 11, color: secondaryTextColor }}>
            {new Date(item.dateReceived).toLocaleDateString('ro-RO')}
          </ThemedText>
          {item.telegramSent && (
            <ThemedText style={{ fontSize: 11, color: '#00A86B' }}>
              {TRANSLATIONS.sentTelegram}
            </ThemedText>
          )}
        </View>
    </Pressable>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">{TRANSLATIONS.title}</ThemedText>
      </View>

      {/* Dashboard Stats */}
      {stats && (
        <View style={[styles.statsContainer, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={{ color: tintColor }}>
              {stats.totalTickets}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: secondaryTextColor }}>
              {TRANSLATIONS.totalTickets}
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={{ color: '#00A86B' }}>
              {stats.completedTickets}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: secondaryTextColor }}>
              {TRANSLATIONS.completedTickets}
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={{ color: '#FF6B35' }}>
              {stats.pendingTickets}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: secondaryTextColor }}>
              {TRANSLATIONS.pendingTickets}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Search Bar and Sync Button */}
      <View style={styles.searchAndSyncContainer}>
        <View style={[styles.searchContainer, { borderColor, flex: 1 }]}>
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder={TRANSLATIONS.search}
            placeholderTextColor={secondaryTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable
          onPress={handleSync}
          disabled={syncing || loading}
          style={({ pressed }) => [
            styles.syncButton,
            {
              backgroundColor: tintColor,
              opacity: pressed || syncing ? 0.7 : 1,
            },
          ]}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
              Sincronizare
            </ThemedText>
          )}
        </Pressable>
      </View>

      {/* Ticket List */}
      {filteredTickets.length > 0 ? (
        <FlatList
          data={filteredTickets}
          keyExtractor={item => item.id}
          renderItem={renderTicketCard}
          scrollEnabled={true}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <ThemedText type="subtitle">{TRANSLATIONS.noTickets}</ThemedText>
          <ThemedText style={{ color: secondaryTextColor, marginTop: 8 }}>
            {searchQuery ? TRANSLATIONS.noResults : TRANSLATIONS.addNew}
          </ThemedText>
        </View>
      )}

      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push('/new-ticket')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: tintColor,
            opacity: pressed ? 0.8 : 1,
            bottom: insets.bottom + 70,
          },
        ]}
      >
        <ThemedText style={{ color: '#fff', fontSize: 28, fontWeight: '300' }}>+</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  searchAndSyncContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  searchInput: {
    fontSize: 16,
    height: '100%',
  },
  listContent: {
    paddingBottom: 100,
  },
  ticketCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  ticketDetails: {
    marginBottom: 8,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
