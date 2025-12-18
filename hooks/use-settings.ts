/**
 * useSettings Hook
 * Manages app settings and Telegram configuration
 */

import { useState, useEffect, useCallback } from 'react';
import { AppSettings, TelegramConfig } from '@/types/ticket';
import { settingsStorage } from '@/lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsStorage.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (data: Partial<AppSettings>) => {
    try {
      setError(null);
      const updated = await settingsStorage.updateSettings(data);
      setSettings(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update settings';
      setError(message);
      throw err;
    }
  }, []);

  const updateTelegramConfig = useCallback(async (config: TelegramConfig) => {
    try {
      setError(null);
      const updated = await settingsStorage.updateTelegramConfig(config);
      setSettings(prev => (prev ? { ...prev, telegramConfig: updated } : null));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update Telegram config';
      setError(message);
      throw err;
    }
  }, []);

  const updateTechnicianName = useCallback(async (name: string) => {
    try {
      setError(null);
      await settingsStorage.updateTechnicianName(name);
      setSettings(prev => (prev ? { ...prev, technicianName: name } : null));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update technician name';
      setError(message);
      throw err;
    }
  }, []);

  const getTelegramConfig = useCallback(async () => {
    try {
      setError(null);
      return await settingsStorage.getTelegramConfig();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get Telegram config';
      setError(message);
      return { botToken: '', groupId: '' };
    }
  }, []);

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
    updateTelegramConfig,
    updateTechnicianName,
    getTelegramConfig,
  };
}
