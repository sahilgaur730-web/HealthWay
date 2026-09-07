/**
 * HealthWay District Administrator Role Navigator
 * Houses AdminDistrictOverview and shared monitoring hubs
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../types/navigation';
import { AdminDistrictOverviewScreen } from '../screens/admin/AdminDistrictOverviewScreen';
import { OutbreakTrackerScreen } from '../screens/admin/OutbreakTrackerScreen';
import { NationalInteropScreen } from '../screens/admin/NationalInteropScreen';
import { DiagnosticsHubScreen } from '../screens/hubs/DiagnosticsHubScreen';
import { ReferralsHubScreen } from '../screens/hubs/ReferralsHubScreen';
import { QueueHubScreen } from '../screens/hubs/QueueHubScreen';
import { MedicineHubScreen } from '../screens/hubs/MedicineHubScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDistrictOverview"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.slate.bg },
      }}
    >
      <Stack.Screen name="AdminDistrictOverview" component={AdminDistrictOverviewScreen} />
      <Stack.Screen name="OutbreakTracker" component={OutbreakTrackerScreen} />
      <Stack.Screen name="NationalInterop" component={NationalInteropScreen} />
      <Stack.Screen name="DiagnosticsHub" component={DiagnosticsHubScreen} />
      <Stack.Screen name="ReferralsHub" component={ReferralsHubScreen} />
      <Stack.Screen name="QueueHub" component={QueueHubScreen} />
      <Stack.Screen name="MedicineHub" component={MedicineHubScreen} />
    </Stack.Navigator>
  );
};
