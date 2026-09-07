/**
 * HealthWay Auth Navigator
 * Houses PublicGateway, Login, RoleSelect, and EmergencySOS
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { PublicGatewayScreen } from '../screens/auth/PublicGatewayScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { EmergencySOSScreen } from '../screens/hubs/EmergencySOSScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PublicGateway"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.slate.bg },
      }}
    >
      <Stack.Screen name="PublicGateway" component={PublicGatewayScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectionScreen} />
      <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
    </Stack.Navigator>
  );
};
