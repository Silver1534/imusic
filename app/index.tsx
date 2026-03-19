import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>I-Music</Text>
        <Text style={styles.subtitle}>Le nouveau son de Madagascar</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Commencer l'aventure</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EDE3', justifyContent: 'center' },
  content: { padding: 40, alignItems: 'center' },
  title: { fontSize: 52, fontWeight: 'bold', color: '#45644A', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 60 },
  button: { 
    backgroundColor: '#45644A', 
    paddingVertical: 20, 
    paddingHorizontal: 45, 
    borderRadius: 35,
    elevation: 8,
    shadowColor: '#45644A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});