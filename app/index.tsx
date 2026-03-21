import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  Animated, Dimensions, StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(iconAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
      Animated.timing(buttonAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3EDE3" />
      
      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />
      <View style={[styles.circle, styles.circleRight]} />

      <View style={styles.content}>
        {/* Icon animé */}
        <Animated.View style={[styles.iconWrap, { opacity: iconAnim, transform: [{ scale: iconAnim }] }]}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="musical-notes" size={48} color="#FFF" />
            </View>
          </View>
          <View style={styles.iconDot1} />
          <View style={styles.iconDot2} />
          <View style={styles.iconDot3} />
        </Animated.View>

        {/* Titre */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
          <Text style={styles.title}>I-Music</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Le nouveau son de Madagascar</Text>
          <Text style={styles.tagline}>Votre bibliothèque audio personnelle</Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.features, { opacity: fadeAnim }]}>
          {[
            { icon: 'library-outline', label: 'Bibliothèque' },
            { icon: 'heart-outline', label: 'Favoris' },
            { icon: 'list-outline', label: 'Playlists' },
          ].map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as any} size={18} color="#45644A" />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Bouton */}
        <Animated.View style={{ opacity: buttonAnim, transform: [{ scale: buttonAnim }], width: '100%' }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.88}
          >
            <Text style={styles.buttonText}>Commencer l'aventure</Text>
            <View style={styles.buttonIcon}>
              <Ionicons name="arrow-forward" size={20} color="#45644A" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerLinkText}>Pas encore de compte ? <Text style={styles.registerLinkBold}>Créer un compte</Text></Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3EDE3',
    overflow: 'hidden',
  },
  
  // Decorative
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(69,100,74,0.07)',
  },
  circleTop: {
    width: 320,
    height: 320,
    top: -120,
    left: -80,
  },
  circleBottom: {
    width: 240,
    height: 240,
    bottom: -80,
    right: -60,
    backgroundColor: 'rgba(69,100,74,0.05)',
  },
  circleRight: {
    width: 160,
    height: 160,
    top: '35%',
    right: -70,
    backgroundColor: 'rgba(228,219,196,0.6)',
  },

  content: { 
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 28,
  },

  // Icon
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconOuter: {
    width: 110,
    height: 110,
    borderRadius: 35,
    backgroundColor: '#45644A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#45644A',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot1: {
    position: 'absolute', top: 8, right: -4,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#E4DBC4',
  },
  iconDot2: {
    position: 'absolute', bottom: 6, left: -8,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#45644A',
    opacity: 0.4,
  },
  iconDot3: {
    position: 'absolute', bottom: -4, right: 12,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#45644A',
    opacity: 0.2,
  },

  // Text
  title: { 
    fontSize: 52, 
    fontWeight: '800', 
    color: '#45644A', 
    textAlign: 'center',
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  divider: {
    width: 48,
    height: 4,
    backgroundColor: '#45644A',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
    opacity: 0.5,
  },
  subtitle: { 
    fontSize: 18, 
    color: '#555', 
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  tagline: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // Features
  features: {
    flexDirection: 'row',
    gap: 12,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(69,100,74,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Button
  button: { 
    backgroundColor: '#45644A', 
    paddingVertical: 18, 
    paddingHorizontal: 28,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#45644A',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  buttonText: { 
    color: '#FFF', 
    fontWeight: '700', 
    fontSize: 17,
    letterSpacing: 0.3,
  },
  buttonIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  registerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 14,
    color: '#888',
  },
  registerLinkBold: {
    color: '#45644A',
    fontWeight: '700',
  },
});
