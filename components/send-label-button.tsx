import React, { useState } from 'react';
import { Pressable, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SendLabelButtonProps {
  ticketId: string;
  clientName: string;
  clientPhone: string;
  defect: string;
  date: string;
  telegramChatId: string;
  deepLinkUrl: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SendLabelButton({
  ticketId,
  clientName,
  clientPhone,
  defect,
  date,
  telegramChatId,
  deepLinkUrl,
  onSuccess,
  onError,
}: SendLabelButtonProps) {
  const [loading, setLoading] = useState(false);
  const tintColor = useThemeColor({}, 'tint');

  const handleSendLabel = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/labels/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          clientName,
          clientPhone,
          defect,
          date,
          telegramChatId,
          deepLinkUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send label');
      }

      const data = await response.json();
      Alert.alert('Succes', 'Etichetă trimisă pe Telegram! ✓');
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Eroare', `Nu s-a putut trimite etichetă: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handleSendLabel}
      disabled={loading}
      style={({ pressed }) => [
        {
          backgroundColor: tintColor,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          opacity: pressed ? 0.8 : 1,
          opacity: loading ? 0.6 : 1,
        },
      ]}
    >
      <ThemedView style={{ alignItems: 'center', backgroundColor: 'transparent' }}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            📤 Trimite Etichetă pe Telegram
          </ThemedText>
        )}
      </ThemedView>
    </Pressable>
  );
}
