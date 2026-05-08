import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  AppState,
  Vibration,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import {
  usePomodoroSettings,
  POMODORO_LIMITS,
} from '../../hooks/usePomodoroSettings';
import {
  useFocusModeSettings,
  FOCUS_APPS,
  FOCUS_MODE,
} from '../../hooks/useFocusModeSettings';
import FocusModeSheet from './FocusModeSheet';

const MODE = { POMODORO: 'pomodoro', STOPWATCH: 'stopwatch' };
const PHASE = { FOCUS: 'focus', SHORT_BREAK: 'shortBreak', LONG_BREAK: 'longBreak' };
const SESSION = { SOLO: 'solo', PARTNER: 'partner', GROUP: 'group' };

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}
const PLACEHOLDER_MATCHES = [
  { id: '1', name: 'Alex', course: 'Computer Science', year: '2nd year' },
  { id: '2', name: 'Sam', course: 'Mathematics', year: '3rd year' },
  { id: '3', name: 'Ria', course: 'Biology', year: '1st year' },
  { id: '4', name: 'Jordan', course: 'Physics', year: '2nd year' },
  { id: '5', name: 'Maya', course: 'Engineering', year: '4th year' },
  { id: '6', name: 'Theo', course: 'Economics', year: '3rd year' },
];
const AVATAR_PALETTE = ['#6C7BF0', '#F59E0B', '#34D399', '#F472B6', '#A78BFA'];

function Avatar({ name, color, bg, size = 24 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: size * 0.45,
          color,
        }}
      >
        {(name || '?').slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}

const PHASE_LABEL = {
  [PHASE.FOCUS]: 'Focus',
  [PHASE.SHORT_BREAK]: 'Short break',
  [PHASE.LONG_BREAK]: 'Long break',
};

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function phaseDurationSeconds(phase, settings) {
  switch (phase) {
    case PHASE.FOCUS:
      return settings.focusMinutes * 60;
    case PHASE.SHORT_BREAK:
      return settings.shortBreakMinutes * 60;
    case PHASE.LONG_BREAK:
      return settings.longBreakMinutes * 60;
    default:
      return 0;
  }
}

