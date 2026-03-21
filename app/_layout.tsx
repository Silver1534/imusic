import { Stack } from 'expo-router';
import { ThemeProvider } from './_context/ThemeContext';
import { MusicProvider } from './_context/MusicContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <MusicProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        </Stack>
      </MusicProvider>
    </ThemeProvider>
  );
}
