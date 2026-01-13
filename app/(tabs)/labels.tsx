/**
 * Product Labels Screen
 * Generate and print product labels (62mm x 30mm)
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { printProductLabel } from '@/lib/product-label-printer';

const TRANSLATIONS = {
  title: 'Generator Etichete Produse',
  subtitle: 'Creează etichete pentru produse (62mm x 30mm)',
  productName: 'Nume Produs',
  productNamePlaceholder: 'Ex: Incarcator Lenovo ThinkPad',
  specifications: 'Specificații',
  specificationsPlaceholder: 'Ex: 3.25A/20V 65W Usb-C',
  price: 'Preț (RON)',
  pricePlaceholder: 'Ex: 140',
  preview: 'Preview Etichetă',
  print: 'Imprimă Etichetă',
  printing: 'Se imprimă...',
  clear: 'Șterge',
  fillAllFields: 'Completează toate câmpurile',
  printSuccess: 'Etichetă tipărită cu succes',
  printError: 'Eroare la imprimare',
};

export default function LabelsScreen() {
  const insets = useSafeAreaInsets();
  const [productName, setProductName] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [price, setPrice] = useState('');
  const [printing, setPrinting] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  const handlePrint = async () => {
    if (!productName.trim() || !price.trim()) {
      Alert.alert('Atenție', TRANSLATIONS.fillAllFields);
      return;
    }

    try {
      setPrinting(true);
      const result = await printProductLabel({
        productName: productName.trim(),
        specifications: specifications.trim(),
        price: parseFloat(price),
      });

      if (result.success) {
        Alert.alert('Succes', TRANSLATIONS.printSuccess);
        // Clear form after successful print
        handleClear();
      } else {
        Alert.alert('Eroare', result.error || TRANSLATIONS.printError);
      }
    } catch (error) {
      Alert.alert('Eroare', error instanceof Error ? error.message : TRANSLATIONS.printError);
    } finally {
      setPrinting(false);
    }
  };

  const handleClear = () => {
    setProductName('');
    setSpecifications('');
    setPrice('');
  };

  const generatePreview = () => {
    if (!productName.trim() && !specifications.trim() && !price.trim()) {
      return 'Completează câmpurile pentru a vedea preview-ul';
    }

    return `${productName}\n${specifications}\nPRET ${price} RON`;
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">{TRANSLATIONS.title}</ThemedText>
          <ThemedText style={[styles.subtitle, { color: secondaryTextColor }]}>
            {TRANSLATIONS.subtitle}
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Product Name */}
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              {TRANSLATIONS.productName} *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                },
              ]}
              value={productName}
              onChangeText={setProductName}
              placeholder={TRANSLATIONS.productNamePlaceholder}
              placeholderTextColor={secondaryTextColor}
              maxLength={50}
            />
          </View>

          {/* Specifications */}
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              {TRANSLATIONS.specifications}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                },
              ]}
              value={specifications}
              onChangeText={setSpecifications}
              placeholder={TRANSLATIONS.specificationsPlaceholder}
              placeholderTextColor={secondaryTextColor}
              maxLength={50}
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              {TRANSLATIONS.price} *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                },
              ]}
              value={price}
              onChangeText={setPrice}
              placeholder={TRANSLATIONS.pricePlaceholder}
              placeholderTextColor={secondaryTextColor}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Preview */}
        <View style={styles.previewSection}>
          <ThemedText type="subtitle" style={styles.previewTitle}>
            {TRANSLATIONS.preview}
          </ThemedText>
          <View
            style={[
              styles.previewBox,
              {
                borderColor: borderColor,
                backgroundColor: backgroundColor,
              },
            ]}
          >
            <ThemedText style={styles.previewText}>{generatePreview()}</ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[
              styles.button,
              styles.clearButton,
              { borderColor: borderColor },
            ]}
            onPress={handleClear}
            disabled={printing}
          >
            <ThemedText style={[styles.buttonText, { color: textColor }]}>
              {TRANSLATIONS.clear}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              styles.printButton,
              { backgroundColor: tintColor },
              printing && styles.buttonDisabled,
            ]}
            onPress={handlePrint}
            disabled={printing}
          >
            {printing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
                {TRANSLATIONS.print}
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewTitle: {
    marginBottom: 12,
  },
  previewBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  clearButton: {
    borderWidth: 1,
  },
  printButton: {
    // backgroundColor set dynamically
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
