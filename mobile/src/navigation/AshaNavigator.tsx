/**
 * HealthWay ASHA Worker Role Navigator
 * Houses AshaFieldDashboard, BeneficiaryRegistration, HighRiskPregnancy, VoiceIntake, FieldTriage, and shared operational hubs
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AshaStackParamList } from '../types/navigation';
import { AshaFieldDashboardScreen } from '../screens/asha/AshaFieldDashboardScreen';
import { BeneficiaryRegistrationScreen } from '../screens/asha/BeneficiaryRegistrationScreen';
import { HighRiskPregnancyScreen } from '../screens/asha/HighRiskPregnancyScreen';
import { VoiceIntakeScreen } from '../screens/asha/VoiceIntakeScreen';
import { FieldTriageScreen } from '../screens/asha/FieldTriageScreen';
import { DiagnosticsHubScreen } from '../screens/hubs/DiagnosticsHubScreen';
import { ReferralsHubScreen } from '../screens/hubs/ReferralsHubScreen';
import { QueueHubScreen } from '../screens/hubs/QueueHubScreen';
import { MedicineHubScreen } from '../screens/hubs/MedicineHubScreen';
import { EmergencySOSScreen } from '../screens/hubs/EmergencySOSScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<AshaStackParamList>();

export const AshaNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AshaFieldDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.slate.bg },
      }}
    >
      <Stack.Screen name="AshaFieldDashboard" component={AshaFieldDashboardScreen} />
      <Stack.Screen name="BeneficiaryRegistration" component={BeneficiaryRegistrationScreen} />
      <Stack.Screen name="HighRiskPregnancy" component={HighRiskPregnancyScreen} />
      <Stack.Screen name="VoiceIntake" component={VoiceIntakeScreen} />
      <Stack.Screen name="FieldTriage" component={FieldTriageScreen} />
      <Stack.Screen name="DiagnosticsHub" component={DiagnosticsHubScreen} />
      <Stack.Screen name="ReferralsHub" component={ReferralsHubScreen} />
      <Stack.Screen name="QueueHub" component={QueueHubScreen} />
      <Stack.Screen name="MedicineHub" component={MedicineHubScreen} />
      <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
    </Stack.Navigator>
  );
};
