import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  TextInput, Alert, useWindowDimensions, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../_context/ThemeContext';
import { useMusic, Song } from '../_context/MusicContext';

const STORAGE_KEY = '@my_songs_list';

export default function MusicIndex() {
  // Ajout de updatePlaylist ici
  const { handlePlayPause, playingSong, stopAndReset, updatePlaylist } = useMusic();
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { loadSongs(); }, []);

  const loadSongs = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedSongs = JSON.parse(saved);
        setSongs(parsedSongs);
        updatePlaylist(parsedSongs); // Synchro initiale
      }
    } catch (e) { console.error("Erreur", e); }
  };

  const deleteSong = (id: string) => {
    Alert.alert("Supprimer", "Retirer ce titre de votre bibliothèque ?", [
      { text: "Annuler" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
          // 1. Arrêter la musique si c'est celle qu'on supprime
          if (playingSong?.id === id) {
            await stopAndReset();
          }
          
          // 2. Mettre à jour la liste locale
          const newList = songs.filter(s => s.id !== id);
          setSongs(newList);
          
          // 3. Synchro le context pour que "Suivant/Précédent" sache que la liste a changé
          updatePlaylist(newList);
          
          // 4. Sauvegarder
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      }}
    ]);
  };

  const pickSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/mpeg' });
      if (!result.canceled) {
        const asset = result.assets[0];
        const cleanTitle = asset.name.replace('.mp3', '');
        const exists = songs.some(s => s.title.toLowerCase() === cleanTitle.toLowerCase());
        
        if (exists) {
          Alert.alert("Doublon", "Cette chanson est déjà présente.");
          return;
        }

        const fileName = `${Date.now()}_${asset.name}`;
        const dest = (FileSystem.documentDirectory || '') + fileName;
        await FileSystem.copyAsync({ from: asset.uri, to: dest });

        const newSong: Song = { id: Date.now().toString(), title: cleanTitle, uri: dest };
        const newList = [...songs, newSong];
        
        setSongs(newList);
        updatePlaylist(newList); // Synchro après ajout
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      }
    } catch (e) { Alert.alert("Erreur", "Impossible d'importer."); }
  };

  const filteredSongs = songs.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={[styles.container, isDarkMode && styles.bgDark]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, isDarkMode && styles.textWhite]}>I-Music</Text>
          <Text style={styles.subTitle}>Votre Bibliothèque Audio</Text>
        </View>
        <TouchableOpacity onPress={pickSong} style={styles.addBtn}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBarContainer, { width: width - 40 }, isDarkMode && styles.cardDark]}>
        <Ionicons name="search" size={20} color={isDarkMode ? "#AAA" : "#666"} style={styles.searchIcon} />
        <TextInput 
          placeholder="Rechercher une musique..." 
          placeholderTextColor={isDarkMode ? "#888" : "#999"}
          style={[styles.searchInput, isDarkMode && styles.textWhite]}
          value={search}
          onChangeText={setSearch}
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 150 }} 
        showsVerticalScrollIndicator={false}
      >
        {filteredSongs.length > 0 ? (
          filteredSongs.map((item) => (
            <View key={item.id} style={[styles.songCard, isDarkMode && styles.cardDark]}>
              <TouchableOpacity 
                style={styles.songMainBtn} 
                onPress={() => handlePlayPause(item, songs)} // On passe 'songs' pour garder la playlist entière
              >
                <Ionicons 
                  name={playingSong?.id === item.id ? "pause-circle" : "play-circle"} 
                  size={46} 
                  color="#45644A" 
                />
                <View style={styles.songTextContainer}>
                  <Text numberOfLines={1} style={[styles.songTitle, isDarkMode && styles.textWhite]}>
                    {item.title}
                  </Text>
                  <Text style={styles.songArtist}>Audio Importé</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteSong(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={22} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={70} color="#CCC" />
            <Text style={styles.emptyText}>Aucune musique trouvée</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EDE3', paddingTop: StatusBar.currentHeight || 50 },
  bgDark: { backgroundColor: '#121212' },
  cardDark: { backgroundColor: '#1E1E1E' },
  textWhite: { color: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 25 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#45644A', letterSpacing: -1 },
  subTitle: { fontSize: 14, color: '#888', marginTop: -2 },
  addBtn: { backgroundColor: '#45644A', padding: 10, borderRadius: 15, elevation: 5 },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, paddingHorizontal: 15, height: 55, borderRadius: 18, marginBottom: 20, elevation: 3 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  songCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 12, padding: 10, borderRadius: 20, elevation: 3 },
  songMainBtn: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  songTextContainer: { flex: 1, marginLeft: 15 },
  songTitle: { fontSize: 16, fontWeight: 'bold' },
  songArtist: { fontSize: 12, color: '#888', marginTop: 2 },
  deleteBtn: { padding: 10 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', marginTop: 15, fontSize: 16 }
});