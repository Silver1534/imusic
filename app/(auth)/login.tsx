import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, TextInput, TouchableOpacity, Text,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  useWindowDimensions, Animated, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1800);
  };

  const innerWidth = Math.min(width - 48, 440);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F3EDE3" />

      {/* Decorative */}
      <View style={[styles.deco, styles.decoTop]} />
      <View style={[styles.deco, styles.decoBottom]} />

      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backBtnInner}>
          <Ionicons name="arrow-back" size={20} color="#45644A" />
        </View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.inner,
          { width: innerWidth, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Top icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconBox}>
            <Ionicons name="lock-closed" size={26} color="#FFF" />
          </View>
        </View>

        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Content de vous revoir !</Text>

        {/* Email */}
        <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={focusedField === 'email' ? '#45644A' : '#AAA'}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email ou Utilisateur"
            placeholderTextColor="#BBB"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={[styles.inputWrap, focusedField === 'password' && styles.inputWrapFocused]}>
          <Ionicons
            name="key-outline"
            size={18}
            color={focusedField === 'password' ? '#45644A' : '#AAA'}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#BBB"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#AAA" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotLink}>
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Se connecter</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Pas de compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EDE3', alignItems: 'center', justifyContent: 'center' },

  deco: { position: 'absolute', borderRadius: 999 },
  decoTop: {
    width: 280, height: 280,
    top: -100, left: -80,
    backgroundColor: 'rgba(69,100,74,0.07)',
  },
  decoBottom: {
    width: 200, height: 200,
    bottom: -60, right: -50,
    backgroundColor: 'rgba(228,219,196,0.6)',
  },

  backButton: { position: 'absolute', top: 60, left: 24, zIndex: 10 },
  backBtnInner: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(69,100,74,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  inner: { alignSelf: 'center', paddingHorizontal: 4 },

  iconWrap: { alignItems: 'center', marginBottom: 20 },
  iconBox: {
    width: 68, height: 68, borderRadius: 22,
    backgroundColor: '#45644A',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#45644A',
    shadowOpacity: 0.3, shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 10,
  },

  title: {
    fontSize: 32, fontWeight: '800', color: '#45644A',
    textAlign: 'center', letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14, color: '#999', textAlign: 'center',
    marginTop: 4, marginBottom: 28, fontWeight: '500',
  },

  inputWrap: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E0D0',
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 56,
  },
  inputWrapFocused: {
    borderColor: '#45644A',
    shadowColor: '#45644A',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    paddingVertical: 0,
  },
  eyeBtn: { padding: 4 },

  forgotLink: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -4 },
  forgotText: { fontSize: 13, color: '#45644A', fontWeight: '600' },

  button: {
    backgroundColor: '#45644A',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#45644A',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  buttonDisabled: { backgroundColor: '#8da391', elevation: 0, shadowOpacity: 0 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  registerRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 20,
  },
  registerText: { fontSize: 14, color: '#999' },
  registerLink: { fontSize: 14, color: '#45644A', fontWeight: '700' },
});
