import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  TextInput, Alert, useWindowDimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useMusic, Song } from '../context/MusicContext';

const STORAGE_KEY = '@my_songs_list';

export default function MusicIndex() {
  const { handlePlayPause, playingSong, stopAndReset } = useMusic();
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { 
    loadSongs(); 
  }, []);

  const loadSongs = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setSongs(JSON.parse(saved));
    } catch (e) {
      console.error("Erreur de chargement", e);
    }
  };

  const deleteSong = (id: string) => {
    Alert.alert("Supprimer", "Voulez-vous retirer ce titre ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Supprimer", 
        style: "destructive", 
        onPress: async () => {
          // --- LOGIQUE DE SÉCURITÉ ---
          // Si la chanson supprimée est celle qui joue, on arrête tout proprement
          if (playingSong?.id === id) {
            await stopAndReset(); 
          }

          const newList = songs.filter(s => s.id !== id);
          setSongs(newList);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
        }
      }
    ]);
  };

  const pickSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: 'audio/mpeg',
        copyToCacheDirectory: true 
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const fileName = `${Date.now()}_${asset.name}`;
        const dest = (FileSystem.documentDirectory || '') + fileName;
        
        await FileSystem.copyAsync({ from: asset.uri, to: dest });

        const newSong: Song = { 
          id: Date.now().toString(), 
          title: asset.name.replace('.mp3', ''), 
          uri: dest 
        };

        const newList = [...songs, newSong];
        setSongs(newList);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'importer le fichier.");
    }
  };

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, isDarkMode && styles.bgDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.textWhite]}>I-Music</Text>
        <TouchableOpacity onPress={pickSong} style={styles.addBtn}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBar, isDarkMode && styles.cardDark, { width: width - 40 }]}>
        <Ionicons name="search" size={20} color={isDarkMode ? "#AAA" : "#666"} />
        <TextInput 
          placeholder="Rechercher..." 
          placeholderTextColor={isDarkMode ? "#888" : "#999"}
          style={[styles.searchInput, isDarkMode && styles.textWhite]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
        {filteredSongs.length > 0 ? (
          filteredSongs.map((item) => (
            <View key={item.id} style={[styles.songCardContainer, isDarkMode && styles.cardDark]}>
              <TouchableOpacity 
                style={styles.songInfoBtn} 
                onPress={() => handlePlayPause(item, filteredSongs)}
              >
                <Ionicons 
                  name={playingSong?.id === item.id ? "pause-circle" : "play-circle"} 
                  size={42} 
                  color="#45644A" 
                />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text numberOfLines={1} style={[styles.songText, isDarkMode && styles.textWhite]}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => deleteSong(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={22} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={80} color="#CCC" />
            <Text style={styles.emptyText}>Bibliothèque vide</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EDE3', paddingTop: 60 },
  bgDark: { backgroundColor: '#121212' },
  cardDark: { backgroundColor: '#1E1E1E' },
  textWhite: { color: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#45644A' },
  addBtn: { backgroundColor: '#45644A', padding: 8, borderRadius: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, paddingHorizontal: 15, height: 55, borderRadius: 18, marginBottom: 25, elevation: 3 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  songCardContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 12, padding: 12, borderRadius: 20, elevation: 2 },
  songInfoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  songText: { fontWeight: 'bold', fontSize: 16 },
  deleteBtn: { padding: 10 },
  emptyState: { alignItems: 'center', marginTop: 120 },
  emptyText: { color: '#999', marginTop: 15, fontSize: 16 }
});