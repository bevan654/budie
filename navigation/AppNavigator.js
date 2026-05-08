import React, { useState, useEffect, useRef } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { getUnreadMatchCount } from '../services/matchService';

import HomeScreen from '../screens/HomeScreen';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import StudyScreen from '../screens/StudyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import LikesScreen from '../screens/LikesScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';

const Tab = createMaterialTopTabNavigator();
const InboxTab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={HomeScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeFeedScreen} />
    </Stack.Navigator>
  );
}

function StudyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudyMain" component={StudyScreen} />
    </Stack.Navigator>
  );
}

function LikesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LikesMain" component={LikesScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatMain" component={ChatScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function InboxTabBar({ state, navigation, unreadCount }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        inboxStyles.bar,
        {
          paddingTop: insets.top + 8,
          backgroundColor: colors.cardBackground,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={inboxStyles.brandRow}>
        <View style={inboxStyles.brandWrap}>
          <Text style={[inboxStyles.brand, { color: colors.primary }]}>budie</Text>
          <View style={[inboxStyles.brandDot, { backgroundColor: colors.primary }]} />
        </View>
      </View>
      <View style={inboxStyles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const showBadge = route.name === 'Messages' && unreadCount > 0;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              Haptics.selectionAsync().catch(() => {});
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={inboxStyles.button}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
            >
              <View style={inboxStyles.labelRow}>
                <Text
                  style={[
                    inboxStyles.label,
                    {
                      color: focused ? colors.textPrimary : colors.textTertiary,
                      fontFamily: focused ? 'Inter_700Bold' : 'Inter_500Medium',
                    },
                  ]}
                >
                  {route.name}
                </Text>
                {showBadge && (
                  <View style={[inboxStyles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={inboxStyles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              {focused && (
                <View
                  style={[inboxStyles.underline, { backgroundColor: colors.primary }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function InboxTopTabs() {
  // Read unread count via outer route state isn't trivial; track here instead.
  const [unreadCount, setUnreadCount] = useState(0);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const c = await getUnreadMatchCount(userId);
        if (!cancelled) setUnreadCount(c);
      } catch {}
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [userId]);

  return (
    <InboxTab.Navigator
      tabBar={(props) => <InboxTabBar {...props} unreadCount={unreadCount} />}
      screenOptions={{ swipeEnabled: true, lazy: false }}
    >
      <InboxTab.Screen name="Likes" component={LikesStack} />
      <InboxTab.Screen name="Messages" component={ChatStack} />
    </InboxTab.Navigator>
  );
}

const TAB_CONFIG = {
  Search: { active: 'search', inactive: 'search-outline', size: 24 },
  Inbox: { active: 'heart-circle', inactive: 'heart-circle-outline', size: 28 },
  Home: { active: 'home', inactive: 'home-outline', size: 24 },
  Study: { active: 'book', inactive: 'book-outline', size: 23 },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline', size: 26 },
};

const ROOT_ROUTE_NAMES = new Set([
  'SearchMain',
  'HomeMain',
  'LikesMain',
  'ChatMain',
  'ProfileMain',
  'StudyMain',
]);

function isAtTabRoot(route) {
  const focused = getFocusedRouteNameFromRoute(route);
  if (!focused) return true;
  return ROOT_ROUTE_NAMES.has(focused);
}

const TAB_BAR_HEIGHT = 84;

function CustomTabBar({ state, navigation, unreadCount }) {
  const { colors } = useTheme();
  const prevIndex = useRef(state.index);

  useEffect(() => {
    if (state.index !== prevIndex.current) {
      Haptics.selectionAsync().catch(() => Vibration.vibrate(50));
      prevIndex.current = state.index;
    }
  }, [state.index]);

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const config = TAB_CONFIG[route.name];
        const showBadge = route.name === 'Inbox' && unreadCount > 0;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={styles.tab}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? config.active : config.inactive}
                size={config.size}
                color={focused ? colors.primary : colors.textTertiary}
              />
              {showBadge && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
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

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
});

const inboxStyles = StyleSheet.create({
  bar: {
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    marginBottom: 6,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  brand: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 26,
    letterSpacing: -1,
    lineHeight: 28,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 3,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 22,
  },
  button: {
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 16,
    letterSpacing: -0.3,
  },
  underline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    borderRadius: 1,
  },
  badge: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    lineHeight: 14,
  },
});

export default function AppNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { userId } = useAuth();

  useRealtimeNotifications(userId);

  useEffect(() => {
    if (userId) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const loadUnreadCount = async () => {
    if (!userId) return;
    try {
      const count = await getUnreadMatchCount(userId);
      setUnreadCount(count);
    } catch (error) {
      // Silently fail
    }
  };

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} unreadCount={unreadCount} />}
      screenOptions={({ route }) => ({
        swipeEnabled: route.name !== 'Inbox' && isAtTabRoot(route),
        lazy: false,
        animationEnabled: true,
      })}
    >
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Inbox" component={InboxTopTabs} />
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Study" component={StudyStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
