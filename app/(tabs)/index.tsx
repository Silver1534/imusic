import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av'; // 1. Importer Audio
import { Ionicons } from '@expo/vector-icons';

export default function MusicIndex() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // 2. Fonction pour charger et jouer la musique
  async function playSound() {
    console.log('Chargement du son...');
    const { sound } = await Audio.Sound.createAsync(
       require('../../assets/music/Twenty One Pilots - The Line (Instrumental)(MP3_160K).mp3') // Chemin vers ton fichier
    );
    setSound(sound);

    console.log('Lecture...');
    await sound.playAsync();
  }

  // 3. Nettoyer la mémoire quand on quitte la page
  useEffect(() => {
    return sound
      ? () => {
          console.log('Arrêt du son...');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <Text style={styles.sectionTitle}>Popular Songs</Text>
      
      {/* 4. On lie la fonction au clic sur la carte */}
      <TouchableOpacity style={styles.songItem} onPress={playSound}>
        <View style={styles.songInfo}>
          <View style={styles.songImagePlaceholder} />
          <View>
            <Text style={styles.songTitle}>Ma Musique Malagasy</Text>
            <Text style={styles.artistName}>Artiste Local</Text>
          </View>
        </View>
        <Ionicons name="play-circle" size={30} color="#45644A" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3EDE3', 
    paddingHorizontal: 20 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 60, 
    marginBottom: 30 
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#45644A' 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#333', 
    marginBottom: 20, 
    marginTop: 10 
  },
  albumScroll: { 
    marginBottom: 30 
  },
  albumCard: { 
    marginRight: 20, 
    width: 160 
  },
  albumImagePlaceholder: { 
    width: 160, 
    height: 160, 
    borderRadius: 25, 
    backgroundColor: '#E4DBC4', 
    marginBottom: 10 
  },
  albumName: { 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  songItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  songInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  songImagePlaceholder: { 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    backgroundColor: '#45644A', 
    marginRight: 15 
  },
  songTitle: { 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  artistName: { 
    color: '#888', 
    fontSize: 12 
  },
  songDuration: { 
    color: '#A0A0A0' 
  }
});