import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
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
            title: 'Rx Vault',
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
