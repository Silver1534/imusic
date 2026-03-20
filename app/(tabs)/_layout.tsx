import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Text, TouchableOpacity, Modal, useWindowDimensions, Platform } from 'react-native';
import { MusicProvider, useMusic } from '../context/MusicContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function FullScreenPlayer() {
  const { 
    playingSong, isPlaying, handlePlayPause, 
    isFullPlayerVisible, setIsFullPlayerVisible, 
    playNext, playPrevious 
  } = useMusic();
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();

  if (!playingSong) return null;

  // Calcul de la taille de l'image de l'album pour que ce soit responsive
  const albumSize = width > 500 ? 300 : width * 0.75;

  return (
    <Modal 
      animationType="slide" 
      visible={isFullPlayerVisible} 
      onRequestClose={() => setIsFullPlayerVisible(false)}
    >
      <View style={[styles.fullScreenContainer, isDarkMode && styles.bgDark]}>
        {/* Bouton Fermer */}
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => setIsFullPlayerVisible(false)}
        >
          <Ionicons name="chevron-down" size={40} color={isDarkMode ? "#FFF" : "#45644A"} />
        </TouchableOpacity>

        {/* Visuel de l'album */}
        <View style={[styles.albumArt, { width: albumSize, height: albumSize }]}>
          <Ionicons name="musical-notes" size={albumSize / 2} color="#FFF" />
        </View>

        {/* Infos Titre */}
        <View style={styles.songInfo}>
          <Text numberOfLines={1} style={[styles.fullTitle, isDarkMode && styles.textWhite]}>
            {playingSong.title}
          </Text>
          <Text style={styles.fullArtist}>Lecture en cours</Text>
        </View>

        {/* Contrôles de Navigation (Précédent, Play/Pause, Suivant) */}
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={playPrevious}>
            <Ionicons name="play-back" size={50} color="#45644A" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handlePlayPause(playingSong)}>
            <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={100} color="#45644A" />
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext}>
            <Ionicons name="play-forward" size={50} color="#45644A" />
          </TouchableOpacity>
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
      style={[
        styles.miniPlayer, 
        isDarkMode && styles.cardDark, 
        { width: width - 40, left: 20 }
      ]} 
      onPress={() => setIsFullPlayerVisible(true)}
    >
      <Ionicons name="disc" size={26} color="#45644A" />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text numberOfLines={1} style={[styles.miniText, isDarkMode && styles.textWhite]}>
          {playingSong.title}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handlePlayPause(playingSong)}>
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
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
              position: 'absolute',
              bottom: 25,
              height: 65,
              borderRadius: 35,
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
              width: width - 40,
              marginHorizontal: 20,
              elevation: 10,
              borderTopWidth: 0,
              paddingBottom: 0, // Crucial pour le centrage vertical des icônes
            },
            tabBarItemStyle: {
              justifyContent: 'center', // Centre les icônes horizontalement
              alignItems: 'center',     // Centre les icônes verticalement
            }
          }}>
            <Tabs.Screen 
              name="index" 
              options={{ 
                tabBarIcon: ({color}) => (
                  <Ionicons name="home" size={28} color={color} style={{ marginTop: Platform.OS === 'android' ? 0 : 5 }} />
                ) 
              }} 
            />
            <Tabs.Screen 
              name="settings" 
              options={{ 
                tabBarIcon: ({color}) => (
                  <Ionicons name="settings" size={28} color={color} style={{ marginTop: Platform.OS === 'android' ? 0 : 5 }} />
                ) 
              }} 
            />
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
  miniPlayer: { 
    position: 'absolute', 
    bottom: 105, 
    height: 75, 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  miniText: { fontWeight: 'bold', fontSize: 15 },
  fullScreenContainer: { 
    flex: 1, 
    backgroundColor: '#F3EDE3', 
    alignItems: 'center', 
    justifyContent: 'space-around', 
    paddingVertical: 50 
  },
  closeButton: { alignSelf: 'flex-start', marginLeft: 30 },
  albumArt: { 
    backgroundColor: '#45644A', 
    borderRadius: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 20 
  },
  songInfo: { alignItems: 'center', paddingHorizontal: 30 },
  fullTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  fullArtist: { fontSize: 18, color: '#888', marginTop: 5 },
  controlsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '90%', 
    justifyContent: 'space-evenly' 
  }
});