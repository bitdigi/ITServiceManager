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

const TRANSLATIONS = {
  back: '← Înapoi',
  edit: 'Editează',
  delete: 'Șterge',
  clientInfo: 'Informații Client',
  name: 'Nume',
  phone: 'Telefon',
  email: 'Email',
  productInfo: 'Informații Produs',
  type: 'Tip',
  model: 'Model',
  serialNumber: 'Număr Serie',
  serviceDetails: 'Detalii Service',
  problemDescription: 'Descrierea Problemei',
  diagnostic: 'Diagnostic',
  solutionApplied: 'Soluție Aplicată',
  costAndTechnician: 'Cost & Tehnician',
  cost: 'Cost',
  technician: 'Tehnician',
  dates: 'Date',
  dateReceived: 'Data Primirii',
  dateDelivered: 'Data Predării',
  telegramStatus: 'Status Telegram',
  sentTelegram: '✓ Trimis pe Telegram',
  notSent: '✗ Nu a fost trimis',
  resend: 'Retrimite',
  metadata: 'Metadate',
  id: 'ID',
  created: 'Creat',
  updated: 'Actualizat',
  deleteConfirm: 'Șterge Fișă',
  deleteConfirmMsg: 'Ești sigur că vrei să ștergi această fișă?',
  cancel: 'Anulează',
  successDeleted: 'Fișă ștearsă',
  successSentTelegram: 'Fișă trimisă pe Telegram',
  errorDelete: 'Eroare la ștergere',
  errorSendTelegram: 'Eroare la trimitere pe Telegram',
  notFound: 'Fișă nu a fost găsită',
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
      TRANSLATIONS.deleteConfirm,
      TRANSLATIONS.deleteConfirmMsg,
      [
        { text: TRANSLATIONS.cancel, style: 'cancel' },
        {
          text: TRANSLATIONS.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTicket(id as string);
              Alert.alert('Succes', TRANSLATIONS.successDeleted);
              router.back();
            } catch (error) {
              Alert.alert('Eroare', TRANSLATIONS.errorDelete);
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
        Alert.alert('Succes', TRANSLATIONS.successSentTelegram);
      } else {
        Alert.alert('Eroare', result.error || TRANSLATIONS.errorSendTelegram);
      }
    } catch (error) {
      Alert.alert('Eroare', error instanceof Error ? error.message : TRANSLATIONS.errorSendTelegram);
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
        <ThemedText>{TRANSLATIONS.notFound}</ThemedText>
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
            <ThemedText style={{ color: tintColor, fontSize: 16 }}>{TRANSLATIONS.back}</ThemedText>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push(`/edit-ticket/${ticket.id}` as any)}
              style={styles.headerButton}
            >
              <ThemedText style={{ color: tintColor, fontSize: 14 }}>{TRANSLATIONS.edit}</ThemedText>
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.headerButton}>
              <ThemedText style={{ color: dangerColor, fontSize: 14 }}>{TRANSLATIONS.delete}</ThemedText>
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
          <ThemedText type="subtitle">{TRANSLATIONS.clientInfo}</ThemedText>
          <DetailRow label={TRANSLATIONS.name} value={ticket.clientName} />
          <DetailRow label={TRANSLATIONS.phone} value={ticket.clientPhone} />
          <DetailRow label={TRANSLATIONS.email} value={ticket.clientEmail || 'N/A'} />
        </View>

        {/* Product Information */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.productInfo}</ThemedText>
          <DetailRow label={TRANSLATIONS.type} value={PRODUCT_NAMES[ticket.productType]} />
          <DetailRow label={TRANSLATIONS.model} value={ticket.productModel} />
          <DetailRow label={TRANSLATIONS.serialNumber} value={ticket.productSerialNumber || 'N/A'} />
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.serviceDetails}</ThemedText>
          <DetailSection label={TRANSLATIONS.problemDescription} value={ticket.problemDescription} />
          <DetailSection label={TRANSLATIONS.diagnostic} value={ticket.diagnostic} />
          <DetailSection label={TRANSLATIONS.solutionApplied} value={ticket.solutionApplied} />
        </View>

        {/* Cost & Technician */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.costAndTechnician}</ThemedText>
          <DetailRow label={TRANSLATIONS.cost} value={`${ticket.cost} RON`} />
          <DetailRow label={TRANSLATIONS.technician} value={ticket.technicianName} />
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.dates}</ThemedText>
          <DetailRow
            label={TRANSLATIONS.dateReceived}
            value={new Date(ticket.dateReceived).toLocaleDateString('ro-RO')}
          />
          <DetailRow
            label={TRANSLATIONS.dateDelivered}
            value={
              ticket.dateDelivered
                ? new Date(ticket.dateDelivered).toLocaleDateString('ro-RO')
                : 'N/A'
            }
          />
        </View>

        {/* Telegram Status */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.telegramStatus}</ThemedText>
          <View style={styles.telegramStatus}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: ticket.telegramSent ? successColor : '#999' },
              ]}
            />
            <ThemedText style={{ flex: 1 }}>
              {ticket.telegramSent ? TRANSLATIONS.sentTelegram : TRANSLATIONS.notSent}
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
                  <ThemedText style={{ color: tintColor, fontSize: 12 }}>{TRANSLATIONS.resend}</ThemedText>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.metadata}</ThemedText>
          <DetailRow label={TRANSLATIONS.id} value={ticket.id} />
          <DetailRow
            label={TRANSLATIONS.created}
            value={new Date(ticket.createdAt).toLocaleString('ro-RO')}
          />
          <DetailRow
            label={TRANSLATIONS.updated}
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
