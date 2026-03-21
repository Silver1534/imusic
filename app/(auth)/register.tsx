import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, TextInput, TouchableOpacity, Text,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  useWindowDimensions, Animated, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
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

  const handleRegister = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(auth)/login');
    }, 1800);
  };

  const innerWidth = Math.min(width - 48, 440);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F3EDE3" />

      <View style={[styles.deco, styles.decoTop]} />
      <View style={[styles.deco, styles.decoBottom]} />

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
        <View style={styles.iconWrap}>
          <View style={styles.iconBox}>
            <Ionicons name="person-add" size={26} color="#FFF" />
          </View>
        </View>

        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez I-Music dès aujourd'hui !</Text>

        {/* Username */}
        <View style={[styles.inputWrap, focusedField === 'username' && styles.inputWrapFocused]}>
          <Ionicons
            name="person-outline" size={18}
            color={focusedField === 'username' ? '#45644A' : '#AAA'}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            placeholderTextColor="#BBB"
            value={username}
            onChangeText={setUsername}
            editable={!isLoading}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Email */}
        <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
          <Ionicons
            name="mail-outline" size={18}
            color={focusedField === 'email' ? '#45644A' : '#AAA'}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#BBB"
            keyboardType="email-address"
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
            name="key-outline" size={18}
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

        {/* Strength hint */}
        <Text style={styles.hint}>🔒 Utilisez au moins 8 caractères</Text>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Créer mon compte</Text>
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Déjà inscrit ? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Se connecter</Text>
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
    width: 260, height: 260,
    top: -90, right: -60,
    backgroundColor: 'rgba(69,100,74,0.07)',
  },
  decoBottom: {
    width: 180, height: 180,
    bottom: -50, left: -40,
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
    fontSize: 30, fontWeight: '800', color: '#45644A',
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
    marginBottom: 12,
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

  hint: {
    fontSize: 12, color: '#AAA',
    marginBottom: 20, marginTop: -4,
    marginLeft: 4,
  },

  button: {
    backgroundColor: '#45644A',
    borderRadius: 16, height: 56,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 10,
    shadowColor: '#45644A',
    shadowOpacity: 0.28, shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  buttonDisabled: { backgroundColor: '#8da391', elevation: 0, shadowOpacity: 0 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  loginRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 20,
  },
  loginText: { fontSize: 14, color: '#999' },
  loginLink: { fontSize: 14, color: '#45644A', fontWeight: '700' },
});
