import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // Refs pour changer le style du border sans re-render
  const usernameWrapRef = useRef<View>(null);
  const emailWrapRef = useRef<View>(null);
  const passwordWrapRef = useRef<View>(null);

  const focusStyle = {
    borderColor: '#45644A',
    shadowColor: '#45644A',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  };
  const blurStyle = {
    borderColor: '#E8E0D0',
    shadowOpacity: 0,
    elevation: 0,
  };

  const handleRegister = () => {
    if (!username.trim()) {
      Alert.alert('Champ requis', "Veuillez saisir un nom d'utilisateur.");
      return;
    }
    if (!email.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir votre adresse email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Email invalide', 'Veuillez saisir une adresse email valide.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir un mot de passe.');
      return;
    }
    if (password.trim().length < 8) {
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(auth)/login');
    }, 1800);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3EDE3" />

      {/* Déco fixes en arrière-plan */}
      <View style={[styles.deco, styles.decoTop]} />
      <View style={[styles.deco, styles.decoBottom]} />

      {/* Bouton retour fixe */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backBtnInner}>
          <Ionicons name="arrow-back" size={20} color="#45644A" />
        </View>
      </TouchableOpacity>

      {/* ScrollView uniquement pour le contenu, PAS pour réagir au clavier */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
        // Désactive le scroll automatique vers le champ focalisé
        scrollEnabled={false}
      >
        {/* Icône */}
        <View style={styles.iconWrap}>
          <View style={styles.iconBox}>
            <Ionicons name="person-add" size={26} color="#FFF" />
          </View>
        </View>

        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez I-Music dès aujourd'hui !</Text>

        {/* Username */}
        <View ref={usernameWrapRef} style={styles.inputWrap}>
          <Ionicons name="person-outline" size={18} color="#AAA" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            placeholderTextColor="#BBB"
            value={username}
            onChangeText={setUsername}
            editable={!isLoading}
            autoCorrect={false}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => emailRef.current?.focus()}
            onFocus={() => usernameWrapRef.current?.setNativeProps({ style: [styles.inputWrap, focusStyle] })}
            onBlur={() => usernameWrapRef.current?.setNativeProps({ style: [styles.inputWrap, blurStyle] })}
          />
        </View>

        {/* Email */}
        <View ref={emailWrapRef} style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color="#AAA" style={styles.inputIcon} />
          <TextInput
            ref={emailRef}
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#BBB"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
            onFocus={() => emailWrapRef.current?.setNativeProps({ style: [styles.inputWrap, focusStyle] })}
            onBlur={() => emailWrapRef.current?.setNativeProps({ style: [styles.inputWrap, blurStyle] })}
          />
        </View>

        {/* Password */}
        <View ref={passwordWrapRef} style={styles.inputWrap}>
          <Ionicons name="key-outline" size={18} color="#AAA" style={styles.inputIcon} />
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#BBB"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            onFocus={() => passwordWrapRef.current?.setNativeProps({ style: [styles.inputWrap, focusStyle] })}
            onBlur={() => passwordWrapRef.current?.setNativeProps({ style: [styles.inputWrap, blurStyle] })}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#AAA" />
          </TouchableOpacity>
        </View>

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3EDE3',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 110,
    paddingBottom: 40,
  },
  deco: { position: 'absolute', borderRadius: 999 },
  decoTop: {
    width: 260, height: 260, top: -90, right: -60,
    backgroundColor: 'rgba(69,100,74,0.07)',
  },
  decoBottom: {
    width: 180, height: 180, bottom: -50, left: -40,
    backgroundColor: 'rgba(228,219,196,0.6)',
  },
  backButton: { position: 'absolute', top: 60, left: 24, zIndex: 10 },
  backBtnInner: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(69,100,74,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrap: { alignItems: 'center', marginBottom: 20 },
  iconBox: {
    width: 68, height: 68, borderRadius: 22,
    backgroundColor: '#45644A',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#45644A', shadowOpacity: 0.3, shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 }, elevation: 10,
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
    backgroundColor: '#FFF', borderRadius: 16,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E8E0D0',
    marginBottom: 12, paddingHorizontal: 14, height: 56,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A', paddingVertical: 0 },
  eyeBtn: { padding: 4 },
  hint: {
    fontSize: 12, color: '#AAA',
    marginBottom: 20, marginTop: -4, marginLeft: 4,
  },
  button: {
    backgroundColor: '#45644A', borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, shadowColor: '#45644A', shadowOpacity: 0.28,
    shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  buttonDisabled: { backgroundColor: '#8da391', elevation: 0, shadowOpacity: 0 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: '#999' },
  loginLink: { fontSize: 14, color: '#45644A', fontWeight: '700' },
});
