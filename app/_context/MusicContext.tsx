// app/_context/MusicContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

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
  // Songs — source de vérité unique
  songs: Song[];
  addSong: (song: Song) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
  // Playback
  playingSong: Song | null;
  isPlaying: boolean;
  isFullPlayerVisible: boolean;
  setIsFullPlayerVisible: (visible: boolean) => void;
  handlePlayPause: (song: Song, playlist?: Song[]) => Promise<void>;
  playNext: () => void;
  playPrevious: () => void;
  stopAndReset: () => Promise<void>;
  position: number;
  duration: number;
  seek: (value: number) => Promise<void>;
  // Favoris
  favorites: string[];
  toggleFavorite: (songId: string) => void;
  isFavorite: (songId: string) => boolean;
  // Playlists
  playlists: Playlist[];
  createPlaylist: (name: string, id?: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
}

const SONGS_KEY     = '@my_songs_list';
const FAVORITES_KEY = '@favorites';
const PLAYLISTS_KEY = '@playlists';

function sanitizePlaylist(p: any): Playlist {
  return {
    id: String(p?.id ?? Date.now()),
    name: String(p?.name ?? 'Sans nom'),
    songIds: Array.isArray(p?.songIds) ? p.songIds : [],
  };
}

const defaultContext: MusicContextType = {
  songs: [],
  addSong: async () => {},
  deleteSong: async () => {},
  playingSong: null,
  isPlaying: false,
  isFullPlayerVisible: false,
  setIsFullPlayerVisible: () => {},
  handlePlayPause: async () => {},
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

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [songs, setSongs]           = useState<Song[]>([]);
  const [sound, setSound]           = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [playingSong, setPlayingSong] = useState<Song | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const [position, setPosition]     = useState(0);
  const [duration, setDuration]     = useState(0);
  const [favorites, setFavorites]   = useState<string[]>([]);
  const [playlists, setPlaylists]   = useState<Playlist[]>([]);

  // Ref pour accéder aux valeurs courantes sans capturer des closures périmées
  const playingSongRef    = useRef<Song | null>(null);
  const currentPlaylistRef = useRef<Song[]>([]);
  playingSongRef.current    = playingSong;
  currentPlaylistRef.current = currentPlaylist;

  useEffect(() => {
    loadAll();
    return () => {
      // Nettoyage au démontage
      sound?.unloadAsync();
    };
  }, []);

  const loadAll = async () => {
    try {
      const [savedSongs, savedFavs, savedPlaylists] = await Promise.all([
        AsyncStorage.getItem(SONGS_KEY),
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(PLAYLISTS_KEY),
      ]);

      let parsedSongs: Song[] = [];
      if (savedSongs) {
        const arr = JSON.parse(savedSongs);
        if (Array.isArray(arr)) parsedSongs = arr;
      }
      setSongs(parsedSongs);

      let parsedFavs: string[] = [];
      if (savedFavs) {
        const arr = JSON.parse(savedFavs);
        if (Array.isArray(arr)) {
          // Nettoyage : garder seulement les favoris dont la song existe encore
          const songIds = new Set(parsedSongs.map(s => s.id));
          parsedFavs = arr.filter((id: string) => songIds.has(id));
        }
      }
      setFavorites(parsedFavs);

      let parsedPlaylists: Playlist[] = [];
      if (savedPlaylists) {
        const arr = JSON.parse(savedPlaylists);
        if (Array.isArray(arr)) {
          parsedPlaylists = arr.map(sanitizePlaylist);
          // Nettoyage : retirer les songIds orphelins dans les playlists
          const songIds = new Set(parsedSongs.map(s => s.id));
          parsedPlaylists = parsedPlaylists.map(p => ({
            ...p,
            songIds: p.songIds.filter(id => songIds.has(id)),
          }));
        }
      }
      setPlaylists(parsedPlaylists);

      // Resauvegarder les données nettoyées
      await Promise.all([
        AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(parsedFavs)),
        AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(parsedPlaylists)),
      ]);
    } catch (e) {
      console.error('Erreur chargement données', e);
    }
  };

  // ── Songs ──────────────────────────────────────────────────────────────────

  const addSong = async (song: Song) => {
    setSongs(prev => {
      const updated = [...prev, song];
      AsyncStorage.setItem(SONGS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteSong = async (songId: string) => {
    // 1. Arrêter la lecture si c'est la chanson en cours
    if (playingSongRef.current?.id === songId) {
      await stopAndReset();
    }

    // 2. Trouver l'URI avant de supprimer
    let uriToDelete: string | undefined;
    setSongs(prev => {
      const song = prev.find(s => s.id === songId);
      uriToDelete = song?.uri;
      const updated = prev.filter(s => s.id !== songId);
      AsyncStorage.setItem(SONGS_KEY, JSON.stringify(updated));
      return updated;
    });

    // 3. Supprimer le fichier audio du disque
    if (uriToDelete) {
      try {
        const info = await FileSystem.getInfoAsync(uriToDelete);
        if (info.exists) {
          await FileSystem.deleteAsync(uriToDelete, { idempotent: true });
        }
      } catch (e) {
        console.warn('Impossible de supprimer le fichier audio', e);
      }
    }

    // 4. Nettoyer favoris et playlists
    setFavorites(prev => {
      const updated = prev.filter(id => id !== songId);
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });

    setPlaylists(prev => {
      const updated = prev.map(p => ({
        ...p,
        songIds: p.songIds.filter(id => id !== songId),
      }));
      AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // ── Favoris ───────────────────────────────────────────────────────────────

  const toggleFavorite = (songId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (songId: string) => favorites.includes(songId);

  // ── Playlists ─────────────────────────────────────────────────────────────

  const createPlaylist = (name: string, id?: string) => {
    const newP: Playlist = { id: id ?? Date.now().toString(), name, songIds: [] };
    setPlaylists(prev => {
      const updated = [...prev, newP];
      AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => {
      const updated = prev.filter(p => p.id !== id);
      AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const addSongToPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id !== playlistId) return p;
        if (p.songIds.includes(songId)) return p;
        return { ...p, songIds: [...p.songIds, songId] };
      });
      AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p =>
        p.id !== playlistId ? p : { ...p, songIds: p.songIds.filter(id => id !== songId) }
      );
      AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const renamePlaylist = (playlistId: string, newName: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p =>
        p.id === playlistId ? { ...p, name: newName } : p
      );
      AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // ── Playback ──────────────────────────────────────────────────────────────

  // Callback stable via ref — évite les closures périmées
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis ?? 0);
      if (status.didJustFinish) {
        // Utilise les refs pour avoir les valeurs courantes
        const playlist = currentPlaylistRef.current;
        const current  = playingSongRef.current;
        if (!current || playlist.length === 0) return;
        const idx = playlist.findIndex(s => s.id === current.id);
        if (idx === -1) return;
        loadAndPlay(playlist[(idx + 1) % playlist.length]);
      }
    }
  };

  const loadAndPlay = async (song: Song) => {
    // Annuler le callback avant de décharger — évite les événements fantômes
    if (sound) {
      sound.setOnPlaybackStatusUpdate(null);
      await sound.unloadAsync();
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true }
      );
      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      setSound(newSound);
      setPlayingSong(song);
      setIsPlaying(true);
    } catch (e) {
      console.error('Erreur lecture audio', e);
      setPlayingSong(null);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async (song: Song, playlist?: Song[]) => {
    if (playlist) setCurrentPlaylist(playlist);
    if (playingSong?.id === song.id && sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) { await sound.pauseAsync(); setIsPlaying(false); }
        else                  { await sound.playAsync();  setIsPlaying(true);  }
      }
    } else {
      await loadAndPlay(song);
    }
  };

  const seek = async (value: number) => {
    if (sound) { await sound.setPositionAsync(value); setPosition(value); }
  };

  const stopAndReset = async () => {
    if (sound) {
      sound.setOnPlaybackStatusUpdate(null);
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setPlayingSong(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  };

  const playNext = () => {
    const playlist = currentPlaylistRef.current;
    const current  = playingSongRef.current;
    if (!current || playlist.length === 0) return;
    const idx = playlist.findIndex(s => s.id === current.id);
    if (idx === -1) return;
    loadAndPlay(playlist[(idx + 1) % playlist.length]);
  };

  const playPrevious = () => {
    const playlist = currentPlaylistRef.current;
    const current  = playingSongRef.current;
    if (!current || playlist.length === 0) return;
    const idx = playlist.findIndex(s => s.id === current.id);
    if (idx === -1) return;
    loadAndPlay(playlist[idx <= 0 ? playlist.length - 1 : idx - 1]);
  };

  return (
    <MusicContext.Provider value={{
      songs, addSong, deleteSong,
      playingSong, isPlaying, isFullPlayerVisible, setIsFullPlayerVisible,
      handlePlayPause, playNext, playPrevious, stopAndReset,
      position, duration, seek,
      favorites, toggleFavorite, isFavorite,
      playlists, createPlaylist, deletePlaylist,
      addSongToPlaylist, removeSongFromPlaylist, renamePlaylist,
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);