import React, { useState } from 'react';
import { 
  StyleSheet, View, TextInput, TouchableOpacity, Text, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Animation de rebond au clic
  const scaleValue = new Animated.Value(1);

  const onPressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const handleRegister = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(auth)/login');
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

      <View style={styles.inner}>
        <Text style={styles.title}>Créer un compte</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          placeholderTextColor="#A0A0A0"
          value={username}
          onChangeText={setUsername}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
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
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={1}
        >
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Animatable.Text 
              animation="pulse" 
              iterationCount="infinite" 
              duration={2000} 
              style={styles.linkText}
            >
              Déjà un compte ? Se connecter
            </Animatable.Text>
          </Animated.View>
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