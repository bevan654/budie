import React, { useState } from 'react';
import {
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { YStack, XStack, Text, View, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../stores/authStore';
import useThemeStore from '../stores/themeStore';
import useToastStore from '../stores/toastStore';
import { lightColors, darkColors } from '../constants/theme';
import { spacing, borderRadius, fonts } from '../constants/theme';
import { hapticLight } from '../utils/haptics';

export default function SettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [matchNotifs, setMatchNotifs] = useState(true);
  const [likeNotifs, setLikeNotifs] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const colors = isDark ? darkColors : lightColors;
  const signOut = useAuthStore((s) => s.signOut);
  const showToast = useToastStore((s) => s.showToast);

  const SettingRow = ({ icon, iconColor, label, labelColor, value, onPress, rightElement }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingVertical={spacing.md + 2}
        paddingHorizontal={spacing.lg}
        borderBottomWidth={1}
        borderBottomColor={colors.border}
      >
        <XStack alignItems="center" gap={spacing.md}>
          <View
            width={32}
            height={32}
            borderRadius={8}
            justifyContent="center"
            alignItems="center"
            backgroundColor={iconColor + '15'}
          >
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <Text
            fontSize={15}
            fontFamily={fonts.regular}
            color={labelColor || colors.textPrimary}
          >
            {label}
          </Text>
        </XStack>
        {rightElement || (
          <XStack alignItems="center" gap={spacing.xs}>
            {value && (
              <Text fontSize={13} fontFamily={fonts.regular} color={colors.textTertiary}>
                {value}
              </Text>
            )}
            {onPress && (
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            )}
          </XStack>
        )}
      </XStack>
    </TouchableOpacity>
  );

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
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
    ]);
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
            Alert.alert(
              'Account Deletion',
              'Please contact support@budie.app to complete account deletion.'
            );
          },
        },
      ]
    );
  };

  return (
    <YStack flex={1} backgroundColor={colors.background}>
      {/* Header */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingTop={insets.top + 12}
        paddingHorizontal={spacing.xl}
        paddingBottom={spacing.lg}
        borderBottomWidth={1}
        backgroundColor={colors.background}
        borderBottomColor={colors.border}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          fontSize={20}
          fontFamily={fonts.semiBold}
          color={colors.textPrimary}
          letterSpacing={-0.1}
        >
          Settings
        </Text>
        <View width={36} height={36} />
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <YStack marginTop={spacing.xxl} paddingHorizontal={spacing.xl}>
          <Text
            fontSize={13}
            fontFamily={fonts.medium}
            textTransform="uppercase"
            letterSpacing={0.5}
            marginBottom={spacing.sm}
            paddingHorizontal={spacing.xs}
            color={colors.textTertiary}
          >
            Appearance
          </Text>
          <View
            borderRadius={borderRadius.md}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.cardBackground}
            borderColor={colors.border}
          >
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
        </YStack>

        {/* Notifications */}
        <YStack marginTop={spacing.xxl} paddingHorizontal={spacing.xl}>
          <Text
            fontSize={13}
            fontFamily={fonts.medium}
            textTransform="uppercase"
            letterSpacing={0.5}
            marginBottom={spacing.sm}
            paddingHorizontal={spacing.xs}
            color={colors.textTertiary}
          >
            Notifications
          </Text>
          <View
            borderRadius={borderRadius.md}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.cardBackground}
            borderColor={colors.border}
          >
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
        </YStack>

        {/* Discovery */}
        <YStack marginTop={spacing.xxl} paddingHorizontal={spacing.xl}>
          <Text
            fontSize={13}
            fontFamily={fonts.medium}
            textTransform="uppercase"
            letterSpacing={0.5}
            marginBottom={spacing.sm}
            paddingHorizontal={spacing.xs}
            color={colors.textTertiary}
          >
            Discovery
          </Text>
          <View
            borderRadius={borderRadius.md}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.cardBackground}
            borderColor={colors.border}
          >
            <SettingRow
              icon="location"
              iconColor={colors.success}
              label="Location"
              value="On Campus"
              onPress={() => {
                hapticLight();
                showToast({ message: 'Coming soon!', type: 'info' });
              }}
            />
            <SettingRow
              icon="school"
              iconColor={colors.primary}
              label="University"
              value="Set Up"
              onPress={() => {
                hapticLight();
                showToast({ message: 'Coming soon!', type: 'info' });
              }}
            />
            <SettingRow
              icon="eye"
              iconColor={colors.purple}
              label="Profile Visibility"
              value="Everyone"
              onPress={() => {
                hapticLight();
                showToast({ message: 'Coming soon!', type: 'info' });
              }}
            />
          </View>
        </YStack>

        {/* Privacy & Security */}
        <YStack marginTop={spacing.xxl} paddingHorizontal={spacing.xl}>
          <Text
            fontSize={13}
            fontFamily={fonts.medium}
            textTransform="uppercase"
            letterSpacing={0.5}
            marginBottom={spacing.sm}
            paddingHorizontal={spacing.xs}
            color={colors.textTertiary}
          >
            Privacy & Security
          </Text>
          <View
            borderRadius={borderRadius.md}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.cardBackground}
            borderColor={colors.border}
          >
            <SettingRow
              icon="lock-closed"
              iconColor={colors.grey}
              label="Privacy Settings"
              onPress={() => {
                hapticLight();
                showToast({ message: 'Coming soon!', type: 'info' });
              }}
            />
            <SettingRow
              icon="ban"
              iconColor={colors.error}
              label="Blocked Users"
              onPress={() => {
                hapticLight();
                showToast({ message: 'Coming soon!', type: 'info' });
              }}
            />
            <SettingRow
              icon="shield-checkmark"
              iconColor={colors.success}
              label="Two-Factor Auth"
              value="Off"
              onPress={() => {
                hapticLight();
                showToast({ message: 'Coming soon!', type: 'info' });
              }}
            />
          </View>
        </YStack>

        {/* Help & Support */}
        <YStack marginTop={spacing.xxl} paddingHorizontal={spacing.xl}>
          <Text
            fontSize={13}
            fontFamily={fonts.medium}
            textTransform="uppercase"
            letterSpacing={0.5}
            marginBottom={spacing.sm}
            paddingHorizontal={spacing.xs}
            color={colors.textTertiary}
          >
            Help & Support
          </Text>
          <View
            borderRadius={borderRadius.md}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.cardBackground}
            borderColor={colors.border}
          >
            <SettingRow
              icon="help-circle"
              iconColor={colors.primary}
              label="Help Center"
              onPress={() => {
                hapticLight();
                showToast({ message: 'Coming soon!', type: 'info' });
              }}
            />
            <SettingRow
              icon="chatbubble-ellipses"
              iconColor={colors.warning}
              label="Contact Support"
              onPress={() => {
                hapticLight();
                Linking.openURL('mailto:support@budie.app');
              }}
            />
            <SettingRow
              icon="flag"
              iconColor={colors.error}
              label="Report a Problem"
              onPress={() => {
                hapticLight();
                showToast({ message: 'Coming soon!', type: 'info' });
              }}
            />
            <SettingRow
              icon="star"
              iconColor={colors.warning}
              label="Rate budie"
              onPress={() => {
                hapticLight();
                showToast({ message: 'Coming soon!', type: 'info' });
              }}
            />
          </View>
        </YStack>

        {/* Legal */}
        <YStack marginTop={spacing.xxl} paddingHorizontal={spacing.xl}>
          <Text
            fontSize={13}
            fontFamily={fonts.medium}
            textTransform="uppercase"
            letterSpacing={0.5}
            marginBottom={spacing.sm}
            paddingHorizontal={spacing.xs}
            color={colors.textTertiary}
          >
            Legal
          </Text>
          <View
            borderRadius={borderRadius.md}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.cardBackground}
            borderColor={colors.border}
          >
            <SettingRow
              icon="document-text"
              iconColor={colors.grey}
              label="Terms of Service"
              onPress={() => {
                hapticLight();
                Linking.openURL('https://budie.app/terms');
              }}
            />
            <SettingRow
              icon="shield"
              iconColor={colors.grey}
              label="Privacy Policy"
              onPress={() => {
                hapticLight();
                Linking.openURL('https://budie.app/privacy');
              }}
            />
            <SettingRow
              icon="information-circle"
              iconColor={colors.grey}
              label="Licenses"
              onPress={() => {
                hapticLight();
                showToast({ message: 'Coming soon!', type: 'info' });
              }}
            />
          </View>
        </YStack>

        {/* Account */}
        <YStack marginTop={spacing.xxl} paddingHorizontal={spacing.xl}>
          <Text
            fontSize={13}
            fontFamily={fonts.medium}
            textTransform="uppercase"
            letterSpacing={0.5}
            marginBottom={spacing.sm}
            paddingHorizontal={spacing.xs}
            color={colors.textTertiary}
          >
            Account
          </Text>
          <View
            borderRadius={borderRadius.md}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.cardBackground}
            borderColor={colors.border}
          >
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
        </YStack>

        {/* Version */}
        <Text
          textAlign="center"
          fontSize={11}
          letterSpacing={0.2}
          marginTop={spacing.xxl}
          color={colors.textTertiary}
        >
          budie v1.0.0
        </Text>

        {/* Bottom spacer */}
        <View height={40} />
      </ScrollView>
    </YStack>
  );
}
