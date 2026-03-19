import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Landing Page */}
      <Stack.Screen name="index" /> 
      {/* 2. Authentification */}
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      {/* 3. L'application (qui utilise le layout Tabs) */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}