import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Switch,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { FOCUS_APPS, FOCUS_MODE } from '../../hooks/useFocusModeSettings';

export default function FocusModeSheet({ visible, onClose, settings, onChange }) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    if (visible) setDraft(settings);
  }, [visible, settings]);

  const setField = (patch) => {
    Haptics.selectionAsync().catch(() => {});
    setDraft((d) => ({ ...d, ...patch }));
  };

  const toggleApp = (key) => {
    Haptics.selectionAsync().catch(() => {});
    setDraft((d) => {
      const has = d.selected.includes(key);
      return {
        ...d,
        selected: has ? d.selected.filter((k) => k !== key) : [...d.selected, key],
      };
    });
  };

  const save = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onChange(draft);
    onClose();
  };

  const isBlock = draft.mode === FOCUS_MODE.BLOCK;
  const selectedCount = draft.selected.length;
  const totalApps = FOCUS_APPS.length;
  const blockingCount = isBlock ? selectedCount : totalApps - selectedCount;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View style={[styles.shieldWrap, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Focus mode
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Limit distractions during Pomodoro sessions
              </Text>
            </View>
            <Switch
              value={draft.enabled}
              onValueChange={(v) => setField({ enabled: v })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            style={[
              styles.modeRow,
              {
                backgroundColor: colors.backgroundSecondary,
                opacity: draft.enabled ? 1 : 0.5,
              },
            ]}
            pointerEvents={draft.enabled ? 'auto' : 'none'}
          >
            {[
              { key: FOCUS_MODE.BLOCK, label: 'Block list', hint: 'Block these' },
              { key: FOCUS_MODE.ALLOW, label: 'Allow list', hint: 'Only these' },
            ].map((opt) => {
              const active = draft.mode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setField({ mode: opt.key })}
                  style={[
                    styles.modeButton,
                    active && {
                      backgroundColor: colors.cardBackground,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modeLabel,
                      {
                        color: active ? colors.textPrimary : colors.textSecondary,
                        fontFamily: active ? 'Inter_700Bold' : 'Inter_500Medium',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={[styles.modeHint, { color: colors.textTertiary }]}
                  >
                    {opt.hint}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {!draft.enabled
                ? 'Off'
                : isBlock
                ? `Blocking ${blockingCount} ${blockingCount === 1 ? 'app' : 'apps'}`
                : `Only ${selectedCount} ${selectedCount === 1 ? 'app' : 'apps'} allowed`}
            </Text>
            <Text style={[styles.statusHint, { color: colors.textTertiary }]}>
              Activates when a Pomodoro starts
            </Text>
          </View>

          <ScrollView
            style={[styles.list, { opacity: draft.enabled ? 1 : 0.5 }]}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
            pointerEvents={draft.enabled ? 'auto' : 'none'}
          >
            {FOCUS_APPS.map((app) => {
              const selected = draft.selected.includes(app.key);
              const willBeBlocked = isBlock ? selected : !selected;
              return (
                <TouchableOpacity
                  key={app.key}
                  onPress={() => toggleApp(app.key)}
                  activeOpacity={0.7}
                  style={[styles.appRow, { borderBottomColor: colors.border }]}
                >
                  <View
                    style={[
                      styles.appIcon,
                      { backgroundColor: app.color + '22' },
                    ]}
                  >
                    <Ionicons name={app.icon} size={20} color={app.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.appName, { color: colors.textPrimary }]}>
                      {app.name}
                    </Text>
                    <Text
                      style={[
                        styles.appStatus,
                        { color: willBeBlocked ? colors.error : colors.success },
                      ]}
                    >
                      {willBeBlocked ? 'Will be blocked' : 'Allowed'}
                    </Text>
                  </View>
                  <Switch
                    value={selected}
                    onValueChange={() => toggleApp(app.key)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={save}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: Dimensions.get('window').height * 0.85,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  shieldWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 1,
  },
  modeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9,
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
  modeHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    marginTop: 1,
  },
  statusRow: {
    paddingVertical: 14,
    alignItems: 'center',
    gap: 2,
  },
  statusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  statusHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  list: {
    flexGrow: 0,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  appStatus: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
});
