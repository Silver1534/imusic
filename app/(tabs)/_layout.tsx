import React, { useState, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet, View, Text, TouchableOpacity, Modal,
  useWindowDimensions, Platform, Animated, TextInput,
  Keyboard, KeyboardAvoidingView, StatusBar,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useMusic } from '../_context/MusicContext';
import { useTheme } from '../_context/ThemeContext';

const formatTime = (millis: number) => {
  const min = Math.floor(millis / 60000);
  const sec = Math.floor((millis % 60000) / 1000);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

// ─── Search Context ────────────────────────────────────────────────────────────
export const SearchContext = React.createContext<{
  searchVisible: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  closeSearch: () => void;
}>({
  searchVisible: false,
  searchQuery: '',
  setSearchQuery: () => {},
  closeSearch: () => {},
});

export const useSearch = () => React.useContext(SearchContext);

// ─── Full Screen Player ────────────────────────────────────────────────────────
function FullScreenPlayer() {
  const {
    playingSong, isPlaying, handlePlayPause, isFullPlayerVisible,
    setIsFullPlayerVisible, playNext, playPrevious, position, duration, seek,
  } = useMusic();
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();

  if (!playingSong) return null;
  const albumSize = width > 500 ? 320 : width * 0.72;

  return (
    <Modal visible={isFullPlayerVisible} animationType="slide">
      <View style={[styles.fullContainer, isDarkMode && styles.bgDark]}>
        <TouchableOpacity onPress={() => setIsFullPlayerVisible(false)} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={40} color={isDarkMode ? '#FFF' : '#45644A'} />
        </TouchableOpacity>
        <View style={[styles.albumArt, { width: albumSize, height: albumSize }]}>
          <Ionicons name="musical-notes" size={albumSize / 2} color="#FFF" />
        </View>
        <Text numberOfLines={1} style={[styles.fullTitle, isDarkMode && styles.textWhite]}>
          {playingSong.title}
        </Text>
        <View style={styles.sliderSection}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#45644A"
            maximumTrackTintColor={isDarkMode ? '#333' : '#E0E0E0'}
            thumbTintColor="#45644A"
            onSlidingComplete={seek}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={playPrevious}>
            <Ionicons name="play-back" size={50} color="#45644A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePlayPause(playingSong)}>
            <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={90} color="#45644A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={playNext}>
            <Ionicons name="play-forward" size={50} color="#45644A" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Mini Player ───────────────────────────────────────────────────────────────
function MiniPlayer() {
  const { playingSong, isPlaying, handlePlayPause, setIsFullPlayerVisible } = useMusic();
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  if (!playingSong) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.miniPlayer,
        isDarkMode && styles.cardDark,
        { width: width - 40, left: 20 },
      ]}
      onPress={() => setIsFullPlayerVisible(true)}
    >
      <View style={styles.miniDiscIcon}>
        <Ionicons name="disc" size={22} color="#FFF" />
      </View>
      <Text numberOfLines={1} style={[styles.miniText, isDarkMode && styles.textWhite]}>
        {playingSong.title}
      </Text>
      <TouchableOpacity
        onPress={(e) => { e.stopPropagation(); handlePlayPause(playingSong); }}
        style={styles.miniPlayBtn}
      >
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#45644A" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Search Bar EN HAUT ────────────────────────────────────────────────────────
function SearchBar() {
  const { searchVisible, searchQuery, setSearchQuery, closeSearch } = useSearch();
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    if (searchVisible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0, useNativeDriver: true, tension: 90, friction: 11,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1, duration: 180, useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => inputRef.current?.focus(), 50);
      });
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -80, useNativeDriver: true, tension: 90, friction: 11,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0, duration: 140, useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [searchVisible]);

  if (!mounted) return null;

  const statusBarHeight = StatusBar.currentHeight || 0;
  const topOffset = Platform.OS === 'ios' ? 54 : statusBarHeight + 10;

  return (
    <Animated.View
      style={[
        styles.searchBarWrapper,
        isDarkMode && styles.searchBarDark,
        {
          top: topOffset,
          width: width - 32,
          left: 16,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Ionicons
        name="search"
        size={18}
        color={isDarkMode ? '#AAA' : '#666'}
        style={{ marginRight: 10 }}
      />
      <TextInput
        ref={inputRef}
        placeholder="Rechercher une musique..."
        placeholderTextColor={isDarkMode ? '#666' : '#AAA'}
        style={[styles.searchInput, isDarkMode && { color: '#FFF' }]}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        onSubmitEditing={Keyboard.dismiss}
        autoCorrect={false}
      />
      {searchQuery !== '' && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={18} color={isDarkMode ? '#666' : '#CCC'} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={closeSearch} style={styles.cancelBtn}>
        <Text style={[styles.cancelText, isDarkMode && { color: '#AAA' }]}>Annuler</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Tab Layout ────────────────────────────────────────────────────────────────
export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const closeSearch = () => {
    Keyboard.dismiss();
    setSearchQuery('');
    setSearchVisible(false);
  };

  // Largeur de la tabbar responsive
  const tabBarWidth = Math.min(width - 40, 500);
  const tabBarLeft = (width - tabBarWidth) / 2;

  return (
    <SearchContext.Provider value={{ searchVisible, searchQuery, setSearchQuery, closeSearch }}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#45644A',
            tabBarInactiveTintColor: isDarkMode ? '#555' : '#AAA',
            tabBarStyle: {
              position: 'absolute',
              bottom: 20,
              left: tabBarLeft,
              right: tabBarLeft,
              height: 64,
              borderRadius: 32,
              backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
              elevation: 12,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              borderTopWidth: 0,
              paddingHorizontal: 8,
            },
            tabBarItemStyle: {
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            },
          }}
        >
          {/* Accueil */}
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
                  <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? '#FFF' : color} />
                </View>
              ),
            }}
          />

          {/* Playlists */}
          <Tabs.Screen
            name="playlists"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
                  <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={focused ? '#FFF' : color} />
                </View>
              ),
            }}
          />

          {/* Loupe — bouton spécial centré */}
          <Tabs.Screen
            name="search"
            options={{
              tabBarButton: () => (
                <TouchableOpacity
                  onPress={() => searchVisible ? closeSearch() : setSearchVisible(true)}
                  style={styles.searchTabBtnWrapper}
                  activeOpacity={0.85}
                >
                  <View style={[
                    styles.searchTabBtn,
                    searchVisible && styles.searchTabBtnActive,
                    isDarkMode && !searchVisible && styles.searchTabBtnDark,
                  ]}>
                    <Ionicons
                      name={searchVisible ? 'close' : 'search'}
                      size={22}
                      color={searchVisible ? '#FFF' : isDarkMode ? '#AAA' : '#888'}
                    />
                  </View>
                </TouchableOpacity>
              ),
            }}
          />

          {/* Paramètres */}
          <Tabs.Screen
            name="settings"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
                  <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={focused ? '#FFF' : color} />
                </View>
              ),
            }}
          />
        </Tabs>

        {/* Barre de recherche en haut */}
        <SearchBar />

        {/* Mini player au-dessus de la tabbar */}
        <MiniPlayer />

        {/* Lecteur plein écran */}
        <FullScreenPlayer />
      </View>
    </SearchContext.Provider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bgDark: { backgroundColor: '#121212' },
  cardDark: { backgroundColor: '#1C1C1E' },
  textWhite: { color: '#FFF' },

  // ── Tab icons ──
  tabIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: '#45644A',
  },

  // ── Bouton loupe ──
  searchTabBtnWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTabBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  searchTabBtnActive: {
    backgroundColor: '#45644A',
  },
  searchTabBtnDark: {
    backgroundColor: '#2C2C2E',
  },

  // ── Mini Player ──
  miniPlayer: {
    position: 'absolute',
    bottom: 96,
    height: 68,
    backgroundColor: '#FFF',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    elevation: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  miniDiscIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#45644A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  miniText: { flex: 1, fontWeight: '600', fontSize: 14, color: '#1A1A1A' },
  miniPlayBtn: { padding: 4 },

  // ── Full Player ──
  fullContainer: {
    flex: 1,
    backgroundColor: '#F3EDE3',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 50,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginLeft: 24,
    marginTop: Platform.OS === 'ios' ? 16 : 8,
  },
  albumArt: {
    backgroundColor: '#45644A',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#45644A',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  fullTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 32,
    color: '#1A1A1A',
  },
  sliderSection: { width: '88%', alignItems: 'center' },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', width: '96%' },
  timeText: { color: '#888', fontSize: 12, fontWeight: '600' },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '88%',
    justifyContent: 'space-evenly',
    marginBottom: 16,
  },

  // ── Search bar EN HAUT ──
  searchBarWrapper: {
    position: 'absolute',
    zIndex: 999,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  searchBarDark: {
    backgroundColor: '#1C1C1E',
    shadowOpacity: 0.4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    paddingVertical: 0,
  },
  clearBtn: { padding: 4, marginRight: 4 },
  cancelBtn: { paddingLeft: 10, paddingVertical: 4 },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#45644A',
  },
});
