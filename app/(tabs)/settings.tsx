import React from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  ScrollView, Switch, Alert, StatusBar, 
  useWindowDimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../_context/ThemeContext';

export default function Settings() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const [notifications, setNotifications] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter de I-Music ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: () => {
            router.dismissAll();
            router.replace('/');
          }
        }
      ]
    );
  };

  const maxWidth = Math.min(width - 40, 600);

  return (
    <ScrollView 
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={[styles.contentContainer, { alignItems: 'center' }]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={{ width: maxWidth }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDarkMode && styles.textLight]}>Paramètres</Text>
          <Text style={[styles.headerSub, isDarkMode && { color: '#666' }]}>Gérez votre expérience</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, isDarkMode && styles.cardDark]}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color="#FFF" />
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="musical-note" size={10} color="#FFF" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isDarkMode && styles.textLight]}>Mon compte</Text>
            <Text style={styles.profileEmail}>Utilisateur I-Music</Text>
          </View>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>Pro</Text>
          </View>
        </View>

        {/* Section Apparence */}
        <SectionLabel label="Apparence" isDarkMode={isDarkMode} />
        <View style={[styles.card, isDarkMode && styles.cardDark]}>
          <SettingItem
            icon="moon"
            iconBg="#3D3B8E"
            title="Mode Sombre"
            subtitle="Thème nocturne"
            type="switch"
            value={isDarkMode}
            onPress={toggleTheme}
            isDarkMode={isDarkMode}
            isLast
          />
        </View>

        {/* Section Notifications */}
        <SectionLabel label="Notifications" isDarkMode={isDarkMode} />
        <View style={[styles.card, isDarkMode && styles.cardDark]}>
          <SettingItem
            icon="notifications"
            iconBg="#E05C5C"
            title="Notifications"
            subtitle="Alertes & rappels"
            type="switch"
            value={notifications}
            onPress={() => setNotifications(!notifications)}
            isDarkMode={isDarkMode}
            isLast
          />
        </View>

        {/* Section Compte */}
        <SectionLabel label="Compte" isDarkMode={isDarkMode} />
        <View style={[styles.card, isDarkMode && styles.cardDark]}>
          <SettingItem
            icon="help-circle"
            iconBg="#45644A"
            title="Aide & Support"
            subtitle="FAQ et assistance"
            type="arrow"
            isDarkMode={isDarkMode}
          />
          <SettingItem
            icon="information-circle"
            iconBg="#888"
            title="À propos"
            subtitle="Version 1.0.0"
            type="arrow"
            isDarkMode={isDarkMode}
            isLast
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutBtn, isDarkMode && styles.logoutBtnDark]}
          onPress={handleLogout}
          activeOpacity={0.82}
        >
          <View style={styles.logoutIconWrap}>
            <Ionicons name="log-out-outline" size={20} color="#E05C5C" />
          </View>
          <Text style={styles.logoutText}>Se déconnecter</Text>
          <Ionicons name="chevron-forward" size={16} color="#E05C5C" />
        </TouchableOpacity>

        <Text style={[styles.version, isDarkMode && { color: '#444' }]}>
          I-Music • Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ label, isDarkMode }: { label: string; isDarkMode: boolean }) {
  return (
    <Text style={[styles.sectionLabel, isDarkMode && { color: '#666' }]}>
      {label.toUpperCase()}
    </Text>
  );
}

function SettingItem({ 
  icon, iconBg, title, subtitle, type, value, onPress, isDarkMode, isLast 
}: any) {
  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        isDarkMode && styles.settingItemDark,
        !isLast && styles.settingItemBorder,
        isDarkMode && !isLast && styles.settingItemBorderDark,
      ]}
      onPress={type !== 'switch' ? onPress : undefined}
      disabled={type === 'switch'}
      activeOpacity={type === 'switch' ? 1 : 0.7}
    >
      <View style={[styles.settingIconWrap, { backgroundColor: iconBg + '18' }]}>
        <Ionicons name={icon} size={20} color={iconBg} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, isDarkMode && styles.textLight]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, isDarkMode && { color: '#666' }]}>{subtitle}</Text>
        )}
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#D1D1D1', true: '#45644A' }}
          thumbColor="#FFF"
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#555' : '#CCC'} />
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3EDE3',
  },
  containerDark: {
    backgroundColor: '#0F0F0F',
  },
  contentContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 120,
    paddingHorizontal: 20,
  },

  // Header
  header: { 
    marginBottom: 24,
  },
  headerTitle: { 
    fontSize: 36, 
    fontWeight: '800', 
    color: '#45644A',
    letterSpacing: -0.8,
  },
  headerSub: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
    fontWeight: '500',
  },

  // Profile
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#45644A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#45644A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  profileEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  profileBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(69,100,74,0.12)',
    borderRadius: 10,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#45644A',
  },

  // Section
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardDark: {
    backgroundColor: '#1A1A1A',
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 14,
  },
  settingItemDark: {},
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingItemBorderDark: {
    borderBottomColor: '#252525',
  },
  settingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: { flex: 1 },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 1,
  },

  // Logout
  logoutBtn: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(224,92,92,0.2)',
    elevation: 2,
    shadowColor: '#E05C5C',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  logoutBtnDark: {
    backgroundColor: '#1A1A1A',
    borderColor: 'rgba(224,92,92,0.25)',
  },
  logoutIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(224,92,92,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#E05C5C',
  },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#CCC',
    marginBottom: 8,
  },

  textLight: { color: '#FFF' },
});
