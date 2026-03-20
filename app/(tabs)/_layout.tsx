import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Text, TouchableOpacity, Modal, useWindowDimensions, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { MusicProvider, useMusic } from '../context/MusicContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const formatTime = (millis: number) => {
  const min = Math.floor(millis / 60000);
  const sec = Math.floor((millis % 60000) / 1000);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

function FullScreenPlayer() {
  const { 
    playingSong, isPlaying, handlePlayPause, isFullPlayerVisible, 
    setIsFullPlayerVisible, playNext, playPrevious, position, duration, seek 
  } = useMusic();
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();

  if (!playingSong) return null;
  const albumSize = width > 500 ? 320 : width * 0.75;

  return (
    <Modal visible={isFullPlayerVisible} animationType="slide">
      <View style={[styles.fullContainer, isDarkMode && styles.bgDark]}>
        <TouchableOpacity onPress={() => setIsFullPlayerVisible(false)} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={40} color={isDarkMode ? "#FFF" : "#45644A"} />
        </TouchableOpacity>

        <View style={[styles.albumArt, { width: albumSize, height: albumSize }]}>
          <Ionicons name="musical-notes" size={albumSize / 2} color="#FFF" />
        </View>

        <Text numberOfLines={1} style={[styles.fullTitle, isDarkMode && styles.textWhite]}>
          {playingSong.title}
        </Text>

        <View style={styles.sliderSection}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#45644A"
            maximumTrackTintColor={isDarkMode ? "#333" : "#E0E0E0"}
            thumbTintColor="#45644A"
            onSlidingComplete={seek}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={playPrevious}><Ionicons name="play-back" size={50} color="#45644A"/></TouchableOpacity>
          <TouchableOpacity onPress={() => handlePlayPause(playingSong)}><Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={95} color="#45644A"/></TouchableOpacity>
          <TouchableOpacity onPress={playNext}><Ionicons name="play-forward" size={50} color="#45644A"/></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function MiniPlayer() {
  const { playingSong, isPlaying, handlePlayPause, setIsFullPlayerVisible } = useMusic();
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  if (!playingSong) return null;

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={[styles.miniPlayer, isDarkMode && styles.cardDark, { width: width - 40, left: 20 }]} 
      onPress={() => setIsFullPlayerVisible(true)}
    >
      <Ionicons name="disc" size={26} color="#45644A" />
      <Text numberOfLines={1} style={[styles.miniText, isDarkMode && styles.textWhite]}>{playingSong.title}</Text>
      <TouchableOpacity onPress={(e) => { e.stopPropagation(); handlePlayPause(playingSong); }}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={35} color="#45644A" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();

  return (
    <ThemeProvider>
      <MusicProvider>
        <View style={{ flex: 1 }}>
          <Tabs screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#45644A',
            tabBarInactiveTintColor: isDarkMode ? '#666' : '#999',
            tabBarStyle: {
              position: 'absolute', bottom: 25, height: 65, borderRadius: 35,
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF', elevation: 10,
              borderTopWidth: 0, width: width - 40, marginHorizontal: 20,
              paddingBottom: 0, 
            },
            tabBarItemStyle: { justifyContent: 'center', alignItems: 'center' }
          }}>
            <Tabs.Screen name="index" options={{ tabBarIcon: ({color}) => <Ionicons name="home" size={26} color={color}/> }} />
            <Tabs.Screen name="settings" options={{ tabBarIcon: ({color}) => <Ionicons name="settings" size={26} color={color}/> }} />
          </Tabs>
          <MiniPlayer />
          <FullScreenPlayer />
        </View>
      </MusicProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  bgDark: { backgroundColor: '#121212' },
  cardDark: { backgroundColor: '#1E1E1E' },
  textWhite: { color: '#FFF' },
  // MiniPlayer
  miniPlayer: { position: 'absolute', bottom: 105, height: 75, backgroundColor: '#FFF', borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, elevation: 15, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  miniText: { flex: 1, marginLeft: 15, fontWeight: 'bold', fontSize: 15 },
  // FullPlayer
  fullContainer: { flex: 1, backgroundColor: '#F3EDE3', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 50 },
  closeBtn: { alignSelf: 'flex-start', marginLeft: 30, marginTop: Platform.OS === 'ios' ? 20 : 0 },
  albumArt: { backgroundColor: '#45644A', borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 25 },
  fullTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 30, color: '#1A1A1A' },
  sliderSection: { width: '85%', alignItems: 'center' },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', width: '95%' },
  timeText: { color: '#888', fontSize: 13, fontWeight: '600' },
  controlsRow: { flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'space-evenly', marginBottom: 20 },
});