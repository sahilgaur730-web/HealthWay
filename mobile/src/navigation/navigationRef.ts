/**
 * Navigation Reference for Global Programmatic Navigation
 * Allows navigation calls from outside React components (e.g. PortalSwitcher, notifications)
 */
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(name, params);
  }
}
