import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.select({ ios: 'default', android: 'fade' }),
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Details',
        }}
      />
    </Stack>
  );
}
