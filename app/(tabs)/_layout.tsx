import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useWindowDimensions } from 'react-native';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768; // Détecte si c'est une tablette

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: [
        styles.tabBar,
        { 
          // Largeur fixe sur tablette, pleine largeur moins marges sur téléphone
          width: isLargeScreen ? 400 : width - 40, 
          left: isLargeScreen ? (width - 400) / 2 : 20,
        }
      ],
      tabBarActiveTintColor: '#45644A',
      tabBarInactiveTintColor: '#A0A0A0',
    }}>
      <Tabs.Screen name="index" options={{
        tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={26} color={color} />,
      }} />
      <Tabs.Screen name="settings" options={{
        tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={26} color={color} />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', 
    bottom: 25, 
    borderRadius: 25, 
    height: 65,
    elevation: 5, 
    borderTopWidth: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, 
    shadowRadius: 10,
  }
});