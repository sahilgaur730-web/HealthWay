/**
 * HealthWay Root Navigator with Evaluator Portal Switcher
 * Mounts AuthNavigator or Role Navigators based on AuthContext state
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, UserRole } from '../context/AuthContext';
import { PortalSwitcher } from '../components/PortalSwitcher';
import { syncEngine } from '../services/syncEngine';
import { AuthNavigator } from './AuthNavigator';
import { PatientNavigator } from './PatientNavigator';
import { AshaNavigator } from './AshaNavigator';
import { DoctorNavigator } from './DoctorNavigator';
import { AdminNavigator } from './AdminNavigator';
import { colors } from '../theme/colors';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, session, switchRole } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(syncEngine.isOnline());

  useEffect(() => {
    const unsub = syncEngine.subscribe(event => {
      if (event.type === 'ONLINE') setIsOnline(true);
      if (event.type === 'OFFLINE') setIsOnline(false);
    });
    return () => unsub();
  }, []);

  const handleToggleOnline = () => {
    const nextState = !isOnline;
    syncEngine.setSimulatedOffline(!nextState);
    setIsOnline(nextState);
  };

  const handleRoleSelected = async (newRole: UserRole) => {
    await switchRole(newRole);
  };

  const renderActiveNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }

    switch (session.role) {
      case 'patient':
        return <PatientNavigator />;
      case 'asha':
        return <AshaNavigator />;
      case 'doctor':
        return <DoctorNavigator />;
      case 'admin':
        return <AdminNavigator />;
      default:
        return <PatientNavigator />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#071A2F" />

      {/* Top Banner Evaluator Switcher Bar */}
      <PortalSwitcher
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        onRoleSelected={handleRoleSelected}
      />

      {/* Active Role or Auth Stack */}
      <View style={styles.container}>
        {renderActiveNavigator()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071A2F',
  },
  container: {
    flex: 1,
    backgroundColor: colors.slate.bg,
  },
});
