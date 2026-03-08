import { useState, useEffect } from 'react';
import { TouchableOpacity, Vibration } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../../stores/authStore';
import useThemeStore from '../../stores/themeStore';
import { lightColors, darkColors } from '../../constants/theme';
import { fonts } from '../../constants/theme';
import { getUnreadMatchCount } from '../../services/matchService';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

const TAB_CONFIG = {
  index: { icon: 'search', iconOutline: 'search-outline', size: 24 },
  likes: { icon: 'heart', iconOutline: 'heart-outline', size: 23 },
  chats: { icon: 'chatbubbles', iconOutline: 'chatbubbles-outline', size: 24 },
  profile: { icon: 'person-circle', iconOutline: 'person-circle-outline', size: 26 },
};

function CustomBottomTabBar({ state, navigation }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.userId);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const loadCount = async () => {
      try {
        const count = await getUnreadMatchCount(userId);
        setUnreadCount(count);
      } catch (_) {}
    };
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <View
      flexDirection="row"
      borderTopWidth={1}
      borderTopColor={colors.border}
      paddingBottom={insets.bottom > 0 ? insets.bottom : 24}
      paddingTop={10}
      backgroundColor={colors.cardBackground}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name];
        if (!config) return null;
        const color = isFocused ? colors.primary : colors.textTertiary;

        const onPress = () => {
          Haptics.selectionAsync().catch(() => Vibration.vibrate(50));
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              height: 50,
            }}
          >
            <View position="relative">
              <Ionicons
                name={isFocused ? config.icon : config.iconOutline}
                size={config.size}
                color={color}
              />
              {route.name === 'chats' && unreadCount > 0 && (
                <View
                  position="absolute"
                  top={-4}
                  right={-10}
                  backgroundColor={colors.primary}
                  borderRadius={9}
                  minWidth={18}
                  height={18}
                  alignItems="center"
                  justifyContent="center"
                  paddingHorizontal={4}
                >
                  <Text fontSize={10} fontFamily={fonts.semiBold} color="#fff">
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <MaterialTopTabs.Screen name="index" />
      <MaterialTopTabs.Screen name="likes" />
      <MaterialTopTabs.Screen name="chats" />
      <MaterialTopTabs.Screen name="profile" />
    </MaterialTopTabs>
  );
}
