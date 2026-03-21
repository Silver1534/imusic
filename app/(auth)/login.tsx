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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const passwordRef = useRef<TextInput>(null);
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

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert('Champ requis', "Veuillez saisir votre email ou nom d'utilisateur.");
      return;
    }
    if (!password.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir votre mot de passe.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1800);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3EDE3" />

      <View style={[styles.deco, styles.decoTop]} />
      <View style={[styles.deco, styles.decoBottom]} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backBtnInner}>
          <Ionicons name="arrow-back" size={20} color="#45644A" />
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <View style={styles.iconWrap}>
          <View style={styles.iconBox}>
            <Ionicons name="lock-closed" size={26} color="#FFF" />
          </View>
        </View>

        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Content de vous revoir !</Text>

        {/* Email */}
        <View ref={emailWrapRef} style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color="#AAA" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email ou Utilisateur"
            placeholderTextColor="#BBB"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
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
            onSubmitEditing={handleLogin}
            onFocus={() => passwordWrapRef.current?.setNativeProps({ style: [styles.inputWrap, focusStyle] })}
            onBlur={() => passwordWrapRef.current?.setNativeProps({ style: [styles.inputWrap, blurStyle] })}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#AAA" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotLink}>
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

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

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Pas de compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>S'inscrire</Text>
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
    width: 280, height: 280, top: -100, left: -80,
    backgroundColor: 'rgba(69,100,74,0.07)',
  },
  decoBottom: {
    width: 200, height: 200, bottom: -60, right: -50,
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
    fontSize: 32, fontWeight: '800', color: '#45644A',
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
    marginBottom: 14, paddingHorizontal: 14, height: 56,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A', paddingVertical: 0 },
  eyeBtn: { padding: 4 },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -4 },
  forgotText: { fontSize: 13, color: '#45644A', fontWeight: '600' },
  button: {
    backgroundColor: '#45644A', borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, shadowColor: '#45644A', shadowOpacity: 0.28,
    shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  buttonDisabled: { backgroundColor: '#8da391', elevation: 0, shadowOpacity: 0 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { fontSize: 14, color: '#999' },
  registerLink: { fontSize: 14, color: '#45644A', fontWeight: '700' },
});
