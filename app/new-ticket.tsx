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

const TRANSLATIONS = {
  title: 'Nouă Fișă de Service',
  cancel: 'Anulează',
  clientInfo: 'Informații Client',
  clientName: 'Nume Client *',
  phoneNumber: 'Număr Telefon *',
  email: 'Email (opțional)',
  productInfo: 'Informații Produs',
  productType: 'Tip Produs *',
  productModel: 'Model Produs *',
  serialNumber: 'Număr Serie (opțional)',
  serviceDetails: 'Detalii Service',
  problemDescription: 'Descrierea Problemei *',
  diagnostic: 'Diagnostic *',
  solutionApplied: 'Soluție Aplicată *',
  costAndStatus: 'Cost și Status',
  cost: 'Cost (RON) *',
  status: 'Status',
  dateReceived: 'Data Primirii:',
  saveTicket: 'Salvează Fișă',
  errorRequired: 'Câmp obligatoriu',
  errorValidCost: 'Cost valid necesar',
  successCreated: 'Fișă creată cu succes',
  errorCreating: 'Eroare la crearea fișei',
};

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
      Alert.alert('Eroare', TRANSLATIONS.errorRequired);
      return false;
    }
    if (!clientPhone.trim()) {
      Alert.alert('Eroare', TRANSLATIONS.errorRequired);
      return false;
    }
    if (!productModel.trim()) {
      Alert.alert('Eroare', TRANSLATIONS.errorRequired);
      return false;
    }
    if (!problemDescription.trim()) {
      Alert.alert('Eroare', TRANSLATIONS.errorRequired);
      return false;
    }
    if (!diagnostic.trim()) {
      Alert.alert('Eroare', TRANSLATIONS.errorRequired);
      return false;
    }
    if (!solutionApplied.trim()) {
      Alert.alert('Eroare', TRANSLATIONS.errorRequired);
      return false;
    }
    if (!cost.trim() || isNaN(parseFloat(cost))) {
      Alert.alert('Eroare', TRANSLATIONS.errorValidCost);
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

      Alert.alert('Succes', TRANSLATIONS.successCreated);
      router.back();
    } catch (error) {
      Alert.alert('Eroare', error instanceof Error ? error.message : TRANSLATIONS.errorCreating);
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
          <ThemedText type="title">{TRANSLATIONS.title}</ThemedText>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={{ color: tintColor, fontSize: 16 }}>{TRANSLATIONS.cancel}</ThemedText>
          </Pressable>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.clientInfo}</ThemedText>

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.clientName}
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={clientName}
            onChangeText={setClientName}
          />

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.phoneNumber}
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={clientPhone}
            onChangeText={setClientPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.email}
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={clientEmail}
            onChangeText={setClientEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Product Information */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.productInfo}</ThemedText>

          <View style={[styles.pickerContainer, { borderColor }]}>
            <ThemedText style={{ marginBottom: 8 }}>{TRANSLATIONS.productType}</ThemedText>
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
            placeholder={TRANSLATIONS.productModel}
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={productModel}
            onChangeText={setProductModel}
          />

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.serialNumber}
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={productSerialNumber}
            onChangeText={setProductSerialNumber}
          />
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.serviceDetails}</ThemedText>

          <TextInput
            style={[styles.textArea, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.problemDescription}
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={problemDescription}
            onChangeText={setProblemDescription}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={[styles.textArea, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.diagnostic}
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={diagnostic}
            onChangeText={setDiagnostic}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={[styles.textArea, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.solutionApplied}
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={solutionApplied}
            onChangeText={setSolutionApplied}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Cost and Status */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.costAndStatus}</ThemedText>

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.cost}
            placeholderTextColor={useThemeColor({}, 'textSecondary')}
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
          />

          <View style={[styles.pickerContainer, { borderColor }]}>
            <ThemedText style={{ marginBottom: 8 }}>{TRANSLATIONS.status}</ThemedText>
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
            <ThemedText>{TRANSLATIONS.dateReceived} {dateReceived.toLocaleDateString('ro-RO')}</ThemedText>
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
                {TRANSLATIONS.saveTicket}
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            disabled={loading}
            style={[styles.cancelButton, { borderColor }]}
          >
            <ThemedText style={{ color: textColor, fontWeight: '600', fontSize: 16 }}>
              {TRANSLATIONS.cancel}
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
