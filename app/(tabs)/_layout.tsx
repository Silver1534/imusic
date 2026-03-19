import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
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
    position: 'absolute', bottom: 25, left: 20, right: 20,
    backgroundColor: '#FFFFFF', borderRadius: 25, height: 65,
    elevation: 5, borderTopWidth: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 10,
  }
});