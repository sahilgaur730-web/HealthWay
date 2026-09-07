/**
 * HealthWay Native Mobile Application Entry Point
 * Government of Maharashtra - Integrated Rural Health Platform
 * Milestone 2: Navigation Hub, Auth & Shared Hubs
 */
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { storageEngine } from './src/storage/storageEngine';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await storageEngine.initialize();
      } catch (err) {
        console.warn('Storage engine initialization notice', err);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
