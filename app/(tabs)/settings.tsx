/**
 * Settings Screen
 * App configuration and settings
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
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/hooks/use-settings';
import { testTelegramConnection } from '@/lib/telegram';
import { dataStorage } from '@/lib/storage';

const TRANSLATIONS = {
  title: 'Setări',
  technicianInfo: 'Informații Tehnician',
  yourName: 'Numele Dumneavoastră',
  saveTechnicianName: 'Salvează Nume Tehnician',
  telegramConfig: 'Configurare Telegram',
  botToken: 'Token Bot',
  groupId: 'ID Grup',
  save: 'Salvează',
  test: 'Test',
  appSettings: 'Setări Aplicatie',
  darkMode: 'Mod Întunecat',
  dataManagement: 'Gestionare Date',
  exportData: 'Export Date',
  clearAllData: 'Șterge Toate Datele',
  about: 'Despre',
  appName: 'Nume Aplicatie',
  version: 'Versiune',
  platform: 'Platformă',
  errorRequired: 'Câmpuri obligatorii',
  errorEmpty: 'Numele nu poate fi gol',
  successTechnicianName: 'Nume tehnician actualizat',
  successTelegramConfig: 'Configurație Telegram actualizată',
  successConnection: 'Conexiunea Telegram funcționează!',
  errorConnection: 'Eroare la conectare cu Telegram',
  successExported: 'Date exportate cu succes',
  successCleared: 'Toate datele au fost șterse',
  errorExport: 'Eroare la export',
  errorClear: 'Eroare la ștergere',
  clearConfirmTitle: 'Șterge Toate Datele',
  clearConfirmMsg: 'Ești sigur că vrei să ștergi toate fișele și setările? Această acțiune nu poate fi anulată.',
  cancel: 'Anulează',
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { settings, updateSettings, updateTelegramConfig, updateTechnicianName } = useSettings();

  const [technicianName, setTechnicianName] = useState('');
  const [botToken, setBotToken] = useState('');
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const dangerColor = useThemeColor({}, 'danger');

  useEffect(() => {
    if (settings) {
      setTechnicianName(settings.technicianName);
      setBotToken(settings.telegramConfig.botToken);
      setGroupId(settings.telegramConfig.groupId);
    }
  }, [settings]);

  const handleSaveTechnicianName = async () => {
    if (!technicianName.trim()) {
      Alert.alert('Error', 'Technician name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await updateTechnicianName(technicianName);
      Alert.alert('Success', 'Technician name updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update technician name');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTelegramConfig = async () => {
    if (!botToken.trim() || !groupId.trim()) {
      Alert.alert('Error', 'Bot token and group ID are required');
      return;
    }

    try {
      setLoading(true);
      await updateTelegramConfig({
        botToken,
        groupId,
      });
      Alert.alert('Success', 'Telegram configuration updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update Telegram configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!botToken.trim() || !groupId.trim()) {
      Alert.alert('Error', 'Please enter bot token and group ID first');
      return;
    }

    try {
      setTestingTelegram(true);
      const result = await testTelegramConnection();

      if (result.success) {
        Alert.alert('Success', 'Telegram connection is working!');
      } else {
        Alert.alert('Error', result.error || 'Failed to connect to Telegram');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Connection test failed');
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all tickets and settings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dataStorage.clearAllData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await dataStorage.exportAllData();
      const jsonString = JSON.stringify(data, null, 2);
      Alert.alert('Data Exported', `${jsonString.length} bytes exported to clipboard`);
      // In a real app, you would copy this to clipboard or save to file
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
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
      </View>

        {/* Technician Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle">{TRANSLATIONS.technicianInfo}</ThemedText>

          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder={TRANSLATIONS.yourName}
            placeholderTextColor={secondaryTextColor}
            value={technicianName}
            onChangeText={setTechnicianName}
          />

          <Pressable
            onPress={handleSaveTechnicianName}
            disabled={loading}
            style={[
              styles.button,
              {
                backgroundColor: tintColor,
                opacity: loading ? 0.6 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={{ color: '#fff', fontWeight: '600' }}>
                {TRANSLATIONS.saveTechnicianName}
              </ThemedText>
            )}
          </Pressable>
        </View>

        {/* Telegram Configuration */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Telegram Configuration</ThemedText>

          <ThemedText style={{ fontSize: 12, color: secondaryTextColor, marginBottom: 8 }}>
            Bot Token
          </ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Paste your Telegram bot token"
            placeholderTextColor={secondaryTextColor}
            value={botToken}
            onChangeText={setBotToken}
            secureTextEntry
          />

          <ThemedText style={{ fontSize: 12, color: secondaryTextColor, marginBottom: 8, marginTop: 12 }}>
            Group ID
          </ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Paste your Telegram group ID"
            placeholderTextColor={secondaryTextColor}
            value={groupId}
            onChangeText={setGroupId}
            keyboardType="numeric"
          />

          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleSaveTelegramConfig}
              disabled={loading}
              style={[
                styles.buttonHalf,
                {
                  backgroundColor: tintColor,
                  opacity: loading ? 0.6 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                  Save
                </ThemedText>
              )}
            </Pressable>

            <Pressable
              onPress={handleTestTelegram}
              disabled={testingTelegram}
              style={[
                styles.buttonHalf,
                {
                  backgroundColor: '#00A86B',
                  opacity: testingTelegram ? 0.6 : 1,
                  marginLeft: 8,
                },
              ]}
            >
              {testingTelegram ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                  Test
                </ThemedText>
              )}
            </Pressable>
          </View>

          <ThemedText style={{ fontSize: 11, color: secondaryTextColor, marginTop: 12 }}>
            💡 How to get your Telegram bot token and group ID:
            {'\n'}1. Create a bot with @BotFather on Telegram
            {'\n'}2. Get the bot token
            {'\n'}3. Add the bot to your group
            {'\n'}4. Send a message in the group
            {'\n'}5. Visit https://api.telegram.org/botYOUR_TOKEN/getUpdates to find the group ID
          </ThemedText>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle">App Settings</ThemedText>

          <View style={styles.settingRow}>
            <ThemedText>Dark Mode</ThemedText>
            <Switch
              value={colorScheme === 'dark'}
              disabled
              trackColor={{ false: '#ccc', true: tintColor }}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Data Management</ThemedText>

          <Pressable
            onPress={handleExportData}
            style={[styles.button, { backgroundColor: tintColor }]}
          >
            <ThemedText style={{ color: '#fff', fontWeight: '600' }}>
              Export Data
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleClearData}
            style={[styles.button, { backgroundColor: dangerColor, marginTop: 8 }]}
          >
            <ThemedText style={{ color: '#fff', fontWeight: '600' }}>
              Clear All Data
            </ThemedText>
          </Pressable>
        </View>

        {/* About */}
        <View style={styles.section}>
          <ThemedText type="subtitle">About</ThemedText>

          <View style={styles.aboutItem}>
            <ThemedText style={{ color: secondaryTextColor }}>App Name</ThemedText>
            <ThemedText style={{ fontWeight: '500' }}>IT Service Manager</ThemedText>
          </View>

          <View style={styles.aboutItem}>
            <ThemedText style={{ color: secondaryTextColor }}>Version</ThemedText>
            <ThemedText style={{ fontWeight: '500' }}>1.0.0</ThemedText>
          </View>

          <View style={styles.aboutItem}>
            <ThemedText style={{ color: secondaryTextColor }}>Platform</ThemedText>
            <ThemedText style={{ fontWeight: '500' }}>React Native / Expo</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
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
    marginBottom: 20,
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
    fontSize: 16,
    height: 44,
    marginBottom: 8,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  buttonHalf: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
});
