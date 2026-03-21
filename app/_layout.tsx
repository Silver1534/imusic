import { Stack } from 'expo-router';
import { ThemeProvider } from './_context/ThemeContext';
import { MusicProvider } from './_context/MusicContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <MusicProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" /> 
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </MusicProvider>
    </ThemeProvider>
  );
}
