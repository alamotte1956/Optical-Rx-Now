import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AGE_VERIFIED_KEY = '@optical_rx_now:age_verified';

interface AgeVerificationModalProps {
  visible: boolean;
  onVerified: () => void;
  onDeclined: () => void;
}

export function AgeVerificationModal({
  visible,
  onVerified,
  onDeclined,
}: AgeVerificationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await AsyncStorage.setItem(AGE_VERIFIED_KEY, 'true');
      onVerified();
    } catch (error) {
      Alert.alert('Error', 'Failed to save verification. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Age Requirement',
      'You must be 18 years or older to use this app. The app will now close.',
      [
        {
          text: 'OK',
          onPress: onDeclined,
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Age Verification Required</Text>
          
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👤</Text>
          </View>

          <Text style={styles.description}>
            Optical Rx Now stores medical prescription information and is
            intended for adults only.
          </Text>

          <Text style={styles.question}>
            Are you 18 years of age or older?
          </Text>

          <View style={styles.legalText}>
            <Text style={styles.disclaimer}>
              By selecting "Yes, I'm 18+", you confirm that you meet the age
              requirement and agree to our{' '}
              <Text
                style={styles.link}
                onPress={() =>
                  Linking.openURL('https://opticalrxnow.com/privacy')
                }
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
              disabled={isProcessing}
            >
              <Text style={styles.acceptButtonText}>Yes, I'm 18+</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.declineButton]}
              onPress={handleDecline}
              disabled={isProcessing}
            >
              <Text style={styles.declineButtonText}>No, I'm under 18</Text>
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            This app is not intended for minors and complies with age
            verification requirements.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

// Export helper function to check verification status
export async function checkAgeVerification(): Promise<boolean> {
  try {
    const verified = await AsyncStorage.getItem(AGE_VERIFIED_KEY);
    return verified === 'true';
  } catch {
    return false;
  }
}

// Export helper to reset verification (for testing/logout)
export async function resetAgeVerification(): Promise<void> {
  await AsyncStorage.removeItem(AGE_VERIFIED_KEY);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1a2332',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 60,
  },
  description: {
    fontSize: 16,
    color: '#b0b8c0',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  legalText: {
    backgroundColor: '#0a1628',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  disclaimer: {
    fontSize: 13,
    color: '#8a929a',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#4a9eff',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#2a7fff',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  declineButtonText: {
    color: '#b0b8c0',
    fontSize: 16,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#6a727a',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
