/**
 * Edit Ticket Screen
 * Form for editing an existing service ticket
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTickets } from '@/hooks/use-tickets';
import { ServiceTicket, ProductType, TicketStatus } from '@/types/ticket';
import { sendUpdateToTelegram } from '@/lib/telegram';

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
  title: 'Editare Fișă Service',
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
  problemDescription: 'Descriere Problemă *',
  diagnostic: 'Diagnostic *',
  solutionApplied: 'Soluție Aplicată *',
  cost: 'Cost (RON) *',
  status: 'Stare *',
  dateReceived: 'Data Primirii *',
  dateDelivered: 'Data Predării',
  save: 'Salvează',
  success: 'Fișă actualizată cu succes',
  error: 'Eroare',
};

export default function EditTicketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { getTicketById, updateTicket } = useTickets();

  // Get all theme colors at component level (before render)
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const backgroundColor = useThemeColor({}, 'background');
  const buttonBgColor = useThemeColor({}, 'buttonBg');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);

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
  const [dateDelivered, setDateDelivered] = useState<Date | null>(null);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const ticket = await getTicketById(id as string);
      if (ticket) {
        setClientName(ticket.clientName);
        setClientPhone(ticket.clientPhone);
        setClientEmail(ticket.clientEmail);
        setProductType(ticket.productType);
        setProductModel(ticket.productModel);
        setProductSerialNumber(ticket.productSerialNumber);
        setProblemDescription(ticket.problemDescription);
        setDiagnostic(ticket.diagnostic);
        setSolutionApplied(ticket.solutionApplied);
        setCost(ticket.cost.toString());
        setStatus(ticket.status);
        setDateReceived(new Date(ticket.dateReceived));
        if (ticket.dateDelivered) {
          setDateDelivered(new Date(ticket.dateDelivered));
        }
      }
    } catch (error) {
      Alert.alert(TRANSLATIONS.error, 'Nu s-a putut încărca fișa');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateReceived(selectedDate);
    }
  };

  const handleDeliveryDateChange = (event: any, selectedDate?: Date) => {
    setShowDeliveryDatePicker(false);
    if (selectedDate) {
      setDateDelivered(selectedDate);
    }
  };

  const validateForm = (): boolean => {
    if (!clientName.trim()) {
      Alert.alert(TRANSLATIONS.error, 'Nume client obligatoriu');
      return false;
    }
    if (!clientPhone.trim()) {
      Alert.alert(TRANSLATIONS.error, 'Telefon obligatoriu');
      return false;
    }
    if (!productModel.trim()) {
      Alert.alert(TRANSLATIONS.error, 'Model produs obligatoriu');
      return false;
    }
    if (!problemDescription.trim()) {
      Alert.alert(TRANSLATIONS.error, 'Descriere problemă obligatorie');
      return false;
    }
    if (!diagnostic.trim()) {
      Alert.alert(TRANSLATIONS.error, 'Diagnostic obligatoriu');
      return false;
    }
    if (!solutionApplied.trim()) {
      Alert.alert(TRANSLATIONS.error, 'Soluție obligatorie');
      return false;
    }
    if (!cost.trim() || isNaN(parseFloat(cost))) {
      Alert.alert(TRANSLATIONS.error, 'Cost valid obligatoriu');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const updated = await updateTicket(id as string, {
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
        dateReceived: dateReceived.toISOString(),
        dateDelivered: dateDelivered ? dateDelivered.toISOString() : null,
      });

      if (updated) {
        // Send update notification to Telegram
        try {
          await sendUpdateToTelegram(updated);
        } catch (e) {
          console.error('Telegram send error:', e);
        }
        Alert.alert(TRANSLATIONS.success, 'Fișa a fost actualizată cu succes');
        router.back();
      }
    } catch (error) {
      Alert.alert(TRANSLATIONS.error, error instanceof Error ? error.message : 'Eroare la actualizare');
    } finally {
      setSaving(false);
    }
  };

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
            placeholderTextColor={secondaryTextColor}
            value={clientName}
            onChangeText={setClientName}
          />

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.phoneNumber}
            placeholderTextColor={secondaryTextColor}
            value={clientPhone}
            onChangeText={setClientPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.email}
            placeholderTextColor={secondaryTextColor}
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
                      backgroundColor: productType === type.value ? '#0066CC' : '#E8E8E8',
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: productType === type.value ? '#fff' : '#333333',
                      fontSize: 12,
                      fontWeight: '500',
                    }}
                    numberOfLines={1}
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
            placeholderTextColor={secondaryTextColor}
            value={productModel}
            onChangeText={setProductModel}
          />

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.serialNumber}
            placeholderTextColor={secondaryTextColor}
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
            placeholderTextColor={secondaryTextColor}
            value={problemDescription}
            onChangeText={setProblemDescription}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={[styles.textArea, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.diagnostic}
            placeholderTextColor={secondaryTextColor}
            value={diagnostic}
            onChangeText={setDiagnostic}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={[styles.textArea, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.solutionApplied}
            placeholderTextColor={secondaryTextColor}
            value={solutionApplied}
            onChangeText={setSolutionApplied}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.cost}
            placeholderTextColor={secondaryTextColor}
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Status */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.status}</ThemedText>
          <View style={styles.statusButtonsRow}>
            {(['pending', 'in_progress', 'completed', 'on_hold'] as TicketStatus[]).map(s => (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                style={[
                  styles.statusButton,
                  {
                    backgroundColor: status === s ? '#0066CC' : '#E8E8E8',
                  },
                ]}
              >
                <ThemedText
                  style={{
                    color: status === s ? '#fff' : '#333333',
                    fontSize: 11,
                    fontWeight: '500',
                  }}
                  numberOfLines={1}
                >
                  {s === 'pending' ? 'În așteptare' : s === 'in_progress' ? 'În curs' : s === 'completed' ? 'Finalizat' : 'Suspendat'}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.dateReceived}</ThemedText>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, { borderColor, justifyContent: 'center' }]}
          >
            <ThemedText>{dateReceived.toLocaleDateString('ro-RO')}</ThemedText>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={dateReceived}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <ThemedText type="subtitle" style={{ marginTop: 16 }}>
            {TRANSLATIONS.dateDelivered}
          </ThemedText>
          <Pressable
            onPress={() => setShowDeliveryDatePicker(true)}
            style={[styles.input, { borderColor, justifyContent: 'center' }]}
          >
            <ThemedText>{dateDelivered ? dateDelivered.toLocaleDateString('ro-RO') : 'Selectează dată'}</ThemedText>
          </Pressable>

          {showDeliveryDatePicker && (
            <DateTimePicker
              value={dateDelivered || new Date()}
              mode="date"
              display="default"
              onChange={handleDeliveryDateChange}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, { backgroundColor: tintColor, opacity: saving ? 0.6 : 1 }]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {TRANSLATIONS.save}
              </ThemedText>
            )}
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
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
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
});
