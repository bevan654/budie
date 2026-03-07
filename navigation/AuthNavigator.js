import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { SignUpProvider } from '../contexts/SignUpContext';
import LoginScreen from '../screens/LoginScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignUpStep1Email from '../screens/SignUpStep1Email';
import SignUpStep2Name from '../screens/SignUpStep2Name';
import SignUpStep3University from '../screens/SignUpStep3University';
import SignUpStepPreferences from '../screens/SignUpStepPreferences';
import SignUpStepPhotoBio from '../screens/SignUpStepPhotoBio';
import SignUpStep4Account from '../screens/SignUpStep4Account';
import SignUpStep5Review from '../screens/SignUpStep5Review';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <SignUpProvider>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {/* Entry screens with fade transition */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
          }}
        />

        {/* Sign-up steps with horizontal slide transition */}
        <Stack.Screen
          name="SignUpStep1Email"
          component={SignUpStep1Email}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen
          name="SignUpStep2Name"
          component={SignUpStep2Name}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen
          name="SignUpStep3University"
          component={SignUpStep3University}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen
          name="SignUpStepPreferences"
          component={SignUpStepPreferences}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen
          name="SignUpStepPhotoBio"
          component={SignUpStepPhotoBio}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen
          name="SignUpStep4Account"
          component={SignUpStep4Account}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen
          name="SignUpStep5Review"
          component={SignUpStep5Review}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
      </Stack.Navigator>
    </SignUpProvider>
  );
}
