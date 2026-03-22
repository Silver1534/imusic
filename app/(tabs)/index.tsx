import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  Alert, StatusBar, Modal, Animated,
  TextInput, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../_context/ThemeContext';
import { useMusic, Song } from '../_context/MusicContext';
import { useSearch } from './_layout';

export default function MusicIndex() {
  const {
    songs,
    addSong,
    deleteSong,
    handlePlayPause,
    playingSong,
    toggleFavorite,
    isFavorite,
    addSongToPlaylist,
    createPlaylist,
    playlists,
  } = useMusic();

  const { isDarkMode } = useTheme();
  const { searchQuery } = useSearch();

  const [playlistModalSong, setPlaylistModalSong] = useState<Song | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const modalAnim = useRef(new Animated.Value(0)).current;

  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const createInputAnim = useRef(new Animated.Value(0)).current;

  // ── Import d'une chanson ──────────────────────────────────────────────────

  const pickSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/mpeg' });
      if (!result.canceled) {
        const asset = result.assets[0];
        const cleanTitle = asset.name.replace('.mp3', '');

        if (songs.some(s => s.title.toLowerCase() === cleanTitle.toLowerCase())) {
          Alert.alert('Doublon', 'Cette chanson est déjà présente.');
          return;
        }

        const fileName = `${Date.now()}_${asset.name}`;
        const dest = (FileSystem.documentDirectory || '') + fileName;
        await FileSystem.copyAsync({ from: asset.uri, to: dest });

        const newSong: Song = {
          id: Date.now().toString(),
          title: cleanTitle,
          uri: dest,
        };

        await addSong(newSong);
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'importer.");
    }
  };

  // ── Suppression d'une chanson ─────────────────────────────────────────────
  // Le contexte gère : arrêt lecture + suppression fichier disque
  // + nettoyage favoris + nettoyage playlists

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer', 'Retirer ce titre de votre bibliothèque ?', [
      { text: 'Annuler' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => deleteSong(id),
      },
    ]);
  };

  // ── Modal ajout playlist ──────────────────────────────────────────────────

  const openPlaylistModal = (song: Song) => {
    setPlaylistModalSong(song);
    setShowCreateInput(false);
    setNewPlaylistName('');
    Animated.spring(modalAnim, {
      toValue: 1, useNativeDriver: true, tension: 70, friction: 10,
    }).start();
  };

  const closePlaylistModal = () => {
    Keyboard.dismiss();
    Animated.timing(modalAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => {
      setPlaylistModalSong(null);
      setShowCreateInput(false);
      setNewPlaylistName('');
    });
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (!playlistModalSong) return;
    addSongToPlaylist(playlistId, playlistModalSong.id);
    closePlaylistModal();
    Alert.alert('Ajouté', `"${playlistModalSong.title}" ajouté à la playlist.`);
  };

  const toggleCreateInput = () => {
    if (showCreateInput) {
      Keyboard.dismiss();
      Animated.timing(createInputAnim, {
        toValue: 0, duration: 180, useNativeDriver: false,
      }).start(() => setShowCreateInput(false));
    } else {
      setShowCreateInput(true);
      Animated.spring(createInputAnim, {
        toValue: 1, useNativeDriver: false, tension: 80, friction: 10,
      }).start();
    }
    setNewPlaylistName('');
  };

  const handleCreateAndAdd = () => {
    const name = newPlaylistName.trim();
    if (!name) {
      Alert.alert('Nom requis', 'Veuillez saisir un nom pour la playlist.');
      return;
    }
    if (!playlistModalSong) return;

    const newId = Date.now().toString();
    createPlaylist(name, newId);
    addSongToPlaylist(newId, playlistModalSong.id);

    closePlaylistModal();
    Alert.alert('Playlist créée', `"${playlistModalSong.title}" a été ajouté à "${name}".`);
  };

  // ── Filtrage ──────────────────────────────────────────────────────────────

  const filteredSongs = songs.filter(s => {
    const matchSearch = s.title.toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchFav = showFavoritesOnly ? isFavorite(s.id) : true;
    return matchSearch && matchFav;
  });

  const favCount = songs.filter(s => isFavorite(s.id)).length;

  const createBlockHeight = createInputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 110],
  });
  const createBlockOpacity = createInputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, isDarkMode && styles.bgDark]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, isDarkMode && styles.textWhite]}>I-Music</Text>
          <Text style={styles.subTitle}>Votre Bibliothèque Audio</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={[styles.filterBtn, showFavoritesOnly && styles.filterBtnActive]}
          >
            <Ionicons
              name={showFavoritesOnly ? 'heart' : 'heart-outline'}
              size={20}
              color={showFavoritesOnly ? '#FFF' : '#45644A'}
            />
            {favCount > 0 && (
              <Text style={[styles.favCount, showFavoritesOnly && { color: '#FFF' }]}>
                {favCount}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={pickSong} style={styles.addBtn}>
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {showFavoritesOnly && (
        <View style={[styles.filterBadge, isDarkMode && { backgroundColor: '#2a3a2a' }]}>
          <Ionicons name="heart" size={14} color="#45644A" />
          <Text style={styles.filterBadgeText}>Favoris uniquement</Text>
        </View>
      )}

      {/* Liste des chansons */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredSongs.length > 0 ? (
          filteredSongs.map((item) => (
            <View key={item.id} style={[styles.songCard, isDarkMode && styles.cardDark]}>
              <TouchableOpacity
                style={styles.songMainBtn}
                onPress={() => handlePlayPause(item, songs)}
              >
                <Ionicons
                  name={playingSong?.id === item.id ? 'pause-circle' : 'play-circle'}
                  size={46}
                  color="#45644A"
                />
                <View style={styles.songTextContainer}>
                  <Text
                    numberOfLines={1}
                    style={[styles.songTitle, isDarkMode && styles.textWhite]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.songArtist}>Audio Importé</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.songActions}>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.actionBtn}>
                  <Ionicons
                    name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                    size={21}
                    color={isFavorite(item.id) ? '#E05C5C' : isDarkMode ? '#888' : '#CCC'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openPlaylistModal(item)}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={21}
                    color={isDarkMode ? '#888' : '#CCC'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={70} color="#CCC" />
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Aucun résultat'
                : showFavoritesOnly
                  ? 'Aucun favori'
                  : 'Aucune musique trouvée'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal ajout playlist */}
      <Modal
        visible={!!playlistModalSong}
        transparent
        animationType="none"
        onRequestClose={closePlaylistModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closePlaylistModal}
          >
            <Animated.View
              style={[
                styles.modalSheet,
                isDarkMode && { backgroundColor: '#1E1E1E' },
                {
                  transform: [{
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1], outputRange: [500, 0],
                    }),
                  }],
                  opacity: modalAnim,
                },
              ]}
            >
              <TouchableOpacity activeOpacity={1}>

                <View style={styles.modalHandle} />

                <Text style={[styles.modalTitle, isDarkMode && styles.textWhite]}>
                  Ajouter à une playlist
                </Text>

                <View style={styles.modalSongRow}>
                  <View style={styles.modalSongIcon}>
                    <Ionicons name="musical-note" size={16} color="#45644A" />
                  </View>
                  <Text
                    style={[styles.modalSongName, isDarkMode && { color: '#BBB' }]}
                    numberOfLines={1}
                  >
                    {playlistModalSong?.title}
                  </Text>
                </View>

                {/* Aucune playlist */}
                {playlists.length === 0 ? (
                  <View style={styles.emptyPlaylistsBlock}>
                    <View style={[
                      styles.emptyIllustration,
                      isDarkMode && { backgroundColor: '#2A2A2A' },
                    ]}>
                      <Ionicons name="list" size={36} color="#45644A" />
                    </View>
                    <Text style={[styles.emptyPlaylistText, isDarkMode && styles.textWhite]}>
                      Aucune playlist
                    </Text>
                    <Text style={styles.emptyPlaylistSub}>
                      Créez votre première playlist pour organiser vos chansons
                    </Text>

                    <Animated.View style={[
                      styles.createBlock,
                      isDarkMode && { backgroundColor: '#2A2A2A', borderColor: '#333' },
                      { height: createBlockHeight, opacity: createBlockOpacity, overflow: 'hidden' },
                    ]}>
                      <TextInput
                        style={[
                          styles.createInput,
                          isDarkMode && { color: '#FFF', borderColor: '#444' },
                        ]}
                        placeholder="Nom de la playlist..."
                        placeholderTextColor={isDarkMode ? '#666' : '#BBB'}
                        value={newPlaylistName}
                        onChangeText={setNewPlaylistName}
                        autoFocus={showCreateInput}
                        maxLength={40}
                        returnKeyType="done"
                        onSubmitEditing={handleCreateAndAdd}
                      />
                      <TouchableOpacity
                        style={[
                          styles.createConfirmBtn,
                          !newPlaylistName.trim() && { opacity: 0.45 },
                        ]}
                        onPress={handleCreateAndAdd}
                        disabled={!newPlaylistName.trim()}
                      >
                        <Ionicons name="checkmark" size={18} color="#FFF" />
                        <Text style={styles.createConfirmText}>Créer et ajouter</Text>
                      </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                      style={[
                        styles.createPlaylistBtn,
                        isDarkMode && { borderColor: '#45644A' },
                      ]}
                      onPress={toggleCreateInput}
                    >
                      <Ionicons
                        name={showCreateInput ? 'close' : 'add'}
                        size={20}
                        color="#45644A"
                      />
                      <Text style={styles.createPlaylistBtnText}>
                        {showCreateInput ? 'Annuler' : 'Créer une playlist'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                ) : (
                  // Playlists existantes
                  <>
                    <TouchableOpacity
                      style={[
                        styles.newPlaylistRow,
                        isDarkMode && { borderBottomColor: '#333' },
                      ]}
                      onPress={toggleCreateInput}
                    >
                      <View style={styles.newPlaylistIconWrap}>
                        <Ionicons
                          name={showCreateInput ? 'close' : 'add'}
                          size={20}
                          color="#45644A"
                        />
                      </View>
                      <Text style={[styles.newPlaylistLabel, isDarkMode && styles.textWhite]}>
                        {showCreateInput ? 'Annuler' : 'Nouvelle playlist'}
                      </Text>
                    </TouchableOpacity>

                    <Animated.View style={[
                      styles.createBlockInline,
                      isDarkMode && { backgroundColor: '#2A2A2A', borderColor: '#333' },
                      { height: createBlockHeight, opacity: createBlockOpacity, overflow: 'hidden' },
                    ]}>
                      <View style={styles.createInlineRow}>
                        <TextInput
                          style={[
                            styles.createInlineInput,
                            isDarkMode && {
                              color: '#FFF',
                              borderColor: '#444',
                              backgroundColor: '#333',
                            },
                          ]}
                          placeholder="Nom de la playlist..."
                          placeholderTextColor={isDarkMode ? '#666' : '#BBB'}
                          value={newPlaylistName}
                          onChangeText={setNewPlaylistName}
                          autoFocus={showCreateInput}
                          maxLength={40}
                          returnKeyType="done"
                          onSubmitEditing={handleCreateAndAdd}
                        />
                        <TouchableOpacity
                          style={[
                            styles.createInlineBtn,
                            !newPlaylistName.trim() && { opacity: 0.45 },
                          ]}
                          onPress={handleCreateAndAdd}
                          disabled={!newPlaylistName.trim()}
                        >
                          <Ionicons name="checkmark" size={20} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </Animated.View>

                    <ScrollView style={{ maxHeight: 260 }} keyboardShouldPersistTaps="handled">
                      {playlists.map((playlist) => {
                        const songCount = playlist.songIds.length;
                        return (
                          <TouchableOpacity
                            key={playlist.id}
                            style={[
                              styles.playlistItem,
                              isDarkMode && { borderBottomColor: '#2A2A2A' },
                            ]}
                            onPress={() => handleAddToPlaylist(playlist.id)}
                          >
                            <View style={styles.playlistItemIcon}>
                              <Ionicons name="musical-notes" size={18} color="#45644A" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[
                                styles.playlistItemName,
                                isDarkMode && styles.textWhite,
                              ]}>
                                {playlist.name}
                              </Text>
                              <Text style={styles.playlistItemCount}>
                                {songCount} titre{songCount !== 1 ? 's' : ''}
                              </Text>
                            </View>
                            <View style={styles.addToListBtn}>
                              <Ionicons name="add" size={18} color="#45644A" />
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </>
                )}

                <TouchableOpacity
                  style={[styles.modalClose, isDarkMode && { backgroundColor: '#2A2A2A' }]}
                  onPress={closePlaylistModal}
                >
                  <Text style={[styles.modalCloseText, isDarkMode && { color: '#888' }]}>
                    Fermer
                  </Text>
                </TouchableOpacity>

              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EDE3',
    paddingTop: StatusBar.currentHeight || 50,
  },
  bgDark: { backgroundColor: '#121212' },
  cardDark: { backgroundColor: '#1E1E1E' },
  textWhite: { color: '#FFF' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#45644A',
    letterSpacing: -1,
  },
  subTitle: { fontSize: 14, color: '#888', marginTop: -2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addBtn: {
    backgroundColor: '#45644A',
    padding: 10,
    borderRadius: 15,
    elevation: 5,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#45644A',
  },
  filterBtnActive: { backgroundColor: '#45644A' },
  favCount: { fontSize: 13, fontWeight: '700', color: '#45644A' },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 25,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  filterBadgeText: { fontSize: 13, color: '#45644A', fontWeight: '600' },

  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 10,
    borderRadius: 20,
    elevation: 3,
  },
  songMainBtn: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  songTextContainer: { flex: 1, marginLeft: 15 },
  songTitle: { fontSize: 15, fontWeight: 'bold' },
  songArtist: { fontSize: 12, color: '#888', marginTop: 2 },
  songActions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 6 },

  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', marginTop: 15, fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingBottom: 36,
    paddingTop: 10,
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalSongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalSongIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSongName: { flex: 1, fontSize: 14, color: '#666', fontWeight: '500' },

  emptyPlaylistsBlock: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 4,
  },
  emptyIllustration: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyPlaylistText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  emptyPlaylistSub: {
    fontSize: 13,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  createBlock: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 14,
    marginBottom: 12,
  },
  createInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  createConfirmBtn: {
    backgroundColor: '#45644A',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
  },
  createConfirmText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  createPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#45644A',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 4,
  },
  createPlaylistBtnText: { color: '#45644A', fontWeight: '700', fontSize: 15 },

  newPlaylistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  newPlaylistIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPlaylistLabel: { fontSize: 15, fontWeight: '600', color: '#45644A' },

  createBlockInline: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  createInlineRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  createInlineInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  createInlineBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#45644A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  playlistItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  playlistItemName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  playlistItemCount: { fontSize: 12, color: '#AAA', marginTop: 1 },
  addToListBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalClose: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
  },
  modalCloseText: { fontSize: 15, fontWeight: '600', color: '#777' },
});
