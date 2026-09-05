import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from './context/AppContext'

export default function SettingsScreen() {
  const router = useRouter()
  const { state, toggleSetting, setLanguage } = useApp()

  const handleLanguageChange = () => {
    Alert.alert('Language', 'Choose your preferred language:', [
      { text: 'English', onPress: () => setLanguage('English') },
      { text: 'العربية (Arabic)', onPress: () => setLanguage('العربية') },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => router.replace('/(tabs)') },
    ])
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2A2016" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            {/* Daily reminder */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Daily reminder</Text>
              <Switch
                value={state.dailyReminder}
                onValueChange={() => toggleSetting('dailyReminder')}
                trackColor={{ false: '#E2D5C3', true: '#22C55E' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Sound effects */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound effects</Text>
              <Switch
                value={state.soundEffects}
                onValueChange={() => toggleSetting('soundEffects')}
                trackColor={{ false: '#E2D5C3', true: '#22C55E' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Dark mode */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dark mode</Text>
              <Switch
                value={state.darkMode}
                onValueChange={() => toggleSetting('darkMode')}
                trackColor={{ false: '#E2D5C3', true: '#22C55E' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Language */}
            <Pressable
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
              onPress={handleLanguageChange}
            >
              <Text style={styles.settingLabel}>Language</Text>
              <View style={styles.languageSelect}>
                <Text style={styles.languageText}>{state.language}</Text>
                <Ionicons name="chevron-forward" size={16} color="#A89A8B" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Pressable
              style={styles.settingRow}
              onPress={() => Alert.alert('Account', 'Password change requested.')}
            >
              <Text style={styles.settingLabel}>Change password</Text>
              <Ionicons name="chevron-forward" size={16} color="#A89A8B" />
            </Pressable>

            <Pressable
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
              onPress={handleLogout}
            >
              <Text style={[styles.settingLabel, styles.logoutText]}>
                Log out
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEFAF1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A2016',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#706050',
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EADB',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#261B12',
  },
  languageSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  languageText: {
    fontSize: 14,
    color: '#8A7B6B',
    fontWeight: '600',
  },
  logoutText: {
    color: '#DC2626',
  },
})
