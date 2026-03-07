import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import { validateEmail, validatePassword, validateRequired } from '../utils/validation';
import { getErrorMessage } from '../utils/errorMessages';
import Button from '../components/Button';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { colors, inputStyles } = useTheme();

  const handleAuth = async () => {
    const nameValidation = !isLogin ? validateRequired(name, 'Name') : { valid: true };
    if (!nameValidation.valid) {
      Alert.alert('Validation Error', nameValidation.message);
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      Alert.alert('Validation Error', passwordValidation.message);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const { data } = await signUp(email, password, name);

        if (data?.user) {
          if (data.user.identities && data.user.identities.length === 0) {
            Alert.alert('Info', 'This email is already registered. Please log in instead.');
            setIsLogin(true);
          } else if (data.session) {
            Alert.alert('Success', 'Account created successfully!');
          } else {
            Alert.alert(
              'Check your email',
              'Please check your email to confirm your account before logging in.'
            );
          }
        } else {
          Alert.alert('Info', 'Signup completed but no user data returned. Try logging in.');
        }
      }
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors, inputStyles);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.brandContainer}>
          <Text style={styles.title}>budie</Text>
          <Text style={styles.subtitle}>Find your perfect study partner</Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Button
            title={isLogin ? 'Log In' : 'Create Account'}
            onPress={handleAuth}
            loading={loading}
            disabled={loading}
            style={{ marginTop: spacing.xl }}
          />

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '}
              <Text style={styles.switchTextBold}>
                {isLogin ? 'Sign Up' : 'Log In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors, inputStyles) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  brandContainer: {
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
    textTransform: 'uppercase',
  },
  input: {
    ...inputStyles.default,
  },
  switchButton: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    padding: spacing.sm,
  },
  switchText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  switchTextBold: {
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
});
