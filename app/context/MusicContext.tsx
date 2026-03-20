import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Audio } from 'expo-av';

export interface Song { 
  id: string; 
  title: string; 
  uri: string; 
}

interface MusicContextType {
  playingSong: Song | null;
  isPlaying: boolean;
  isFullPlayerVisible: boolean;
  setIsFullPlayerVisible: (visible: boolean) => void;
  handlePlayPause: (song: Song, playlist?: Song[]) => Promise<void>;
  playNext: () => void;
  playPrevious: () => void;
  stopAndReset: () => Promise<void>; // Nouvelle fonction
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [playingSong, setPlayingSong] = useState<Song | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);

  // Fonction interne pour charger et lancer un son proprement
  async function loadAndPlay(song: Song) {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: song.uri },
      { shouldPlay: true }
    );
    
    setSound(newSound);
    setPlayingSong(song);
    setIsPlaying(true);

    // Passer au suivant automatiquement à la fin de la piste
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        playNext();
      }
    });
  }

  // Gère le Play/Pause ou le chargement d'un nouveau titre
  async function handlePlayPause(song: Song, playlist?: Song[]) {
    if (playlist) setCurrentPlaylist(playlist);
    
    if (playingSong?.id === song.id && sound) {
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
    
    await loadAndPlay(song);
  }

  // Fonction pour tout arrêter (utilisée lors de la suppression)
  const stopAndReset = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setPlayingSong(null);
    setIsPlaying(false);
  };

  const playNext = () => {
    if (currentPlaylist.length === 0) return;
    const currentIndex = currentPlaylist.findIndex(s => s.id === playingSong?.id);
    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    loadAndPlay(currentPlaylist[nextIndex]);
  };

  const playPrevious = () => {
    if (currentPlaylist.length === 0) return;
    const currentIndex = currentPlaylist.findIndex(s => s.id === playingSong?.id);
    const prevIndex = currentIndex <= 0 ? currentPlaylist.length - 1 : currentIndex - 1;
    loadAndPlay(currentPlaylist[prevIndex]);
  };

  return (
    <MusicContext.Provider value={{ 
      playingSong, 
      isPlaying, 
      isFullPlayerVisible, 
      setIsFullPlayerVisible, 
      handlePlayPause, 
      playNext, 
      playPrevious,
      stopAndReset
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within a MusicProvider");
  return context;
};