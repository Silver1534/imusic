import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  useWindowDimensions, Platform, Alert, ActivityIndicator, Modal 
} from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// 1. Définition du modèle de donnée pour une musique
interface Song {
  id: string;
  title: string;
  uri: string;
  isLocal: boolean;
}

const STORAGE_KEY = '@my_songs_list';

export default function MusicIndex() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();

  // Charger les musiques sauvegardées au démarrage
  useEffect(() => {
    loadSavedSongs();
    return () => { if (sound) sound.unloadAsync(); };
  }, []);

  const loadSavedSongs = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setSongs(JSON.parse(saved));
    } catch (e) { console.error(e); }
  };

  const saveSongs = async (newSongs: Song[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSongs));
    } catch (e) { console.error(e); }
  };

  // Fonction pour importer un MP3
  const pickAndAddSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/mpeg' });
      if (!result.canceled) {
        setLoading(true);
        const asset = result.assets[0];
        const fileName = `${Date.now()}_${asset.name}`;
        const dest = (FileSystem.documentDirectory || '') + fileName;
        
        await FileSystem.copyAsync({ from: asset.uri, to: dest });
        
        const newSong = { id: Date.now().toString(), title: asset.name.replace('.mp3', ''), uri: dest, isLocal: true };
        const updated = [...songs, newSong];
        setSongs(updated);
        await saveSongs(updated);
        setLoading(false);
      }
    } catch (e) { 
        setLoading(false); 
        Alert.alert("Erreur", "Import impossible."); 
    }
  };

  // Gérer la lecture / pause
  async function handlePlayPause(song: Song) {
    try {
      if (playingId === song.id && sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) { 
            await sound.pauseAsync(); 
            setIsPlaying(false); 
          } else { 
            await sound.playAsync(); 
            setIsPlaying(true); 
          }
        }
        return;
      }
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: song.uri }, { shouldPlay: true });
      setSound(newSound);
      setPlayingId(song.id);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) { 
            setIsPlaying(false); 
            setPlayingId(null); 
        }
      });
    } catch (e) { Alert.alert("Erreur", "Lecture impossible."); }
  }

  const currentSong = songs.find(s => s.id === playingId);

  return (
    <View style={[styles.mainWrapper, isDarkMode && styles.bgDark]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDarkMode && styles.textWhite]}>I-Music</Text>
          <TouchableOpacity style={styles.addButton} onPress={pickAndAddSong}>
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator color="#45644A" size="large" />}

        {songs.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.songCard, isDarkMode && styles.cardDark]} 
            onPress={() => handlePlayPause(item)}
          >
            <View style={styles.songIcon}>
                <Ionicons name="musical-note" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[styles.songTitle, isDarkMode && styles.textWhite]}>{item.title}</Text>
                <Text style={styles.songSub}>MP3 Local</Text>
            </View>
            {playingId === item.id && isPlaying && (
                <Ionicons name="volume-medium" size={24} color="#45644A" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MINI PLAYER FLOTTANT */}
      {currentSong && (
        <TouchableOpacity 
          style={[styles.miniPlayer, isDarkMode && styles.cardDark]} 
          onPress={() => setIsModalVisible(true)}
        >
          <View style={styles.miniContent}>
            <Ionicons name="disc" size={40} color="#45644A" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text numberOfLines={1} style={[styles.miniTitle, isDarkMode && styles.textWhite]}>{currentSong.title}</Text>
              <Text style={styles.miniStatus}>{isPlaying ? "En lecture" : "Pause"}</Text>
            </View>
            <TouchableOpacity onPress={() => handlePlayPause(currentSong)}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#45644A" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* LECTEUR PLEIN ÉCRAN (MODAL) */}
      <Modal animationType="slide" visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View style={[styles.modalContainer, isDarkMode && styles.bgDark]}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalVisible(false)}>
            <Ionicons name="chevron-down" size={35} color={isDarkMode ? "#FFF" : "#333"} />
          </TouchableOpacity>

          <View style={styles.bigPochette}>
            <Ionicons name="musical-notes" size={100} color="#FFF" />
          </View>

          <View style={styles.modalInfo}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textWhite]}>{currentSong?.title}</Text>
            <Text style={styles.modalArtist}>Artiste Local</Text>
          </View>

          <View style={styles.controlsRow}>
            <Ionicons name="play-skip-back" size={45} color="#45644A" />
            <TouchableOpacity onPress={() => currentSong && handlePlayPause(currentSong)}>
              <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={100} color="#45644A" />
            </TouchableOpacity>
            <Ionicons name="play-skip-forward" size={45} color="#45644A" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#F3EDE3' },
  bgDark: { backgroundColor: '#121212' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 180 },
  header: { marginTop: 60, marginBottom: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 34, fontWeight: 'bold', color: '#45644A' },
  textWhite: { color: '#FFF' },
  addButton: { backgroundColor: '#45644A', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  songCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 12, elevation: 3 },
  cardDark: { backgroundColor: '#1E1E1E' },
  songIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#45644A', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  songTitle: { fontWeight: 'bold', fontSize: 16 },
  songSub: { fontSize: 12, color: '#888' },
  
  miniPlayer: { position: 'absolute', bottom: 100, left: 20, right: 20, backgroundColor: '#FFF', padding: 10, borderRadius: 22, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  miniContent: { flexDirection: 'row', alignItems: 'center' },
  miniTitle: { fontWeight: 'bold', fontSize: 14 },
  miniStatus: { fontSize: 11, color: '#45644A', fontWeight: 'bold' },

  modalContainer: { flex: 1, alignItems: 'center', paddingTop: 60, backgroundColor: '#F3EDE3' },
  closeBtn: { alignSelf: 'flex-start', marginLeft: 25, marginBottom: 40 },
  bigPochette: { width: 300, height: 300, backgroundColor: '#45644A', borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 20 },
  modalInfo: { marginTop: 50, alignItems: 'center' },
  modalTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 30 },
  modalArtist: { fontSize: 18, color: '#888', marginTop: 10 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 50, width: '80%', justifyContent: 'space-around' }
});