/**
 * HealthWay Medical Officer / Doctor Role Navigator
 * Houses DoctorOPDQueue, QueueTV, and shared clinical hubs
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DoctorStackParamList } from '../types/navigation';
import { DoctorOPDQueueScreen } from '../screens/doctor/DoctorOPDQueueScreen';
import { DoctorTeleconsultRoomScreen } from '../screens/doctor/DoctorTeleconsultRoomScreen';
import { DigitalRxScreen } from '../screens/doctor/DigitalRxScreen';
import { DiagnosticsHubScreen } from '../screens/hubs/DiagnosticsHubScreen';
import { ReferralsHubScreen } from '../screens/hubs/ReferralsHubScreen';
import { QueueHubScreen } from '../screens/hubs/QueueHubScreen';
import { QueueTVScreen } from '../screens/hubs/QueueTVScreen';
import { MedicineHubScreen } from '../screens/hubs/MedicineHubScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export const DoctorNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DoctorOPDQueue"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.slate.bg },
      }}
    >
      <Stack.Screen name="DoctorOPDQueue" component={DoctorOPDQueueScreen} />
      <Stack.Screen name="DoctorTeleconsultRoom" component={DoctorTeleconsultRoomScreen} />
      <Stack.Screen name="DigitalRx" component={DigitalRxScreen} />
      <Stack.Screen name="DiagnosticsHub" component={DiagnosticsHubScreen} />
      <Stack.Screen name="ReferralsHub" component={ReferralsHubScreen} />
      <Stack.Screen name="QueueHub" component={QueueHubScreen} />
      <Stack.Screen name="QueueTV" component={QueueTVScreen} />
      <Stack.Screen name="MedicineHub" component={MedicineHubScreen} />
    </Stack.Navigator>
  );
};
