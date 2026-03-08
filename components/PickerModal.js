import React, { useState, useMemo } from 'react';
import { Modal, TextInput } from 'react-native';
import { YStack, XStack, View, Text } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { spacing, borderRadius } from '../constants/theme';

export default function PickerModal({
  visible,
  onClose,
  items,
  selectedValue,
  onSelect,
  title,
  searchable = false,
}) {
  const [search, setSearch] = useState('');
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const filteredData = useMemo(() => {
    if (!searchable || !search) return items || [];
    const lower = search.toLowerCase();
    return (items || []).filter((item) => item.toLowerCase().includes(lower));
  }, [items, search, searchable]);

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const handleSelect = (item) => {
    onSelect(item);
    setSearch('');
    onClose();
  };

  const renderItem = ({ item }) => (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingVertical={14}
      paddingHorizontal={spacing.xxl}
      borderBottomWidth={0.5}
      borderBottomColor={colors.border}
      onPress={() => handleSelect(item)}
      pressStyle={{ opacity: 0.6 }}
      cursor="pointer"
    >
      <Text
        flex={1}
        fontSize={15}
        color={colors.textPrimary}
        fontFamily="Inter_400Regular"
      >
        {item}
      </Text>
      {selectedValue === item && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </XStack>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <YStack flex={1} backgroundColor={colors.background}>
        {/* Handle */}
        <YStack alignItems="center" paddingTop={12} paddingBottom={4}>
          <View
            width={36}
            height={4}
            borderRadius={2}
            backgroundColor={colors.border}
          />
        </YStack>

        {/* Header */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={spacing.xxl}
          paddingTop={spacing.lg}
          paddingBottom={spacing.md}
        >
          <Text
            fontSize={20}
            fontFamily="Inter_600SemiBold"
            letterSpacing={-0.1}
            color={colors.textPrimary}
          >
            {title}
          </Text>
          <View
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor={colors.backgroundSecondary}
            justifyContent="center"
            alignItems="center"
            onPress={handleClose}
            cursor="pointer"
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </View>
        </XStack>

        {/* Search */}
        {searchable && (
          <XStack
            alignItems="center"
            marginHorizontal={spacing.xxl}
            marginBottom={spacing.md}
            backgroundColor={colors.backgroundSecondary}
            borderRadius={borderRadius.md}
            borderWidth={1}
            borderColor={colors.border}
            paddingHorizontal={14}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textTertiary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 12,
                fontSize: 15,
                color: colors.textPrimary,
                fontFamily: 'Inter_400Regular',
              }}
              placeholder="Search..."
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </XStack>
        )}

        {/* List */}
        <YStack flex={1}>
          <FlashList
            data={filteredData}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            estimatedItemSize={48}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </YStack>
      </YStack>
    </Modal>
  );
}
