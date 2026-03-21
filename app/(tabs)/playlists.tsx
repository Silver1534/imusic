import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, StatusBar, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../_context/ThemeContext';
import { useMusic, Song, Playlist } from '../_context/MusicContext';

const STORAGE_KEY = '@my_songs_list';

export default function PlaylistsScreen() {
  const { isDarkMode } = useTheme();
  const {
    playlists, createPlaylist, deletePlaylist, removeSongFromPlaylist,
    renamePlaylist, handlePlayPause, playingSong, updatePlaylist,
  } = useMusic();
  const { width } = useWindowDimensions();

  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [renameTarget, setRenameTarget] = useState<Playlist | null>(null);

  React.useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setAllSongs(JSON.parse(saved));
    } catch (e) { console.error(e); }
  };

  const getSongsForPlaylist = (playlist: Playlist): Song[] => {
    return playlist.songIds
      .map(id => allSongs.find(s => s.id === id))
      .filter(Boolean) as Song[];
  };

  const handleCreate = () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un nom.");
      return;
    }
    createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setCreateModalVisible(false);
  };

  const handleRename = () => {
    if (!newPlaylistName.trim() || !renameTarget) return;
    renamePlaylist(renameTarget.id, newPlaylistName.trim());
    if (selectedPlaylist?.id === renameTarget.id) {
      setSelectedPlaylist({ ...renameTarget, name: newPlaylistName.trim() });
    }
    setNewPlaylistName('');
    setRenameModalVisible(false);
    setRenameTarget(null);
  };

  const handleDelete = (playlist: Playlist) => {
    Alert.alert("Supprimer", `Supprimer la playlist "${playlist.name}" ?`, [
      { text: "Annuler" },
      {
        text: "Supprimer", style: "destructive", onPress: () => {
          deletePlaylist(playlist.id);
          if (selectedPlaylist?.id === playlist.id) setSelectedPlaylist(null);
        }
      }
    ]);
  };

  const handleRemoveSong = (playlistId: string, songId: string) => {
    removeSongFromPlaylist(playlistId, songId);
    if (selectedPlaylist) {
      setSelectedPlaylist({
        ...selectedPlaylist,
        songIds: selectedPlaylist.songIds.filter(id => id !== songId),
      });
    }
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    const songs = getSongsForPlaylist(playlist);
    if (songs.length === 0) {
      Alert.alert("Playlist vide", "Ajoutez des chansons depuis la bibliothèque.");
      return;
    }
    updatePlaylist(songs);
    handlePlayPause(songs[0], songs);
  };

  // Vue détail playlist
  if (selectedPlaylist) {
    const currentPlaylistData = playlists.find(p => p.id === selectedPlaylist.id);
    const songs = currentPlaylistData ? getSongsForPlaylist(currentPlaylistData) : [];

    return (
      <View style={[styles.container, isDarkMode && styles.bgDark]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedPlaylist(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFF" : "#45644A"} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.detailTitle, isDarkMode && styles.textWhite]} numberOfLines={1}>
              {selectedPlaylist.name}
            </Text>
            <Text style={styles.subTitle}>{songs.length} titre{songs.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handlePlayPlaylist(selectedPlaylist)}
            style={styles.playAllBtn}
          >
            <Ionicons name="play" size={18} color="#FFF" />
            <Text style={styles.playAllText}>Tout lire</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
          {songs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="musical-notes-outline" size={60} color="#CCC" />
              <Text style={styles.emptyText}>Playlist vide</Text>
              <Text style={styles.emptySubText}>Ajoutez des chansons depuis la bibliothèque principale</Text>
            </View>
          ) : (
            songs.map((song, index) => (
              <View key={song.id} style={[styles.songCard, isDarkMode && styles.cardDark]}>
                <TouchableOpacity
                  style={styles.songMainBtn}
                  onPress={() => handlePlayPause(song, songs)}
                >
                  <View style={styles.songIndex}>
                    {playingSong?.id === song.id ? (
                      <Ionicons name="pause-circle" size={36} color="#45644A" />
                    ) : (
                      <Text style={[styles.songIndexText, isDarkMode && { color: '#888' }]}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.songTextContainer}>
                    <Text numberOfLines={1} style={[styles.songTitle, isDarkMode && styles.textWhite]}>
                      {song.title}
                    </Text>
                    <Text style={styles.songArtist}>Audio Importé</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemoveSong(selectedPlaylist.id, song.id)}
                  style={styles.removeBtn}
                >
                  <Ionicons name="remove-circle-outline" size={22} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // Vue liste playlists
  return (
    <View style={[styles.container, isDarkMode && styles.bgDark]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.title, isDarkMode && styles.textWhite]}>Playlists</Text>
          <Text style={styles.subTitle}>{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity onPress={() => setCreateModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
        {playlists.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="list-outline" size={48} color="#45644A" />
            </View>
            <Text style={[styles.emptyText, isDarkMode && styles.textWhite]}>Aucune playlist</Text>
            <Text style={styles.emptySubText}>Créez votre première playlist en appuyant sur +</Text>
            <TouchableOpacity style={styles.createFirstBtn} onPress={() => setCreateModalVisible(true)}>
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.createFirstText}>Créer une playlist</Text>
            </TouchableOpacity>
          </View>
        ) : (
          playlists.map(playlist => {
            const songs = getSongsForPlaylist(playlist);
            return (
              <TouchableOpacity
                key={playlist.id}
                style={[styles.playlistCard, isDarkMode && styles.cardDark]}
                onPress={() => setSelectedPlaylist(playlist)}
                activeOpacity={0.85}
              >
                <View style={styles.playlistCover}>
                  <Ionicons name="musical-notes" size={28} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.playlistName, isDarkMode && styles.textWhite]} numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text style={styles.playlistCount}>
                    {songs.length} titre{songs.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.playlistActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setRenameTarget(playlist);
                      setNewPlaylistName(playlist.name);
                      setRenameModalVisible(true);
                    }}
                    style={styles.smallActionBtn}
                  >
                    <Ionicons name="pencil-outline" size={18} color={isDarkMode ? "#AAA" : "#888"} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(playlist)}
                    style={styles.smallActionBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF4444" />
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#666" : "#CCC"} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Modal création */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isDarkMode && { backgroundColor: '#1E1E1E' }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textWhite]}>Nouvelle Playlist</Text>
            <TextInput
              style={[styles.modalInput, isDarkMode && { backgroundColor: '#2A2A2A', color: '#FFF', borderColor: '#333' }]}
              placeholder="Nom de la playlist..."
              placeholderTextColor={isDarkMode ? "#666" : "#BBB"}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
              maxLength={40}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => { setCreateModalVisible(false); setNewPlaylistName(''); }}
              >
                <Text style={styles.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnCreate} onPress={handleCreate}>
                <Text style={styles.modalBtnCreateText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal renommer */}
      <Modal visible={renameModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isDarkMode && { backgroundColor: '#1E1E1E' }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textWhite]}>Renommer</Text>
            <TextInput
              style={[styles.modalInput, isDarkMode && { backgroundColor: '#2A2A2A', color: '#FFF', borderColor: '#333' }]}
              placeholder="Nouveau nom..."
              placeholderTextColor={isDarkMode ? "#666" : "#BBB"}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
              maxLength={40}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => { setRenameModalVisible(false); setNewPlaylistName(''); setRenameTarget(null); }}
              >
                <Text style={styles.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnCreate} onPress={handleRename}>
                <Text style={styles.modalBtnCreateText}>Renommer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EDE3', paddingTop: StatusBar.currentHeight || 50 },
  bgDark: { backgroundColor: '#121212' },
  cardDark: { backgroundColor: '#1E1E1E' },
  textWhite: { color: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 24 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#45644A', letterSpacing: -1 },
  subTitle: { fontSize: 14, color: '#888', marginTop: 2 },
  addBtn: { backgroundColor: '#45644A', padding: 10, borderRadius: 15, elevation: 5 },
  // Playlist card
  playlistCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    marginHorizontal: 20, marginBottom: 12, padding: 14, borderRadius: 20, elevation: 3,
  },
  playlistCover: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#45644A',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  playlistName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  playlistCount: { fontSize: 13, color: '#888', marginTop: 2 },
  playlistActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  smallActionBtn: { padding: 6 },
  // Empty
  emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 30 },
  emptyIconBg: {
    width: 90, height: 90, borderRadius: 25, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#888', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#BBB', textAlign: 'center', lineHeight: 20 },
  createFirstBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#45644A', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 14, marginTop: 24, elevation: 4,
  },
  createFirstText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  // Detail
  detailHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    marginBottom: 20, gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(69,100,74,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  detailTitle: { fontSize: 22, fontWeight: 'bold', color: '#45644A' },
  playAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#45644A', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, elevation: 4,
  },
  playAllText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  songCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    marginHorizontal: 20, marginBottom: 10, padding: 12, borderRadius: 18, elevation: 3,
  },
  songMainBtn: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  songIndex: { width: 36, alignItems: 'center', justifyContent: 'center' },
  songIndexText: { fontSize: 16, fontWeight: '700', color: '#CCC' },
  songTextContainer: { flex: 1, marginLeft: 12 },
  songTitle: { fontSize: 15, fontWeight: '600' },
  songArtist: { fontSize: 12, color: '#888', marginTop: 2 },
  removeBtn: { padding: 8 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    backgroundColor: '#FFF', borderRadius: 22, padding: 24, width: '85%',
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 16, borderWidth: 1, borderColor: '#E8E8E8', marginBottom: 20,
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#F0F0F0', alignItems: 'center',
  },
  modalBtnCancelText: { fontSize: 15, fontWeight: '600', color: '#888' },
  modalBtnCreate: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#45644A', alignItems: 'center',
  },
  modalBtnCreateText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
