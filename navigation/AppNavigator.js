import React, { useState, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { getUnreadMatchCount } from '../services/matchService';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import LikesScreen from '../screens/LikesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
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
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

const TAB_CONFIG = {
  Home: { active: 'search', inactive: 'search-outline', size: 24 },
  Heart: { active: 'heart', inactive: 'heart-outline', size: 23 },
  Chats: { active: 'chatbubbles', inactive: 'chatbubbles-outline', size: 24 },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline', size: 26 },
};

function TabIcon({ route, focused, activeColor, inactiveColor }) {
  const config = TAB_CONFIG[route];
  const prevFocused = useRef(focused);

  useEffect(() => {
    if (focused && !prevFocused.current) {
      Haptics.selectionAsync().catch(() => Vibration.vibrate(50));
    }
    prevFocused.current = focused;
  }, [focused]);

  return (
    <View style={tabStyles.container}>
      <Ionicons
        name={focused ? config.active : config.inactive}
        size={config.size}
        color={focused ? activeColor : inactiveColor}
      />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
});

export default function AppNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { userId } = useAuth();
  const { colors } = useTheme();

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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon
            route={route.name}
            focused={focused}
            activeColor={colors.primary}
            inactiveColor={colors.textTertiary}
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 84,
          paddingBottom: 24,
          paddingTop: 10,
          backgroundColor: colors.cardBackground,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Heart" component={LikesStack} />
      <Tab.Screen
        name="Chats"
        component={ChatStack}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            fontSize: 10,
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
        }}
      />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
