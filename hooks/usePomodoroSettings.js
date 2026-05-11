import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';
import {
  fetchPomodoroSettings,
  upsertPomodoroSettings,
} from '../services/settingsService';

const STORAGE_KEY = '@budie_pomodoro_settings';

export const DEFAULT_POMODORO_SETTINGS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
};

export const POMODORO_LIMITS = {
  focusMinutes: { min: 5, max: 90, step: 5 },
  shortBreakMinutes: { min: 1, max: 30, step: 1 },
  longBreakMinutes: { min: 5, max: 60, step: 5 },
  cyclesBeforeLongBreak: { min: 2, max: 8, step: 1 },
};

export function usePomodoroSettings() {
  const { userId } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_POMODORO_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setSettings({ ...DEFAULT_POMODORO_SETTINGS, ...parsed });
          } catch {}
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchPomodoroSettings(userId)
      .then((remote) => {
        if (cancelled || !remote) return;
        setSettings({ ...DEFAULT_POMODORO_SETTINGS, ...remote });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remote)).catch(() => {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const updateSettings = useCallback(
    async (next) => {
      setSettings(next);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      if (userId) {
        try {
          await upsertPomodoroSettings(userId, next);
        } catch {}
      }
    },
    [userId]
  );

  return { settings, updateSettings, loaded };
}
