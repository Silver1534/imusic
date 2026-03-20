import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function MusicIndex() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();

  async function playSound() {
    try {
      if (sound) { await sound.unloadAsync(); }
      const { sound: newSound } = await Audio.Sound.createAsync(
         require('../../assets/music/Twenty One Pilots - The Line (Instrumental)(MP3_160K).mp3')
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (e) { console.log("Erreur audio", e); }
  }

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  return (
    <ScrollView 
      style={[styles.container, isDarkMode && styles.containerDark]} 
      contentContainerStyle={{ paddingBottom: 120, alignItems: 'center' }}
    >
      <View style={[styles.header, { width: width > 800 ? 760 : '100%' }]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Explore</Text>
      </View>

      <View style={{ width: width > 800 ? 760 : '100%' }}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Popular Songs</Text>
        
        <TouchableOpacity style={[styles.songItem, isDarkMode && styles.cardDark]} onPress={playSound}>
          <View style={styles.songInfo}>
            <View style={styles.songImagePlaceholder} />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={[styles.songTitle, isDarkMode && styles.textDark]}>
                Ma Musique Malagasy
              </Text>
              <Text style={styles.artistName}>Artiste Local</Text>
            </View>
          </View>
          <Ionicons name="play-circle" size={34} color={isDarkMode ? "#A5D6A7" : "#45644A"} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EDE3', paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 30 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#45644A' },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 20 },
  songItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 15, borderRadius: 20, elevation: 3 },
  songInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  songImagePlaceholder: { width: 55, height: 55, borderRadius: 12, backgroundColor: '#45644A', marginRight: 15 },
  songTitle: { fontWeight: 'bold', fontSize: 16 },
  artistName: { color: '#888', fontSize: 12 },
  containerDark: { backgroundColor: '#1A1C1E' },
  textDark: { color: '#E2E2E2' },
  cardDark: { backgroundColor: '#2D3033' },
});