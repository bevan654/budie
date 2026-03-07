import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import { hapticLight } from '../utils/haptics';

export default function SettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [matchNotifs, setMatchNotifs] = useState(true);
  const [likeNotifs, setLikeNotifs] = useState(false);
  const { signOut } = useAuth();
  const { colors, isDark, toggleTheme, shadows } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const styles = createStyles(colors, insets);

  function SettingRow({ icon, iconColor, label, labelColor, value, onPress, rightElement }) {
    return (
      <TouchableOpacity
        style={styles.option}
        onPress={onPress}
        activeOpacity={onPress ? 0.6 : 1}
        disabled={!onPress}
      >
        <View style={styles.optionLeft}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <Text style={[styles.optionText, labelColor && { color: labelColor }]}>{label}</Text>
        </View>
        {rightElement || (
          <View style={styles.optionRight}>
            {value && <Text style={styles.optionValue}>{value}</Text>}
            {onPress && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data, matches, and messages will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact support@budie.app to complete account deletion.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.section}>
            <SettingRow
              icon="moon"
              iconColor={colors.primary}
              label="Dark Mode"
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.section}>
            <SettingRow
              icon="notifications"
              iconColor={colors.warning}
              label="Push Notifications"
              rightElement={
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
            <SettingRow
              icon="chatbubble"
              iconColor={colors.primary}
              label="Messages"
              rightElement={
                <Switch
                  value={messageNotifs}
                  onValueChange={setMessageNotifs}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
            <SettingRow
              icon="people"
              iconColor={colors.success}
              label="New Matches"
              rightElement={
                <Switch
                  value={matchNotifs}
                  onValueChange={setMatchNotifs}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
            <SettingRow
              icon="heart"
              iconColor={colors.error}
              label="Likes"
              rightElement={
                <Switch
                  value={likeNotifs}
                  onValueChange={setLikeNotifs}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
          </View>
        </View>

        {/* Discovery */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Discovery</Text>
          <View style={styles.section}>
            <SettingRow
              icon="location"
              iconColor={colors.success}
              label="Location"
              value="On Campus"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="school"
              iconColor={colors.primary}
              label="University"
              value="Set Up"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="eye"
              iconColor={colors.purple}
              label="Profile Visibility"
              value="Everyone"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.section}>
            <SettingRow
              icon="lock-closed"
              iconColor={colors.grey}
              label="Privacy Settings"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="ban"
              iconColor={colors.error}
              label="Blocked Users"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="shield-checkmark"
              iconColor={colors.success}
              label="Two-Factor Auth"
              value="Off"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <View style={styles.section}>
            <SettingRow
              icon="help-circle"
              iconColor={colors.primary}
              label="Help Center"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="chatbubble-ellipses"
              iconColor={colors.warning}
              label="Contact Support"
              onPress={() => { hapticLight(); Linking.openURL('mailto:support@budie.app'); }}
            />
            <SettingRow
              icon="flag"
              iconColor={colors.error}
              label="Report a Problem"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="star"
              iconColor={colors.warning}
              label="Rate budie"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
          </View>
        </View>

        {/* Legal */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.section}>
            <SettingRow
              icon="document-text"
              iconColor={colors.grey}
              label="Terms of Service"
              onPress={() => { hapticLight(); Linking.openURL('https://budie.app/terms'); }}
            />
            <SettingRow
              icon="shield"
              iconColor={colors.grey}
              label="Privacy Policy"
              onPress={() => { hapticLight(); Linking.openURL('https://budie.app/privacy'); }}
            />
            <SettingRow
              icon="information-circle"
              iconColor={colors.grey}
              label="Licenses"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.section}>
            <SettingRow
              icon="log-out"
              iconColor={colors.warning}
              label="Sign Out"
              labelColor={colors.warning}
              onPress={handleSignOut}
            />
            <SettingRow
              icon="trash"
              iconColor={colors.error}
              label="Delete Account"
              labelColor={colors.error}
              onPress={handleDeleteAccount}
            />
          </View>
        </View>

        <Text style={styles.version}>budie v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: insets.top + 12,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    backgroundColor: colors.background,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionContainer: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    color: colors.textTertiary,
  },
  section: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  optionValue: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textTertiary,
  },
  version: {
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: spacing.xxl,
    color: colors.textTertiary,
  },
});
