// Mock dependencies
jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(async () => ({ success: true })),
  hasHardwareAsync: jest.fn(async () => true),
  isEnrolledAsync: jest.fn(async () => true),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticateAsync, isLockedOut } from '../../../services/authentication';

describe('Authentication Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Biometric Authentication', () => {
    it('should successfully authenticate with biometrics', async () => {
      const result = await authenticateAsync();
      expect(result.success).toBe(true);
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
    });

    it('should handle authentication failure', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({ success: false });
      
      const result = await authenticateAsync();
      expect(result.success).toBe(false);
    });
  });

  describe('Lockout Mechanism', () => {
    it('should not be locked out initially', async () => {
      const lockoutStatus = await isLockedOut();
      expect(lockoutStatus.locked).toBe(false);
    });

    it('should detect lockout when lockout time is set', async () => {
      const futureTime = Date.now() + 60000; // 1 minute in future
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ count: 5, lockoutUntil: futureTime })
      );

      const lockoutStatus = await isLockedOut();
      expect(lockoutStatus.locked).toBe(true);
      expect(lockoutStatus.remainingTime).toBeGreaterThan(0);
    });

    it('should clear lockout after expiry', async () => {
      const pastTime = Date.now() - 1000; // 1 second ago
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ count: 5, lockoutUntil: pastTime })
      );

      const lockoutStatus = await isLockedOut();
      expect(lockoutStatus.locked).toBe(false);
    });
  });

  describe('Failed Attempt Tracking', () => {
    it('should increment failed attempts on authentication failure', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ count: 2, lockoutUntil: null })
      );
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({ success: false });

      await authenticateAsync();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should reset attempts on successful authentication', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ count: 3, lockoutUntil: null })
      );
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({ success: true });

      await authenticateAsync();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Hardware Availability', () => {
    it('should check for biometric hardware', async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      expect(hasHardware).toBe(true);
    });

    it('should check if biometrics are enrolled', async () => {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      expect(isEnrolled).toBe(true);
    });
  });
});
