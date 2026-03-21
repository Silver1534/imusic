import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ── Logo ISPM depuis assets/image ─────────────────────────────────────────────
const ISPM_LOGO = require('../assets/image/ispm_logo.png');

// ── Config des bulles ─────────────────────────────────────────────────────────
const BUBBLES = [
  { id: 0,  size: 80,  x: 0.07, startY: 1.10, duration: 7500,  delay: 0,    },
  { id: 1,  size: 55,  x: 0.21, startY: 1.22, duration: 9200,  delay: 1300, },
  { id: 2,  size: 95,  x: 0.39, startY: 1.15, duration: 8100,  delay: 700,  },
  { id: 3,  size: 60,  x: 0.60, startY: 1.10, duration: 10200, delay: 2100, },
  { id: 4,  size: 78,  x: 0.77, startY: 1.20, duration: 7700,  delay: 450,  },
  { id: 5,  size: 48,  x: 0.91, startY: 1.10, duration: 9600,  delay: 3100, },
  { id: 6,  size: 68,  x: 0.13, startY: 1.28, duration: 8600,  delay: 1900, },
  { id: 7,  size: 85,  x: 0.51, startY: 1.32, duration: 7300,  delay: 950,  },
  { id: 8,  size: 52,  x: 0.29, startY: 1.16, duration: 9900,  delay: 2600, },
  { id: 9,  size: 76,  x: 0.69, startY: 1.21, duration: 8300,  delay: 150,  },
  { id: 10, size: 62,  x: 0.84, startY: 1.11, duration: 7900,  delay: 3600, },
  { id: 11, size: 100, x: 0.02, startY: 1.32, duration: 10600, delay: 1600, },
];

// ── Bulle individuelle ────────────────────────────────────────────────────────
function Bubble({ id, size, x, startY, duration, delay }: typeof BUBBLES[0]) {
  const translateY = useRef(new Animated.Value(height * startY)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const run = () => {
      translateY.setValue(height * startY);
      translateX.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.5);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -size * 2,
          duration,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.55, duration: duration * 0.15, delay, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.55, duration: duration * 0.70, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,    duration: duration * 0.15, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(translateX, { toValue: 18,  duration: duration * 0.30, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(translateX, { toValue: -15, duration: duration * 0.35, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 10,  duration: duration * 0.35, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 0.4,
          delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => run());
    };
    run();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: width * x - size / 2,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
    >
      <Image
        source={ISPM_LOGO}
        style={{ width: size * 0.80, height: size * 0.80 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;
  const scaleAnim  = useRef(new Animated.Value(0.85)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const iconAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(iconAnim,   { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
      Animated.timing(buttonAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3EDE3" />

      {/* Bulles ISPM flottantes */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {BUBBLES.map(b => <Bubble key={b.id} {...b} />)}
      </View>

      {/* Contenu central */}
      <View style={styles.content}>

        <Animated.View style={[styles.iconWrap, { opacity: iconAnim, transform: [{ scale: iconAnim }] }]}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="musical-notes" size={48} color="#FFF" />
            </View>
          </View>
          <View style={styles.dot1} />
          <View style={styles.dot2} />
          <View style={styles.dot3} />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
          <Text style={styles.title}>I-Music</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Le nouveau son de Madagascar</Text>
          <Text style={styles.tagline}>Votre bibliothèque audio personnelle</Text>
        </Animated.View>

        <Animated.View style={[styles.features, { opacity: fadeAnim }]}>
          {[
            { icon: 'library-outline', label: 'Bibliothèque' },
            { icon: 'heart-outline',   label: 'Favoris'      },
            { icon: 'list-outline',    label: 'Playlists'    },
          ].map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as any} size={18} color="#45644A" />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={{ opacity: buttonAnim, transform: [{ scale: buttonAnim }], width: '100%' }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.88}
          >
            <Text style={styles.buttonText}>Commencer l'aventure</Text>
            <View style={styles.buttonArrow}>
              <Ionicons name="arrow-forward" size={20} color="#45644A" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerLinkText}>
              Pas encore de compte ?{' '}
              <Text style={styles.registerLinkBold}>Créer un compte</Text>
            </Text>
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
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(69,100,74,0.07)',
    borderWidth: 1.2,
    borderColor: 'rgba(69,100,74,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 28,
  },
  iconWrap:  { alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconOuter: {
    width: 110, height: 110, borderRadius: 35,
    backgroundColor: '#45644A',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#45644A', shadowOpacity: 0.35,
    shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  iconInner: {
    width: 88, height: 88, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  dot1: { position: 'absolute', top: 8,    right: -4,  width: 14, height: 14, borderRadius: 7, backgroundColor: '#E4DBC4' },
  dot2: { position: 'absolute', bottom: 6, left: -8,   width: 10, height: 10, borderRadius: 5, backgroundColor: '#45644A', opacity: 0.4 },
  dot3: { position: 'absolute', bottom: -4, right: 12, width: 8,  height: 8,  borderRadius: 4, backgroundColor: '#45644A', opacity: 0.2 },
  title:    { fontSize: 52, fontWeight: '800', color: '#45644A', textAlign: 'center', letterSpacing: -1.5, lineHeight: 56 },
  divider:  { width: 48, height: 4, backgroundColor: '#45644A', borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 12, opacity: 0.5 },
  subtitle: { fontSize: 18, color: '#555', textAlign: 'center', fontWeight: '500', lineHeight: 24 },
  tagline:  { fontSize: 13, color: '#999', textAlign: 'center', marginTop: 4, letterSpacing: 0.2 },
  features:     { flexDirection: 'row', gap: 12 },
  featureItem:  { alignItems: 'center', gap: 6, flex: 1 },
  featureIcon:  { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(69,100,74,0.10)', alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontSize: 11, color: '#666', fontWeight: '600', letterSpacing: 0.3 },
  button: {
    backgroundColor: '#45644A',
    paddingVertical: 18, paddingHorizontal: 28,
    borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12,
    shadowColor: '#45644A', shadowOpacity: 0.30,
    shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  buttonText:  { color: '#FFF', fontWeight: '700', fontSize: 17, letterSpacing: 0.3 },
  buttonArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  registerLink:     { marginTop: 16, alignItems: 'center' },
  registerLinkText: { fontSize: 14, color: '#888' },
  registerLinkBold: { color: '#45644A', fontWeight: '700' },
});
