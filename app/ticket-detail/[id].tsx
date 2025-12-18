/**
 * Ticket Detail Screen
 * Displays full details of a service ticket
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTickets } from '@/hooks/use-tickets';
import { ServiceTicket, TicketStatus, ProductType } from '@/types/ticket';
import { sendTicketToTelegram } from '@/lib/telegram';

const PRODUCT_NAMES: Record<ProductType, string> = {
  laptop: 'Laptop',
  pc: 'PC',
  phone: 'Telefon',
  printer: 'Imprimantă',
  gps: 'GPS',
  tv: 'TV',
  box: 'Box',
  tablet: 'Tabletă',
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  pending: 'În așteptare',
  in_progress: 'În curs',
  completed: 'Finalizat',
  on_hold: 'Suspendat',
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  pending: '#FFA500',
  in_progress: '#0066CC',
  completed: '#00A86B',
  on_hold: '#FF6B35',
};

export default function TicketDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { getTicketById, deleteTicket, updateTicket } = useTickets();

  const [ticket, setTicket] = useState<ServiceTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [resendingTelegram, setResendingTelegram] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');
  const successColor = useThemeColor({}, 'success');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await getTicketById(id as string);
      setTicket(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load ticket');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Ticket',
      'Are you sure you want to delete this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTicket(id as string);
              Alert.alert('Success', 'Ticket deleted');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete ticket');
            }
          },
        },
      ]
    );
  };

  const handleResendTelegram = async () => {
    if (!ticket) return;

    try {
      setResendingTelegram(true);
      const result = await sendTicketToTelegram(ticket);

      if (result.success) {
        if (result.messageId) {
          await updateTicket(ticket.id, {
            telegramSent: true,
            telegramMessageId: result.messageId,
          });
          setTicket(prev =>
            prev
              ? {
                  ...prev,
                  telegramSent: true,
                  telegramMessageId: result.messageId || null,
                }
              : null
          );
        }
        Alert.alert('Success', 'Ticket sent to Telegram');
      } else {
        Alert.alert('Error', result.error || 'Failed to send to Telegram');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send to Telegram');
    } finally {
      setResendingTelegram(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  if (!ticket) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText>Ticket not found</ThemedText>
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={{ color: tintColor, fontSize: 16 }}>← Back</ThemedText>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push(`/edit-ticket/${ticket.id}` as any)}
              style={styles.headerButton}
            >
              <ThemedText style={{ color: tintColor, fontSize: 14 }}>Edit</ThemedText>
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.headerButton}>
              <ThemedText style={{ color: dangerColor, fontSize: 14 }}>Delete</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[ticket.status] },
          ]}
        >
          <ThemedText style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
            {STATUS_LABELS[ticket.status]}
          </ThemedText>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Client Information</ThemedText>
          <DetailRow label="Name" value={ticket.clientName} />
          <DetailRow label="Phone" value={ticket.clientPhone} />
          <DetailRow label="Email" value={ticket.clientEmail || 'N/A'} />
        </View>

        {/* Product Information */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Product Information</ThemedText>
          <DetailRow label="Type" value={PRODUCT_NAMES[ticket.productType]} />
          <DetailRow label="Model" value={ticket.productModel} />
          <DetailRow label="Serial Number" value={ticket.productSerialNumber || 'N/A'} />
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Service Details</ThemedText>
          <DetailSection label="Problem Description" value={ticket.problemDescription} />
          <DetailSection label="Diagnostic" value={ticket.diagnostic} />
          <DetailSection label="Solution Applied" value={ticket.solutionApplied} />
        </View>

        {/* Cost & Technician */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Cost & Technician</ThemedText>
          <DetailRow label="Cost" value={`${ticket.cost} RON`} />
          <DetailRow label="Technician" value={ticket.technicianName} />
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Dates</ThemedText>
          <DetailRow
            label="Date Received"
            value={new Date(ticket.dateReceived).toLocaleDateString('ro-RO')}
          />
          <DetailRow
            label="Date Delivered"
            value={
              ticket.dateDelivered
                ? new Date(ticket.dateDelivered).toLocaleDateString('ro-RO')
                : 'N/A'
            }
          />
        </View>

        {/* Telegram Status */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Telegram Status</ThemedText>
          <View style={styles.telegramStatus}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: ticket.telegramSent ? successColor : '#999' },
              ]}
            />
            <ThemedText style={{ flex: 1 }}>
              {ticket.telegramSent ? '✓ Sent to Telegram' : '✗ Not sent'}
            </ThemedText>
            {!ticket.telegramSent && (
              <Pressable
                onPress={handleResendTelegram}
                disabled={resendingTelegram}
                style={styles.resendButton}
              >
                {resendingTelegram ? (
                  <ActivityIndicator size="small" color={tintColor} />
                ) : (
                  <ThemedText style={{ color: tintColor, fontSize: 12 }}>Resend</ThemedText>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Metadata</ThemedText>
          <DetailRow label="ID" value={ticket.id} />
          <DetailRow
            label="Created"
            value={new Date(ticket.createdAt).toLocaleString('ro-RO')}
          />
          <DetailRow
            label="Updated"
            value={new Date(ticket.updatedAt).toLocaleString('ro-RO')}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.detailRow, { borderColor }]}>
      <ThemedText style={{ color: secondaryTextColor, fontSize: 14 }}>{label}</ThemedText>
      <ThemedText style={{ color: textColor, fontSize: 14, fontWeight: '500' }}>{value}</ThemedText>
    </View>
  );
}

function DetailSection({ label, value }: { label: string; value: string }) {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.detailSection}>
      <ThemedText style={{ color: secondaryTextColor, fontSize: 12, marginBottom: 4 }}>
        {label}
      </ThemedText>
      <ThemedText style={{ color: textColor, fontSize: 14, lineHeight: 20 }}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  telegramStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  resendButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});
