/**
 * New Ticket Screen
 * Form for creating a new service ticket
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTickets } from '@/hooks/use-tickets';
import { useSettings } from '@/hooks/use-settings';
import { ServiceTicket, ProductType, TicketStatus } from '@/types/ticket';
import { sendTicketToTelegram } from '@/lib/telegram';

const PRODUCT_TYPES: { label: string; value: ProductType }[] = [
  { label: 'Laptop', value: 'laptop' },
  { label: 'PC', value: 'pc' },
  { label: 'Telefon', value: 'phone' },
  { label: 'Imprimantă', value: 'printer' },
  { label: 'GPS', value: 'gps' },
  { label: 'TV', value: 'tv' },
  { label: 'Box', value: 'box' },
  { label: 'Tabletă', value: 'tablet' },
];

export default function NewTicketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createTicket } = useTickets();
  const { settings } = useSettings();

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [productType, setProductType] = useState<ProductType>('laptop');
  const [productModel, setProductModel] = useState('');
  const [productSerialNumber, setProductSerialNumber] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [solutionApplied, setSolutionApplied] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<TicketStatus>('pending');
  const [dateReceived, setDateReceived] = useState(new Date());

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateReceived(selectedDate);
    }
  };

  const validateForm = (): boolean => {
    if (!clientName.trim()) {
      Alert.alert('Error', 'Client name is required');
      return false;
    }
    if (!clientPhone.trim()) {
      Alert.alert('Error', 'Client phone is required');
      return false;
    }
    if (!productModel.trim()) {
      Alert.alert('Error', 'Product model is required');
      return false;
    }
    if (!problemDescription.trim()) {
      Alert.alert('Error', 'Problem description is required');
      return false;
    }
    if (!diagnostic.trim()) {
      Alert.alert('Error', 'Diagnostic is required');
      return false;
    }
    if (!solutionApplied.trim()) {
      Alert.alert('Error', 'Solution applied is required');
      return false;
    }
    if (!cost.trim() || isNaN(parseFloat(cost))) {
      Alert.alert('Error', 'Valid cost is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const newTicket = await createTicket({
        clientName,
        clientPhone,
        clientEmail,
        productType,
        productModel,
        productSerialNumber,
        problemDescription,
        diagnostic,
        solutionApplied,
        cost: parseFloat(cost),
        status,
        technicianName: settings?.technicianName || 'Technician',
        dateReceived: dateReceived.toISOString(),
        dateDelivered: null,
        telegramSent: false,
        telegramMessageId: null,
      });

      // Send to Telegram
      const telegramResult = await sendTicketToTelegram(newTicket);
      if (telegramResult.success && telegramResult.messageId) {
        // Update ticket with Telegram info
        await createTicket({
          ...newTicket,
          telegramSent: true,
          telegramMessageId: telegramResult.messageId,
        });
      }

      Alert.alert('Success', 'Ticket created successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

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
          <ThemedText type="title">New Service Ticket</ThemedText>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={{ color: tintColor, fontSize: 16 }}>Cancel</ThemedText>
          </Pressable>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Client Information</ThemedText>

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Client Name *"
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={clientName}
            onChangeText={setClientName}
          />

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Phone Number *"
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={clientPhone}
            onChangeText={setClientPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Email (optional)"
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={clientEmail}
            onChangeText={setClientEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Product Information */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Product Information</ThemedText>

          <View style={[styles.pickerContainer, { borderColor }]}>
            <ThemedText style={{ marginBottom: 8 }}>Product Type *</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productTypeScroll}>
              {PRODUCT_TYPES.map(type => (
                <Pressable
                  key={type.value}
                  onPress={() => setProductType(type.value)}
                  style={[
                    styles.productTypeButton,
                    {
                      backgroundColor: productType === type.value ? tintColor : useThemeColor({}, 'border'),
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: productType === type.value ? '#fff' : textColor,
                      fontSize: 12,
                      fontWeight: '500',
                    }}
                  >
                    {type.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Product Model *"
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={productModel}
            onChangeText={setProductModel}
          />

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Serial Number (optional)"
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={productSerialNumber}
            onChangeText={setProductSerialNumber}
          />
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Service Details</ThemedText>

          <TextInput
            style={[styles.textArea, { borderColor, color: textColor }]}
            placeholder="Problem Description *"
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={problemDescription}
            onChangeText={setProblemDescription}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={[styles.textArea, { borderColor, color: textColor }]}
            placeholder="Diagnostic *"
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={diagnostic}
            onChangeText={setDiagnostic}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={[styles.textArea, { borderColor, color: textColor }]}
            placeholder="Solution Applied *"
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={solutionApplied}
            onChangeText={setSolutionApplied}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Cost and Status */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Cost & Status</ThemedText>

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Cost (RON) *"
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
          />

          <View style={[styles.pickerContainer, { borderColor }]}>
            <ThemedText style={{ marginBottom: 8 }}>Status</ThemedText>
            <View style={styles.statusButtonsRow}>
              {(['pending', 'in_progress', 'completed', 'on_hold'] as TicketStatus[]).map(s => (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor: status === s ? tintColor : useThemeColor({}, 'border'),
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: status === s ? '#fff' : textColor,
                      fontSize: 11,
                      fontWeight: '500',
                    }}
                  >
                    {s === 'pending' ? 'Pending' : s === 'in_progress' ? 'In Progress' : s === 'completed' ? 'Completed' : 'On Hold'}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, { borderColor, justifyContent: 'center' }]}
          >
            <ThemedText>Date Received: {dateReceived.toLocaleDateString('ro-RO')}</ThemedText>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={dateReceived}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleSave}
            disabled={loading}
            style={[
              styles.saveButton,
              {
                backgroundColor: tintColor,
                opacity: loading ? 0.6 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                Save Ticket
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            disabled={loading}
            style={[styles.cancelButton, { borderColor }]}
          >
            <ThemedText style={{ color: textColor, fontWeight: '600', fontSize: 16 }}>
              Cancel
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
    fontSize: 16,
    height: 44,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  productTypeScroll: {
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  productTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