export default function StudyTimer({ onSessionComplete }) {
  const { colors, isDark } = useTheme();
  const { settings, updateSettings } = usePomodoroSettings();
  const { settings: focusSettings, updateSettings: updateFocusSettings } =
    useFocusModeSettings();
  const [focusSheetOpen, setFocusSheetOpen] = useState(false);
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);

  const [mode, setMode] = useState(MODE.POMODORO);
  const [sessionType, setSessionType] = useState(SESSION.SOLO);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [partner, setPartner] = useState(null);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [group, setGroup] = useState(null);

  const switchSession = (next) => {
    if (next === sessionType) return;
    Haptics.selectionAsync().catch(() => {});
    setSessionType(next);
  };

  const openInvite = () => {
    Haptics.selectionAsync().catch(() => {});
    setInviteOpen(true);
  };
  const handleSelectPartner = (m) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPartner(m);
    setInviteOpen(false);
  };
  const handlePartnerByCode = (code) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPartner({ id: `code-${code}`, name: 'Buddy', course: `Joined via code ${code}`, code });
    setInviteOpen(false);
  };

  const openGroupSheet = () => {
    Haptics.selectionAsync().catch(() => {});
    setGroupSheetOpen(true);
  };
  const handleCreateGroup = ({ members, code }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setGroup({
      name: members.length > 0 ? `Group of ${members.length + 1}` : 'My group',
      members,
      code,
    });
    setGroupSheetOpen(false);
  };
  const handleJoinGroupByCode = (code) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setGroup({
      name: 'Joined group',
      members: [{ name: 'Member 1' }, { name: 'Member 2' }, { name: 'Member 3' }],
      code,
    });
    setGroupSheetOpen(false);
  };

  // Pomodoro state
  const [phase, setPhase] = useState(PHASE.FOCUS);
  const [completedFocusCount, setCompletedFocusCount] = useState(0);
  const [pomoRemaining, setPomoRemaining] = useState(settings.focusMinutes * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const pomoStartRef = useRef(null);
  const pomoBaseRemainingRef = useRef(settings.focusMinutes * 60);

  // Stopwatch state
  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swStartRef = useRef(null);
  const swBaseElapsedRef = useRef(0);

  // Keep pomodoro remaining in sync with settings when not running and on focus
  useEffect(() => {
    if (!pomoRunning && phase === PHASE.FOCUS && completedFocusCount === 0) {
      setPomoRemaining(settings.focusMinutes * 60);
      pomoBaseRemainingRef.current = settings.focusMinutes * 60;
    }
  }, [settings.focusMinutes, pomoRunning, phase, completedFocusCount]);

  const handlePhaseEnd = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => Vibration.vibrate(400)
    );

    let nextPhase;
    let nextCompletedFocus = completedFocusCount;

    if (phase === PHASE.FOCUS) {
      nextCompletedFocus = completedFocusCount + 1;
      const isLong = nextCompletedFocus % settings.cyclesBeforeLongBreak === 0;
      nextPhase = isLong ? PHASE.LONG_BREAK : PHASE.SHORT_BREAK;
      onSessionComplete?.({
        type: 'pomodoro_focus',
        durationSeconds: settings.focusMinutes * 60,
      });
    } else if (phase === PHASE.LONG_BREAK) {
      nextPhase = PHASE.FOCUS;
      nextCompletedFocus = 0;
    } else {
      nextPhase = PHASE.FOCUS;
    }

    const nextDuration = phaseDurationSeconds(nextPhase, settings);
    setPhase(nextPhase);
    setCompletedFocusCount(nextCompletedFocus);
    setPomoRemaining(nextDuration);
    pomoBaseRemainingRef.current = nextDuration;
    setPomoRunning(false);
  }, [phase, completedFocusCount, settings, onSessionComplete]);

  // Pomodoro tick
  useEffect(() => {
    if (mode !== MODE.POMODORO || !pomoRunning) return;
    const tick = () => {
      const elapsed = (Date.now() - pomoStartRef.current) / 1000;
      const next = pomoBaseRemainingRef.current - elapsed;
      if (next <= 0) {
        setPomoRemaining(0);
        handlePhaseEnd();
      } else {
        setPomoRemaining(next);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [pomoRunning, mode, handlePhaseEnd]);

  // Stopwatch tick
  useEffect(() => {
    if (mode !== MODE.STOPWATCH || !swRunning) return;
    const tick = () => {
      const elapsed = (Date.now() - swStartRef.current) / 1000;
      setSwElapsed(swBaseElapsedRef.current + elapsed);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [swRunning, mode]);

  // Recompute on app foreground (catches up after backgrounding)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') return;
      if (mode === MODE.POMODORO && pomoRunning && pomoStartRef.current) {
        const elapsed = (Date.now() - pomoStartRef.current) / 1000;
        const next = pomoBaseRemainingRef.current - elapsed;
        if (next <= 0) {
          setPomoRemaining(0);
          handlePhaseEnd();
        } else {
          setPomoRemaining(next);
        }
      } else if (mode === MODE.STOPWATCH && swRunning && swStartRef.current) {
        const elapsed = (Date.now() - swStartRef.current) / 1000;
        setSwElapsed(swBaseElapsedRef.current + elapsed);
      }
    });
    return () => sub.remove();
  }, [mode, pomoRunning, swRunning, handlePhaseEnd]);

  // Pomodoro controls
  const startPomodoro = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    pomoStartRef.current = Date.now();
    pomoBaseRemainingRef.current = pomoRemaining;
    setPomoRunning(true);
  };
  const handlePomodoroPlay = () => {
    if (phase === PHASE.FOCUS) {
      Haptics.selectionAsync().catch(() => {});
      setConfirmStartOpen(true);
    } else {
      startPomodoro();
    }
  };
  const confirmAndStart = () => {
    setConfirmStartOpen(false);
    startPomodoro();
  };
  const pausePomodoro = () => {
    Haptics.selectionAsync().catch(() => {});
    setPomoRunning(false);
  };
  const resetPomodoro = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPomoRunning(false);
    setPhase(PHASE.FOCUS);
    setCompletedFocusCount(0);
    const dur = settings.focusMinutes * 60;
    setPomoRemaining(dur);
    pomoBaseRemainingRef.current = dur;
  };

  // Stopwatch controls
  const startStopwatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    swStartRef.current = Date.now();
    swBaseElapsedRef.current = swElapsed;
    setSwRunning(true);
  };
  const pauseStopwatch = () => {
    Haptics.selectionAsync().catch(() => {});
    setSwRunning(false);
  };
  const resetStopwatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSwRunning(false);
    setSwElapsed(0);
    swBaseElapsedRef.current = 0;
  };

  const switchMode = (next) => {
    if (next === mode) return;
    Haptics.selectionAsync().catch(() => {});
    setMode(next);
  };

  // Display values
  const isPomodoro = mode === MODE.POMODORO;
  const isRunning = isPomodoro ? pomoRunning : swRunning;
  const displaySeconds = isPomodoro ? pomoRemaining : swElapsed;
  const displayText = formatTime(displaySeconds);

  const phaseDuration = isPomodoro ? phaseDurationSeconds(phase, settings) : 0;
  const pomodoroProgress = useMemo(() => {
    if (!isPomodoro || phaseDuration <= 0) return 0;
    return Math.max(0, Math.min(1, 1 - pomoRemaining / phaseDuration));
  }, [isPomodoro, phaseDuration, pomoRemaining]);

  const sessionOf = isPomodoro
    ? `${(completedFocusCount % settings.cyclesBeforeLongBreak) + (phase === PHASE.FOCUS ? 1 : 0)} of ${settings.cyclesBeforeLongBreak}`
    : null;

  const phaseColor =
    phase === PHASE.FOCUS
      ? colors.primary
      : phase === PHASE.LONG_BREAK
      ? colors.success
      : colors.warning;
  const phaseColorBg =
    phase === PHASE.FOCUS
      ? colors.primaryLight
      : phase === PHASE.LONG_BREAK
      ? colors.successLight
      : colors.warningLight;

  return (
    <View style={styles.cardless}>
      {/* Session type selector + settings gear */}
      <View style={styles.headerRow}>
        <View style={styles.sessionTypeRow}>
          {[
            { key: SESSION.SOLO, label: 'Solo' },
            { key: SESSION.PARTNER, label: 'Partner' },
            { key: SESSION.GROUP, label: 'Group' },
          ].map((opt) => {
            const active = sessionType === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => switchSession(opt.key)}
                style={styles.sessionTypeButton}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sessionTypeText,
                    {
                      color: active ? colors.textPrimary : colors.textTertiary,
                      fontFamily: active ? 'Inter_700Bold' : 'Inter_500Medium',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {active && (
                  <View
                    style={[
                      styles.sessionTypeUnderline,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          onPress={() => setSettingsOpen(true)}
          style={styles.settingsButton}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.middle}>
        {/* Session info (partner / group) */}
        {sessionType === SESSION.PARTNER && (
          partner ? (
            <View
              style={[
                styles.sessionInfo,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <Avatar
                name={partner.name}
                color={colors.primary}
                bg={colors.primaryLight}
                size={26}
              />
              <Text style={[styles.sessionInfoText, { color: colors.textPrimary }]}>
                Studying with{' '}
                <Text style={{ fontFamily: 'Inter_700Bold' }}>{partner.name}</Text>
              </Text>
              <View style={[styles.sessionDot, { backgroundColor: colors.success }]} />
              <TouchableOpacity onPress={openInvite} hitSlop={8}>
                <Text style={[styles.sessionChangeText, { color: colors.primary }]}>
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={openInvite}
              activeOpacity={0.85}
              style={[styles.inviteButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="person-add" size={16} color="#FFFFFF" />
              <Text style={styles.inviteButtonText}>Invite a buddy</Text>
            </TouchableOpacity>
          )
        )}
        {sessionType === SESSION.GROUP && (
          group ? (
            <View
              style={[
                styles.sessionInfo,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <View style={styles.avatarStack}>
                {group.members.slice(0, 3).map((m, i) => (
                  <View
                    key={i}
                    style={[
                      styles.stackedAvatar,
                      {
                        left: i * 16,
                        borderColor: colors.backgroundSecondary,
                        backgroundColor: AVATAR_PALETTE[i % AVATAR_PALETTE.length],
                      },
                    ]}
                  >
                    <Text style={styles.stackedAvatarText}>
                      {m.name.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.sessionInfoText, { color: colors.textPrimary }]}>
                <Text style={{ fontFamily: 'Inter_700Bold' }}>{group.name}</Text>
                <Text style={{ color: colors.textTertiary }}>
                  {' · '}
                  {group.members.length + 1} studying
                </Text>
              </Text>
              {group.code ? (
                <View style={[styles.codePill, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.codePillText, { color: colors.primary }]}>
                    {group.code}
                  </Text>
                </View>
              ) : null}
              <View style={[styles.sessionDot, { backgroundColor: colors.success }]} />
              <TouchableOpacity onPress={openGroupSheet} hitSlop={8}>
                <Text style={[styles.sessionChangeText, { color: colors.primary }]}>
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={openGroupSheet}
              activeOpacity={0.85}
              style={[styles.inviteButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="people" size={16} color="#FFFFFF" />
              <Text style={styles.inviteButtonText}>Create or join a group</Text>
            </TouchableOpacity>
          )
        )}

        {/* Focus mode active indicator */}
        {isPomodoro && pomoRunning && phase === PHASE.FOCUS && focusSettings.enabled && (
          (() => {
            const total = FOCUS_APPS.length;
            const sel = focusSettings.selected.length;
            const blockingCount =
              focusSettings.mode === FOCUS_MODE.BLOCK ? sel : total - sel;
            return (
              <View
                style={[
                  styles.focusActive,
                  {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                <Text style={[styles.focusActiveText, { color: colors.primary }]}>
                  Focus mode · {blockingCount} blocked
                </Text>
              </View>
            );
          })()
        )}

        {/* Phase pill + session subtitle */}
        <View style={styles.phaseGroup}>
        {isPomodoro ? (
          <>
            <View style={[styles.phasePill, { backgroundColor: phaseColorBg }]}>
              <Text style={[styles.phasePillText, { color: phaseColor }]}>
                {PHASE_LABEL[phase].toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.sessionText, { color: colors.textTertiary }]}>
              Session {sessionOf}
            </Text>
          </>
        ) : (
          <View style={[styles.phasePill, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.phasePillText, { color: colors.primary }]}>
              {(swRunning ? 'Running' : swElapsed > 0 ? 'Paused' : 'Ready').toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Time display */}
      <Text style={[styles.timeText, { color: colors.textPrimary }]}>{displayText}</Text>

        {/* Progress bar (pomodoro only) */}
        {isPomodoro && (
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${pomodoroProgress * 100}%`,
                  backgroundColor: phaseColor,
                },
              ]}
            />
          </View>
        )}
      </View>{/* /middle */}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={isPomodoro ? resetPomodoro : resetStopwatch}
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={
            isRunning
              ? isPomodoro
                ? pausePomodoro
                : pauseStopwatch
              : isPomodoro
              ? handlePomodoroPlay
              : startStopwatch
          }
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={26}
            color="#FFFFFF"
            style={{ marginLeft: isRunning ? 0 : 3 }}
          />
        </TouchableOpacity>

        <View style={styles.secondaryPlaceholder} />
      </View>

      <InvitePartnerSheet
        visible={inviteOpen}
        onClose={() => setInviteOpen(false)}
        matches={PLACEHOLDER_MATCHES}
        selectedId={partner?.id}
        onSelect={handleSelectPartner}
        onJoinByCode={handlePartnerByCode}
      />

      <InviteGroupSheet
        visible={groupSheetOpen}
        onClose={() => setGroupSheetOpen(false)}
        matches={PLACEHOLDER_MATCHES}
        existingMemberIds={group?.members?.map((m) => m.id) || []}
        onCreate={handleCreateGroup}
        onJoinByCode={handleJoinGroupByCode}
      />

      <TimerSettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        mode={mode}
        onModeChange={switchMode}
        settings={settings}
        focusEnabled={focusSettings.enabled}
        onOpenFocus={() => {
          setSettingsOpen(false);
          setTimeout(() => setFocusSheetOpen(true), 200);
        }}
        onChange={(next) => {
          updateSettings(next);
          if (!pomoRunning && phase === PHASE.FOCUS) {
            const dur = next.focusMinutes * 60;
            setPomoRemaining(dur);
            pomoBaseRemainingRef.current = dur;
          }
        }}
      />

      <FocusModeSheet
        visible={focusSheetOpen}
        onClose={() => setFocusSheetOpen(false)}
        settings={focusSettings}
        onChange={updateFocusSettings}
      />

      <ConfirmStartModal
        visible={confirmStartOpen}
        onClose={() => setConfirmStartOpen(false)}
        focusMinutes={settings.focusMinutes}
        focusSettings={focusSettings}
        apps={FOCUS_APPS}
        onStart={confirmAndStart}
        onEditFocus={() => {
          setConfirmStartOpen(false);
          setTimeout(() => setFocusSheetOpen(true), 200);
        }}
      />
    </View>
  );
}

function InvitePartnerSheet({ visible, onClose, matches, selectedId, onSelect, onJoinByCode }) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [enteredCode, setEnteredCode] = useState('');

  useEffect(() => {
    if (!visible) {
      setSearch('');
      setGeneratedCode(null);
      setEnteredCode('');
    }
  }, [visible]);

  const filtered = matches.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.course || '').toLowerCase().includes(search.toLowerCase())
  );

  const generate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setGeneratedCode(generateCode());
  };
  const submitCode = () => {
    if (enteredCode.trim().length < 4) return;
    onJoinByCode?.(enteredCode.trim().toUpperCase());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheetCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
              Invite a buddy
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              Pick someone from your matches
            </Text>
          </View>

          <CodeSection
            generatedCode={generatedCode}
            onGenerate={generate}
            enteredCode={enteredCode}
            onChangeCode={setEnteredCode}
            onSubmitCode={submitCode}
          />

          <View style={[styles.dividerRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>
              or pick a match
            </Text>
          </View>

          <View
            style={[
              styles.searchField,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="search" size={16} color={colors.textTertiary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search matches"
              placeholderTextColor={colors.textTertiary}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <ScrollView
            style={styles.matchesList}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  No matches found
                </Text>
              </View>
            ) : (
              filtered.map((m, i) => {
                const selected = m.id === selectedId;
                const accent = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => onSelect(m)}
                    activeOpacity={0.7}
                    style={[
                      styles.matchRow,
                      selected && {
                        backgroundColor: colors.primaryLight,
                      },
                    ]}
                  >
                    <View
                      style={[styles.matchAvatar, { backgroundColor: accent }]}
                    >
                      <Text style={styles.matchAvatarText}>
                        {m.name.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.matchName, { color: colors.textPrimary }]}>
                        {m.name}
                      </Text>
                      <Text style={[styles.matchMeta, { color: colors.textSecondary }]}>
                        {m.course}{m.year ? ` · ${m.year}` : ''}
                      </Text>
                    </View>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    ) : (
                      <Ionicons name="add-circle-outline" size={22} color={colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CodeSection({ generatedCode, onGenerate, enteredCode, onChangeCode, onSubmitCode }) {
  const { colors } = useTheme();
  const canSubmit = enteredCode.trim().length >= 4;

  return (
    <View style={styles.codeSection}>
      {generatedCode ? (
        <View
          style={[
            styles.generatedBox,
            { backgroundColor: colors.primaryLight, borderColor: colors.primary },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.generatedLabel, { color: colors.primary }]}>
              SHARE THIS CODE
            </Text>
            <Text style={[styles.generatedCode, { color: colors.primary }]}>
              {generatedCode}
            </Text>
          </View>
          <TouchableOpacity onPress={onGenerate} hitSlop={8}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onGenerate}
          activeOpacity={0.85}
          style={[styles.generateButton, { backgroundColor: colors.primaryLight }]}
        >
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={[styles.generateButtonText, { color: colors.primary }]}>
            Generate a code
          </Text>
        </TouchableOpacity>
      )}

      <View
        style={[
          styles.codeInputRow,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="keypad-outline" size={16} color={colors.textTertiary} />
        <TextInput
          value={enteredCode}
          onChangeText={(t) => onChangeCode(t.toUpperCase())}
          placeholder="Enter a code"
          placeholderTextColor={colors.textTertiary}
          style={[styles.searchInput, { color: colors.textPrimary, letterSpacing: 2 }]}
          autoCorrect={false}
          autoCapitalize="characters"
          maxLength={8}
        />
        <TouchableOpacity
          onPress={onSubmitCode}
          disabled={!canSubmit}
          style={[
            styles.codeSubmit,
            {
              backgroundColor: canSubmit ? colors.primary : colors.border,
              opacity: canSubmit ? 1 : 0.6,
            },
          ]}
        >
          <Text style={styles.codeSubmitText}>Join</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InviteGroupSheet({ visible, onClose, matches, existingMemberIds, onCreate, onJoinByCode }) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set(existingMemberIds || []));
  const [generatedCode, setGeneratedCode] = useState(null);
  const [enteredCode, setEnteredCode] = useState('');

  useEffect(() => {
    if (!visible) {
      setSearch('');
      setSelected(new Set(existingMemberIds || []));
      setGeneratedCode(null);
      setEnteredCode('');
    }
  }, [visible, existingMemberIds]);

  const filtered = matches.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.course || '').toLowerCase().includes(search.toLowerCase())
  );

  const generate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setGeneratedCode(generateCode());
  };
  const submitCode = () => {
    if (enteredCode.trim().length < 4) return;
    onJoinByCode?.(enteredCode.trim().toUpperCase());
  };

  const toggle = (id) => {
    Haptics.selectionAsync().catch(() => {});
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const create = () => {
    const members = matches.filter((m) => selected.has(m.id));
    onCreate({ members, code: generatedCode });
  };

  const canCreate = selected.size > 0 || generatedCode != null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheetCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
              Create or join a group
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              Generate a code, enter one, or pick from your matches
            </Text>
          </View>

          <CodeSection
            generatedCode={generatedCode}
            onGenerate={generate}
            enteredCode={enteredCode}
            onChangeCode={setEnteredCode}
            onSubmitCode={submitCode}
          />

          <View style={[styles.dividerRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>
              or pick matches
            </Text>
          </View>

          <View
            style={[
              styles.searchField,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="search" size={16} color={colors.textTertiary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search matches"
              placeholderTextColor={colors.textTertiary}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <ScrollView
            style={styles.matchesList}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  No matches found
                </Text>
              </View>
            ) : (
              filtered.map((m, i) => {
                const isSelected = selected.has(m.id);
                const accent = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => toggle(m.id)}
                    activeOpacity={0.7}
                    style={[
                      styles.matchRow,
                      isSelected && {
                        backgroundColor: colors.primaryLight,
                      },
                    ]}
                  >
                    <View style={[styles.matchAvatar, { backgroundColor: accent }]}>
                      <Text style={styles.matchAvatarText}>
                        {m.name.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.matchName, { color: colors.textPrimary }]}>
                        {m.name}
                      </Text>
                      <Text style={[styles.matchMeta, { color: colors.textSecondary }]}>
                        {m.course}{m.year ? ` · ${m.year}` : ''}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={22} color={colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={create}
            disabled={!canCreate}
            activeOpacity={0.85}
            style={[
              styles.groupCreateButton,
              {
                backgroundColor: canCreate ? colors.primary : colors.border,
                opacity: canCreate ? 1 : 0.6,
              },
            ]}
          >
            <Text style={styles.groupCreateText}>
              {generatedCode
                ? `Start group${selected.size > 0 ? ` with ${selected.size}` : ''}`
                : selected.size > 0
                ? `Start group with ${selected.size}`
                : 'Pick at least one'}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ConfirmStartModal({
  visible,
  onClose,
  focusMinutes,
  focusSettings,
  apps,
  onStart,
  onEditFocus,
}) {
  const { colors } = useTheme();
  const focusOn = focusSettings.enabled;
  const isBlock = focusSettings.mode === FOCUS_MODE.BLOCK;
  const blocked = isBlock
    ? apps.filter((a) => focusSettings.selected.includes(a.key))
    : apps.filter((a) => !focusSettings.selected.includes(a.key));
  const allowed = isBlock
    ? apps.filter((a) => !focusSettings.selected.includes(a.key))
    : apps.filter((a) => focusSettings.selected.includes(a.key));
  const headline = !focusOn
    ? 'Focus mode is off'
    : isBlock
    ? `Blocking ${blocked.length} app${blocked.length === 1 ? '' : 's'}`
    : `Allowing ${allowed.length} app${allowed.length === 1 ? '' : 's'}`;
  const display = isBlock ? blocked : allowed;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.confirmIcon,
              {
                backgroundColor: focusOn
                  ? colors.primaryLight
                  : colors.backgroundSecondary,
              },
            ]}
          >
            <Ionicons
              name={focusOn ? 'shield-checkmark' : 'shield-outline'}
              size={26}
              color={focusOn ? colors.primary : colors.textTertiary}
            />
          </View>

          <Text style={[styles.modalTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
            Ready to focus?
          </Text>
          <Text
            style={[
              styles.modalSubtitle,
              { color: colors.textSecondary, textAlign: 'center', marginBottom: 12 },
            ]}
          >
            {focusMinutes} minute focus session
          </Text>

          <View style={styles.confirmHeadlineRow}>
            {focusOn && (
              <View
                style={[
                  styles.confirmModePill,
                  {
                    backgroundColor: isBlock ? colors.errorLight : colors.successLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.confirmModePillText,
                    { color: isBlock ? colors.error : colors.success },
                  ]}
                >
                  {isBlock ? 'BLOCK LIST' : 'ALLOW LIST'}
                </Text>
              </View>
            )}
            <Text style={[styles.confirmHeadline, { color: colors.textPrimary }]}>
              {headline}
            </Text>
            {!focusOn && (
              <Text
                style={[
                  styles.confirmHeadlineSub,
                  { color: colors.textTertiary, textAlign: 'center' },
                ]}
              >
                Turn it on to block distracting apps during this session
              </Text>
            )}
          </View>

          {focusOn ? (
            display.length === 0 ? (
              <View
                style={[
                  styles.confirmEmpty,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Text style={[styles.confirmEmptyText, { color: colors.textTertiary }]}>
                  No apps selected
                </Text>
              </View>
            ) : (
              <View style={styles.confirmAppGrid}>
                {display.slice(0, 8).map((app) => (
                  <View key={app.key} style={styles.confirmAppItem}>
                    <View
                      style={[
                        styles.confirmAppIcon,
                        { backgroundColor: app.color + '22' },
                      ]}
                    >
                      <Ionicons name={app.icon} size={18} color={app.color} />
                    </View>
                    <Text
                      style={[styles.confirmAppName, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {app.name}
                    </Text>
                  </View>
                ))}
                {display.length > 8 && (
                  <View style={styles.confirmAppItem}>
                    <View
                      style={[
                        styles.confirmAppIcon,
                        { backgroundColor: colors.backgroundSecondary },
                      ]}
                    >
                      <Text style={[styles.confirmAppMore, { color: colors.textSecondary }]}>
                        +{display.length - 8}
                      </Text>
                    </View>
                    <Text
                      style={[styles.confirmAppName, { color: colors.textSecondary }]}
                    >
                      more
                    </Text>
                  </View>
                )}
              </View>
            )
          ) : null}

          {onEditFocus && (
            <TouchableOpacity onPress={onEditFocus} style={styles.confirmEditLink}>
              <Ionicons
                name={focusOn ? 'settings-outline' : 'shield-checkmark'}
                size={14}
                color={colors.primary}
              />
              <Text style={[styles.confirmEditText, { color: colors.primary }]}>
                {focusOn ? 'Edit list' : 'Turn on focus mode'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalButton, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onStart}
              style={[
                styles.modalButton,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                Start session
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TimerSettingsModal({ visible, onClose, mode, onModeChange, settings, onChange, focusEnabled, onOpenFocus }) {
  const { colors, isDark } = useTheme();
  const [draft, setDraft] = useState(settings);
  const [draftMode, setDraftMode] = useState(mode);

  useEffect(() => {
    setDraft(settings);
    setDraftMode(mode);
  }, [settings, mode, visible]);

  const fields = [
    { key: 'focusMinutes', label: 'Focus', suffix: 'min' },
    { key: 'shortBreakMinutes', label: 'Short break', suffix: 'min' },
    { key: 'longBreakMinutes', label: 'Long break', suffix: 'min' },
    { key: 'cyclesBeforeLongBreak', label: 'Cycles before long break', suffix: '' },
  ];

  const adjust = (key, delta) => {
    const limits = POMODORO_LIMITS[key];
    const next = Math.max(limits.min, Math.min(limits.max, draft[key] + delta));
    if (next === draft[key]) return;
    Haptics.selectionAsync().catch(() => {});
    setDraft({ ...draft, [key]: next });
  };

  const save = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (draftMode !== mode) onModeChange(draftMode);
    if (draftMode === MODE.POMODORO) onChange(draft);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowOpacity: isDark ? 0.4 : 0.15,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Timer</Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            Mode and preferences
          </Text>

          <View style={[styles.modePicker, { backgroundColor: colors.backgroundSecondary }]}>
            {[
              { key: MODE.POMODORO, label: 'Pomodoro' },
              { key: MODE.STOPWATCH, label: 'Stopwatch' },
            ].map((opt) => {
              const active = draftMode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setDraftMode(opt.key);
                  }}
                  style={[
                    styles.modePickerButton,
                    active && {
                      backgroundColor: colors.cardBackground,
                      shadowOpacity: isDark ? 0.3 : 0.08,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modePickerText,
                      {
                        color: active ? colors.textPrimary : colors.textSecondary,
                        fontFamily: active ? 'Inter_600SemiBold' : 'Inter_500Medium',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {draftMode === MODE.POMODORO && fields.map((f) => {
            const limits = POMODORO_LIMITS[f.key];
            return (
              <View
                key={f.key}
                style={[styles.settingRow, { borderTopColor: colors.border }]}
              >
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  {f.label}
                </Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    onPress={() => adjust(f.key, -limits.step)}
                    style={[
                      styles.stepperButton,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        opacity: draft[f.key] <= limits.min ? 0.4 : 1,
                      },
                    ]}
                    disabled={draft[f.key] <= limits.min}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={[styles.stepperValue, { color: colors.textPrimary }]}>
                    {draft[f.key]}
                    {f.suffix ? ` ${f.suffix}` : ''}
                  </Text>
                  <TouchableOpacity
                    onPress={() => adjust(f.key, limits.step)}
                    style={[
                      styles.stepperButton,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        opacity: draft[f.key] >= limits.max ? 0.4 : 1,
                      },
                    ]}
                    disabled={draft[f.key] >= limits.max}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {onOpenFocus && (
            <TouchableOpacity
              onPress={onOpenFocus}
              activeOpacity={0.7}
              style={[styles.focusRow, { borderTopColor: colors.border }]}
            >
              <View style={[styles.focusRowIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.focusRowTitle, { color: colors.textPrimary }]}>
                  Focus mode
                </Text>
                <Text style={[styles.focusRowMeta, { color: colors.textSecondary }]}>
                  {focusEnabled ? 'On — block distracting apps' : 'Off'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalButton, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={save}
              style={[styles.modalButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cardless: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionTypeRow: {
    flexDirection: 'row',
    gap: 22,
  },
  sessionTypeButton: {
    paddingVertical: 8,
    alignItems: 'center',
    position: 'relative',
  },
  sessionTypeText: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  sessionTypeUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    borderRadius: 1,
  },
  focusActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'center',
    marginBottom: 14,
  },
  focusActiveText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    paddingBottom: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  focusRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusRowTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  focusRowMeta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 1,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  sessionChangeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginLeft: 2,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
    maxHeight: Dimensions.get('window').height * 0.78,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  sheetHeader: {
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginTop: 2,
  },
  codeSection: {
    gap: 8,
    marginBottom: 12,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  generateButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  generatedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  generatedLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  generatedCode: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 24,
    letterSpacing: 4,
    marginTop: 2,
  },
  codeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  codeSubmit: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },
  codeSubmitText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: -0.2,
  },
  dividerRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dividerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  groupCreateButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  groupCreateText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  codePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 4,
  },
  codePillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    padding: 0,
  },
  matchesList: {
    flexGrow: 0,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  matchAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchAvatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  matchName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  matchMeta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 1,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sessionInfoText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  avatarStack: {
    width: 56,
    height: 26,
    position: 'relative',
  },
  stackedAvatar: {
    position: 'absolute',
    top: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackedAvatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePicker: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  modePickerButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 0,
  },
  modePickerText: {
    fontSize: 14,
  },
  phaseGroup: {
    alignItems: 'center',
    gap: 8,
  },
  phasePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  phasePillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.6,
  },
  sessionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  timeText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 104,
    letterSpacing: -4,
    textAlign: 'center',
    marginVertical: 20,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: 24,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  primaryButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryPlaceholder: {
    width: 48,
    height: 48,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 2,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  settingLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    flex: 1,
    paddingRight: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    minWidth: 60,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  confirmIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  confirmHeadlineRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  confirmModePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  confirmModePillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  confirmHeadline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  confirmHeadlineSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 2,
    paddingHorizontal: 12,
  },
  confirmAppGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 4,
    marginBottom: 8,
  },
  confirmAppItem: {
    width: 60,
    alignItems: 'center',
    gap: 5,
  },
  confirmAppIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmAppName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textAlign: 'center',
  },
  confirmAppMore: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  confirmEmpty: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmEmptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  confirmEditLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    paddingVertical: 6,
  },
  confirmEditText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
});
