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
import { syncTicketsFromTelegramAuto } from '@/lib/telegram';
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

  // Auto-sync from Telegram on app launch
  useEffect(() => {
    const autoSync = async () => {
      if (settings?.telegramConfig?.botToken && settings?.telegramConfig?.groupId) {
        try {
          const result = await syncTicketsFromTelegramAuto();
          if (result.success && result.imported > 0) {
            console.log(`Auto-synced ${result.imported} tickets from Telegram`);
            await loadTickets();
          }
        } catch (error) {
          console.error('Auto-sync error:', error);
        }
      }
    };
    autoSync();
  }, []);

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
      const result = await syncTicketsFromTelegramAuto();

      if (result.success) {
        // Reload tickets after sync
        await loadTickets();
        Alert.alert('Succes', `${result.imported} fișe sincronizate de pe Telegram`);
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
      in_progress: '#0066CC',
      completed: '#00AA00',
      on_hold: '#FF6666',
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
      style={[
        styles.ticketCard,
        {
          borderColor: borderColor,
          backgroundColor: surfaceColor,
        },
      ]}
    >
      <View style={styles.ticketHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {item.clientName}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: secondaryTextColor, marginTop: 4 }}>
            {item.productModel}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusColor(item.status),
            },
          ]}
        >
          <ThemedText style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
            {getStatusLabel(item.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.ticketDetails}>
        <ThemedText style={{ fontSize: 12, color: secondaryTextColor }}>
          {TRANSLATIONS.phone} {item.clientPhone}
        </ThemedText>
        <ThemedText style={{ fontSize: 12, color: secondaryTextColor, marginTop: 4 }}>
          {TRANSLATIONS.cost} {item.cost} RON
        </ThemedText>
      </View>

      {item.telegramSent && (
        <ThemedText style={{ fontSize: 11, color: '#00AA00', marginTop: 8 }}>
          {TRANSLATIONS.sentTelegram}
        </ThemedText>
      )}
    </Pressable>
  );

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <View
          style={[
            styles.statCard,
            {
              borderColor: borderColor,
              backgroundColor: surfaceColor,
            },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={{ fontSize: 20, color: tintColor }}>
            {stats?.totalTickets || 0}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: secondaryTextColor, marginTop: 4 }}>
            {TRANSLATIONS.totalTickets}
          </ThemedText>
        </View>

        <View
          style={[
            styles.statCard,
            {
              borderColor: borderColor,
              backgroundColor: surfaceColor,
            },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={{ fontSize: 20, color: '#00AA00' }}>
            {stats?.completedTickets || 0}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: secondaryTextColor, marginTop: 4 }}>
            {TRANSLATIONS.completedTickets}
          </ThemedText>
        </View>

        <View
          style={[
            styles.statCard,
            {
              borderColor: borderColor,
              backgroundColor: surfaceColor,
            },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={{ fontSize: 20, color: '#FFA500' }}>
            {stats?.pendingTickets || 0}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: secondaryTextColor, marginTop: 4 }}>
            {TRANSLATIONS.pendingTickets}
          </ThemedText>
        </View>
      </ScrollView>

      {/* Search and Sync */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              borderColor: borderColor,
              color: textColor,
            },
          ]}
          placeholder={TRANSLATIONS.search}
          placeholderTextColor={secondaryTextColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Pressable
          onPress={handleSync}
          disabled={syncing}
          style={[
            styles.syncButton,
            {
              backgroundColor: syncing ? '#ccc' : '#f0f0f0',
            },
          ]}
        >
          {syncing ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <ThemedText style={{ color: '#333', fontSize: 12, fontWeight: '600' }}>
              Sincronizare
            </ThemedText>
          )}
        </Pressable>
      </View>

      {/* Tickets List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : filteredTickets.length === 0 ? (
        <View style={styles.centerContainer}>
          <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
            {searchQuery ? TRANSLATIONS.noResults : TRANSLATIONS.noTickets}
          </ThemedText>
          {!searchQuery && (
            <ThemedText
              style={{
                textAlign: 'center',
                color: secondaryTextColor,
                marginTop: 12,
                fontSize: 14,
              }}
            >
              {TRANSLATIONS.addNew}
            </ThemedText>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          renderItem={renderTicketCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      )}

      {/* FAB Button */}
      <Pressable
        onPress={() => router.push('/new-ticket' as any)}
        style={[
          styles.fab,
          {
            backgroundColor: tintColor,
          },
        ]}
      >
        <ThemedText style={{ color: '#fff', fontSize: 28, fontWeight: '300' }}>
          +
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    height: 44,
  },
  syncButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    height: 44,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
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
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ticketDetails: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
