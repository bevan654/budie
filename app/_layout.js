import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { TamaguiProvider, YStack } from 'tamagui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import config from '../tamagui.config';
import useAuthStore from '../stores/authStore';
import useThemeStore from '../stores/themeStore';
import useToastStore from '../stores/toastStore';
import Toast from '../components/Toast';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingSpinner';

function AuthGate() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) {
      router.replace('/(auth)/welcome');
    } else if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) return <LoadingSpinner />;

  return <Slot />;
}

export default function RootLayout() {
  const isDark = useThemeStore((s) => s.isDark);
  const initialize = useAuthStore((s) => s.initialize);
  const toast = useToastStore((s) => s.toast);
  const dismissToast = useToastStore((s) => s.dismissToast);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={isDark ? 'dark' : 'light'}>
          <ErrorBoundary>
            <AuthGate />
            <StatusBar style={isDark ? 'light' : 'dark'} />
            {toast && (
              <Toast
                key={toast.key}
                message={toast.message}
                type={toast.type}
                onDismiss={dismissToast}
              />
            )}
          </ErrorBoundary>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
