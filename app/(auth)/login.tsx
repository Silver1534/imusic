import React, { useState } from 'react';
import { 
  StyleSheet, View, TextInput, TouchableOpacity, Text, 
  KeyboardAvoidingView, Platform, ActivityIndicator, useWindowDimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 2000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#45644A" />
      </TouchableOpacity>

      <View style={[styles.inner, { width: width > 500 ? 450 : '100%', alignSelf: 'center' }]}>
        <Text style={styles.title}>Connexion</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email ou Utilisateur"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Se connecter</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.linkText}>Pas de compte ? S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EDE3' },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#45644A', marginBottom: 40, textAlign: 'center' },
  input: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E4DBC4' },
  button: { backgroundColor: '#45644A', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, minHeight: 60, justifyContent: 'center' },
  buttonDisabled: { backgroundColor: '#8da391' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#45644A', textAlign: 'center', marginTop: 25, textDecorationLine: 'underline', fontWeight: '600' },
});