import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@budie_focus_mode';

export const FOCUS_MODE = { BLOCK: 'block', ALLOW: 'allow' };

export const FOCUS_APPS = [
  { key: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
  { key: 'tiktok',    name: 'TikTok',    icon: 'musical-notes',  color: '#FF2D55' },
  { key: 'twitter',   name: 'X',         icon: 'logo-twitter',   color: '#1DA1F2' },
  { key: 'youtube',   name: 'YouTube',   icon: 'logo-youtube',   color: '#FF0000' },
  { key: 'snapchat',  name: 'Snapchat',  icon: 'logo-snapchat',  color: '#FFFC00' },
  { key: 'reddit',    name: 'Reddit',    icon: 'logo-reddit',    color: '#FF4500' },
  { key: 'discord',   name: 'Discord',   icon: 'chatbubbles',    color: '#5865F2' },
  { key: 'whatsapp',  name: 'WhatsApp',  icon: 'logo-whatsapp',  color: '#25D366' },
  { key: 'games',     name: 'Games',     icon: 'game-controller', color: '#A855F7' },
  { key: 'browsers',  name: 'Browsers',  icon: 'globe',          color: '#0EA5E9' },
];

export const DEFAULT_FOCUS_SETTINGS = {
  enabled: false,
  mode: FOCUS_MODE.BLOCK,
  selected: ['instagram', 'tiktok', 'youtube', 'snapchat'],
};

export function useFocusModeSettings() {
  const [settings, setSettings] = useState(DEFAULT_FOCUS_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setSettings({ ...DEFAULT_FOCUS_SETTINGS, ...parsed });
          } catch {}
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const updateSettings = useCallback(async (next) => {
    setSettings(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  return { settings, updateSettings, loaded };
}
