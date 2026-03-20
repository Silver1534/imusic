import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_context/ThemeContext';

interface MiniPlayerProps {
  song: { title: string } | null;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function MiniPlayer({ song, isPlaying, onPlayPause }: MiniPlayerProps) {
  const { isDarkMode } = useTheme();

  if (!song) return null; // Ne rien afficher si aucune musique n'est sélectionnée

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.content}>
        {/* Image / Icone de la musique */}
        <View style={styles.imagePlaceholder}>
          <Ionicons name="musical-note" size={20} color="#FFF" />
        </View>

        {/* Infos de la musique */}
        <View style={styles.info}>
          <Text numberOfLines={1} style={[styles.title, isDarkMode && styles.textDark]}>
            {song.title}
          </Text>
          <Text style={styles.subtitle}>Lecture en cours</Text>
        </View>

        {/* Bouton Play/Pause */}
        <TouchableOpacity onPress={onPlayPause} style={styles.playBtn}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={28} 
            color={isDarkMode ? "#A5D6A7" : "#45644A"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Juste au-dessus de la TabBar (ajuste selon ton design)
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: '#FFF',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    justifyContent: 'center',
  },
  containerDark: { backgroundColor: '#1E1E1E' },
  content: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  imagePlaceholder: { 
    width: 45, 
    height: 45, 
    borderRadius: 12, 
    backgroundColor: '#45644A', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  info: { flex: 1, marginLeft: 15 },
  title: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  textDark: { color: '#FFF' },
  subtitle: { fontSize: 11, color: '#888' },
  playBtn: { padding: 5 },
});