import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Song {
  id: string;
  title: string;
  uri: string;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
}

interface MusicContextType {
  playingSong: Song | null;
  isPlaying: boolean;
  isFullPlayerVisible: boolean;
  setIsFullPlayerVisible: (visible: boolean) => void;
  handlePlayPause: (song: Song, playlist?: Song[]) => Promise<void>;
  updatePlaylist: (newList: Song[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  stopAndReset: () => Promise<void>;
  position: number;
  duration: number;
  seek: (value: number) => Promise<void>;
  favorites: string[];
  toggleFavorite: (songId: string) => void;
  isFavorite: (songId: string) => boolean;
  playlists: Playlist[];
  createPlaylist: (name: string, id?: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
}

// ✅ Valeur par défaut complète — jamais undefined
const defaultContext: MusicContextType = {
  playingSong: null,
  isPlaying: false,
  isFullPlayerVisible: false,
  setIsFullPlayerVisible: () => {},
  handlePlayPause: async () => {},
  updatePlaylist: () => {},
  playNext: () => {},
  playPrevious: () => {},
  stopAndReset: async () => {},
  position: 0,
  duration: 0,
  seek: async () => {},
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  playlists: [],
  createPlaylist: () => {},
  deletePlaylist: () => {},
  addSongToPlaylist: () => {},
  removeSongFromPlaylist: () => {},
  renamePlaylist: () => {},
};

const MusicContext = createContext<MusicContextType>(defaultContext);

const FAVORITES_KEY = '@favorites';
const PLAYLISTS_KEY = '@playlists';

// ✅ Nettoie une playlist corrompue (sans songIds)
function sanitizePlaylist(p: any): Playlist {
  return {
    id: String(p?.id ?? Date.now()),
    name: String(p?.name ?? 'Sans nom'),
    songIds: Array.isArray(p?.songIds) ? p.songIds : [],
  };
}

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [playingSong, setPlayingSong] = useState<Song | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    loadFavorites();
    loadPlaylists();
  }, []);

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem(FAVORITES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error('Erreur chargement favoris', e);
      setFavorites([]);
    }
  };

  const loadPlaylists = async () => {
    try {
      const saved = await AsyncStorage.getItem(PLAYLISTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // ✅ Nettoie chaque playlist au chargement
          const clean = parsed.map(sanitizePlaylist);
          setPlaylists(clean);
          // ✅ Resauvegarde les données nettoyées
          await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(clean));
        } else {
          setPlaylists([]);
          await AsyncStorage.setItem(PLAYLISTS_KEY, '[]');
        }
      }
    } catch (e) {
      console.error('Erreur chargement playlists', e);
      setPlaylists([]);
      try { await AsyncStorage.setItem(PLAYLISTS_KEY, '[]'); } catch {}
    }
  };

  const saveFavorites = async (data: string[]) => {
    try { await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(data)); }
    catch (e) { console.error(e); }
  };

  const savePlaylists = async (data: Playlist[]) => {
    try { await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(data)); }
    catch (e) { console.error(e); }
  };

  const toggleFavorite = (songId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId];
      saveFavorites(updated);
      return updated;
    });
  };

  const isFavorite = (songId: string) => favorites.includes(songId);

  // ✅ createPlaylist accepte un id optionnel pour éviter les problèmes de timing
  const createPlaylist = (name: string, id?: string) => {
    const newP: Playlist = {
      id: id ?? Date.now().toString(),
      name,
      songIds: [],
    };
    setPlaylists(prev => {
      const updated = [...prev, newP];
      savePlaylists(updated);
      return updated;
    });
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => {
      const updated = prev.filter(p => p.id !== id);
      savePlaylists(updated);
      return updated;
    });
  };

  const addSongToPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id !== playlistId) return p;
        const ids = Array.isArray(p.songIds) ? p.songIds : [];
        if (ids.includes(songId)) return p;
        return { ...p, songIds: [...ids, songId] };
      });
      savePlaylists(updated);
      return updated;
    });
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id !== playlistId) return p;
        const ids = Array.isArray(p.songIds) ? p.songIds : [];
        return { ...p, songIds: ids.filter(id => id !== songId) };
      });
      savePlaylists(updated);
      return updated;
    });
  };

  const renamePlaylist = (playlistId: string, newName: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p =>
        p.id === playlistId ? { ...p, name: newName } : p
      );
      savePlaylists(updated);
      return updated;
    });
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      if (status.didJustFinish) playNext();
    }
  };

  const updatePlaylist = (newList: Song[]) => setCurrentPlaylist(newList);

  async function loadAndPlay(song: Song) {
    if (sound) await sound.unloadAsync();
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: song.uri },
      { shouldPlay: true }
    );
    newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    setSound(newSound);
    setPlayingSong(song);
    setIsPlaying(true);
  }

  async function handlePlayPause(song: Song, playlist?: Song[]) {
    if (playlist) setCurrentPlaylist(playlist);
    if (playingSong?.id === song.id && sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) { await sound.pauseAsync(); setIsPlaying(false); }
        else { await sound.playAsync(); setIsPlaying(true); }
      }
    } else {
      await loadAndPlay(song);
    }
  }

  const seek = async (value: number) => {
    if (sound) { await sound.setPositionAsync(value); setPosition(value); }
  };

  const stopAndReset = async () => {
    if (sound) { await sound.stopAsync(); await sound.unloadAsync(); setSound(null); }
    setPlayingSong(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  };

  const playNext = () => {
    if (currentPlaylist.length === 0) return;
    const idx = currentPlaylist.findIndex(s => s.id === playingSong?.id);
    if (idx === -1) return;
    loadAndPlay(currentPlaylist[(idx + 1) % currentPlaylist.length]);
  };

  const playPrevious = () => {
    if (currentPlaylist.length === 0) return;
    const idx = currentPlaylist.findIndex(s => s.id === playingSong?.id);
    if (idx === -1) return;
    loadAndPlay(currentPlaylist[idx <= 0 ? currentPlaylist.length - 1 : idx - 1]);
  };

  return (
    <MusicContext.Provider value={{
      playingSong, isPlaying, isFullPlayerVisible, setIsFullPlayerVisible,
      handlePlayPause, updatePlaylist, playNext, playPrevious, stopAndReset,
      position, duration, seek,
      favorites, toggleFavorite, isFavorite,
      playlists, createPlaylist, deletePlaylist, addSongToPlaylist,
      removeSongFromPlaylist, renamePlaylist,
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
