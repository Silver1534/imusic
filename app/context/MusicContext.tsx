import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

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
  updatePlaylist: (newList: Song[]) => void; // Nouvelle fonction
  playNext: () => void;
  playPrevious: () => void;
  stopAndReset: () => Promise<void>;
  position: number;
  duration: number;
  seek: (value: number) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [playingSong, setPlayingSong] = useState<Song | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      if (status.didJustFinish) playNext();
    }
  };

  // Synchronise la playlist interne avec les changements (suppression/import)
  const updatePlaylist = (newList: Song[]) => {
    setCurrentPlaylist(newList);
  };

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
        if (status.isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } else {
      await loadAndPlay(song);
    }
  }

  const seek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  const stopAndReset = async () => {
    if (sound) {
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
    if (currentPlaylist.length === 0) return;
    const currentIndex = currentPlaylist.findIndex(s => s.id === playingSong?.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    loadAndPlay(currentPlaylist[nextIndex]);
  };

  const playPrevious = () => {
    if (currentPlaylist.length === 0) return;
    const currentIndex = currentPlaylist.findIndex(s => s.id === playingSong?.id);
    if (currentIndex === -1) return;
    const prevIndex = currentIndex <= 0 ? currentPlaylist.length - 1 : currentIndex - 1;
    loadAndPlay(currentPlaylist[prevIndex]);
  };

  return (
    <MusicContext.Provider value={{ 
      playingSong, isPlaying, isFullPlayerVisible, setIsFullPlayerVisible,
      handlePlayPause, updatePlaylist, playNext, playPrevious, stopAndReset,
      position, duration, seek 
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within MusicProvider");
  return context;
};