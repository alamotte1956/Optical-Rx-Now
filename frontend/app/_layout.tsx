import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    // Initialize Mobile Ads SDK for native platforms
    const initAds = async () => {
      if (Platform.OS === 'web') return;
      
      try {
        const mobileAds = require('react-native-google-mobile-ads').default;
        await mobileAds().initialize();
        console.log('Mobile Ads SDK initialized');
      } catch (error) {
        // Module not available in Expo Go, will work in development build
        console.log('AdMob initialization skipped (requires development build)');
      }
    };

    initAds();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#16213e',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Optical Rx Now',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="add-member"
          options={{
            title: 'Add Family Member',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="member/[id]"
          options={{
            title: 'Prescriptions',
          }}
        />
        <Stack.Screen
          name="prescription/[id]"
          options={{
            title: 'Prescription Details',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
