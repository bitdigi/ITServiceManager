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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTickets } from '@/hooks/use-tickets';
import { ServiceTicket, TicketStatus } from '@/types/ticket';
import { getDashboardStats } from '@/lib/reports';

interface DashboardStats {
  totalTickets: number;
  completedTickets: number;
  pendingTickets: number;
  todayTickets: number;
  totalRevenue: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tickets, loading } = useTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filteredTickets, setFilteredTickets] = useState<ServiceTicket[]>([]);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

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
      pending: 'În așteptare',
      in_progress: 'În curs',
      completed: 'Finalizat',
      on_hold: 'Suspendat',
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
          <ThemedText style={{ color: useThemeColor({}, 'textSecondary'), fontSize: 12 }}>
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
          <ThemedText style={{ fontSize: 12, color: useThemeColor({}, 'textSecondary') }}>
            Telefon:
          </ThemedText>
          <ThemedText style={{ fontSize: 12, fontWeight: '500', color: textColor }}>
            {item.clientPhone}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={{ fontSize: 12, color: useThemeColor({}, 'textSecondary') }}>
            Cost:
          </ThemedText>
          <ThemedText style={{ fontSize: 12, fontWeight: '600', color: tintColor }}>
            {item.cost} RON
          </ThemedText>
        </View>
      </View>

      <View style={styles.ticketFooter}>
        <ThemedText style={{ fontSize: 11, color: useThemeColor({}, 'textSecondary') }}>
          {new Date(item.dateReceived).toLocaleDateString('ro-RO')}
        </ThemedText>
        {item.telegramSent && (
          <ThemedText style={{ fontSize: 11, color: '#00A86B' }}>
            ✓ Trimis pe Telegram
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
        <ThemedText type="title">Service Manager</ThemedText>
      </View>

      {/* Dashboard Stats */}
      {stats && (
        <View style={[styles.statsContainer, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={{ color: tintColor }}>
              {stats.totalTickets}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: useThemeColor({}, 'textSecondary') }}>
              Total
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={{ color: '#00A86B' }}>
              {stats.completedTickets}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: useThemeColor({}, 'textSecondary') }}>
              Finalizate
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={{ color: '#FF6B35' }}>
              {stats.pendingTickets}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: useThemeColor({}, 'textSecondary') }}>
              În curs
            </ThemedText>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderColor }]}>
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Cauta client, model..."
          placeholderTextColor={useThemeColor({}, 'textSecondary')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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
          <ThemedText type="subtitle">Nu sunt fișe de service</ThemedText>
          <ThemedText style={{ color: useThemeColor({}, 'textSecondary'), marginTop: 8 }}>
            {searchQuery ? 'Niciun rezultat pentru căutarea ta' : 'Apasă + pentru a adăuga o nouă fișă'}
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
  searchContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
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
