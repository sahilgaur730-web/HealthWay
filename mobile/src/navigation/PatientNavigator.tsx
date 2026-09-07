/**
 * HealthWay Patient Role Navigator
 * Houses PatientDashboard, VitalsTracker, AppointmentBooking, PhrLocker, SymptomTriage, and shared operational hubs
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatientStackParamList } from '../types/navigation';
import { PatientDashboardScreen } from '../screens/patient/PatientDashboardScreen';
import { VitalsTrackerScreen } from '../screens/patient/VitalsTrackerScreen';
import { AppointmentBookingScreen } from '../screens/patient/AppointmentBookingScreen';
import { PhrLockerScreen } from '../screens/patient/PhrLockerScreen';
import { SymptomTriageScreen } from '../screens/patient/SymptomTriageScreen';
import { DiagnosticsHubScreen } from '../screens/hubs/DiagnosticsHubScreen';
import { ReferralsHubScreen } from '../screens/hubs/ReferralsHubScreen';
import { QueueHubScreen } from '../screens/hubs/QueueHubScreen';
import { QueueTVScreen } from '../screens/hubs/QueueTVScreen';
import { MedicineHubScreen } from '../screens/hubs/MedicineHubScreen';
import { EmergencySOSScreen } from '../screens/hubs/EmergencySOSScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<PatientStackParamList>();

export const PatientNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PatientDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.slate.bg },
      }}
    >
      <Stack.Screen name="PatientDashboard" component={PatientDashboardScreen} />
      <Stack.Screen name="VitalsTracker" component={VitalsTrackerScreen} />
      <Stack.Screen name="AppointmentBooking" component={AppointmentBookingScreen} />
      <Stack.Screen name="PhrLocker" component={PhrLockerScreen} />
      <Stack.Screen name="SymptomTriage" component={SymptomTriageScreen} />
      <Stack.Screen name="DiagnosticsHub" component={DiagnosticsHubScreen} />
      <Stack.Screen name="ReferralsHub" component={ReferralsHubScreen} />
      <Stack.Screen name="QueueHub" component={QueueHubScreen} />
      <Stack.Screen name="QueueTV" component={QueueTVScreen} />
      <Stack.Screen name="MedicineHub" component={MedicineHubScreen} />
      <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
    </Stack.Navigator>
  );
};
