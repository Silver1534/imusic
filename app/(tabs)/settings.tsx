import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../_context/ThemeContext'; 

export default function Settings() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = React.useState(true);

  // --- FONCTION DE DÉCONNEXION ---
  const handleLogout = () => {
    Alert.alert(
      "Déconnexion", 
      "Voulez-vous vraiment quitter I-Music ?", 
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Se déconnecter", 
          style: "destructive", 
          onPress: () => {
            // '/' cible le fichier index.tsx à la racine (Landing Page)
            // replace empêche l'utilisateur de revenir en arrière avec le bouton retour
            router.replace('/'); 
          } 
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, value, type = 'arrow', onPress, color = '#333' }: any) => (
    <TouchableOpacity 
      style={[styles.item, isDarkMode && styles.itemDark]} 
      onPress={onPress} 
      disabled={type === 'switch'}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={[styles.itemTitle, { color: isDarkMode ? '#FFF' : (color === '#FF4444' ? '#FF4444' : '#333') }]}>
          {title}
        </Text>
      </View>
      {type === 'switch' ? (
        <Switch 
          value={value} 
          onValueChange={onPress} 
          trackColor={{ false: "#D1D1D1", true: "#45644A" }} 
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Paramètres</Text>
      </View>

      <Text style={styles.sectionLabel}>Préférences</Text>
      <View style={[styles.card, isDarkMode && styles.cardDark]}>
        <SettingItem 
          icon="moon-outline" 
          title="Mode Sombre" 
          type="switch" 
          value={isDarkMode} 
          onPress={toggleTheme} 
          color={isDarkMode ? "#A5D6A7" : "#45644A"} 
        />
        <SettingItem 
          icon="notifications-outline" 
          title="Notifications" 
          type="switch" 
          value={notifications} 
          onPress={() => setNotifications(!notifications)} 
          color={isDarkMode ? "#A5D6A7" : "#45644A"} 
        />
      </View>

      <Text style={styles.sectionLabel}>Compte</Text>
      <View style={[styles.card, isDarkMode && styles.cardDark]}>
        <SettingItem 
          icon="log-out-outline" 
          title="Déconnexion" 
          color="#FF4444" 
          onPress={handleLogout} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EDE3', paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 30 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#45644A' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 10, textTransform: 'uppercase', marginLeft: 5 },
  card: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 25, elevation: 3, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  containerDark: { backgroundColor: '#1A1C1E' },
  cardDark: { backgroundColor: '#2D3033' },
  textDark: { color: '#E2E2E2' },
  itemDark: { borderBottomWidth: 0.5, borderBottomColor: '#3E4246' },
});
