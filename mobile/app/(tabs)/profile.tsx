import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, Feather } from '@expo/vector-icons'
import { BataaAvatar, StreakFlame, XPStar } from '../components/vectors'
import { useApp } from '../context/AppContext'

export default function ProfileScreen() {
  const router = useRouter()
  const { state } = useApp()

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <Pressable
          style={styles.settingsIconButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={22} color="#2A2016" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Hero Area */}
        <View style={styles.profileHero}>
          <View style={styles.avatarWrapper}>
            <BataaAvatar size={96} showPencil={true} />
          </View>
          <Text style={styles.profileName}>{state.name}</Text>
          <Text style={styles.profileTagline}>{state.tagline}</Text>
          <View style={styles.levelBadgePill}>
            <Ionicons name="leaf" size={14} color="#16A34A" />
            <Text style={styles.levelBadgeText}>Beginner</Text>
          </View>
        </View>

        {/* Stats Summary Row */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <StreakFlame size={20} />
            <Text style={styles.statVal}>{state.streak}</Text>
            <Text style={styles.statLbl}>Day streak</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statCol}>
            <XPStar size={20} />
            <Text style={styles.statVal}>{state.xp}</Text>
            <Text style={styles.statLbl}>Total XP</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statCol}>
            <Ionicons name="trophy" size={20} color="#FFB800" />
            <Text style={styles.statVal}>{state.badgesCount}</Text>
            <Text style={styles.statLbl}>Badges</Text>
          </View>
        </View>

        {/* Navigation Menu Links */}
        <View style={styles.menuContainer}>
          {/* Achievements / Progress */}
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/progress')}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="trophy-outline" size={20} color="#FF7A00" />
            </View>
            <Text style={styles.menuTitle}>Achievements</Text>
            <Ionicons name="chevron-forward" size={18} color="#A89A8B" />
          </Pressable>

          {/* Shop */}
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/shop')}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="bag-handle-outline" size={20} color="#FF7A00" />
            </View>
            <Text style={styles.menuTitle}>Shop</Text>
            <Ionicons name="chevron-forward" size={18} color="#A89A8B" />
          </Pressable>

          {/* Leaderboard */}
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/leaderboard')}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="podium-outline" size={20} color="#FF7A00" />
            </View>
            <Text style={styles.menuTitle}>Leaderboard</Text>
            <Ionicons name="chevron-forward" size={18} color="#A89A8B" />
          </Pressable>

          {/* Settings */}
          <Pressable
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => router.push('/settings')}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="settings-outline" size={20} color="#FF7A00" />
            </View>
            <Text style={styles.menuTitle}>Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#A89A8B" />
          </Pressable>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  settingsIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2DD',
    borderColor: '#F0DEC8',
    borderWidth: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileHero: {
    alignItems: 'center',
    marginVertical: 14,
  },
  avatarWrapper: {
    marginBottom: 14,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#241B12',
    marginBottom: 4,
  },
  profileTagline: {
    fontSize: 13,
    color: '#706050',
    fontWeight: '500',
    marginBottom: 12,
  },
  levelBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF7ED',
    borderColor: '#C6E8CE',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
    marginVertical: 18,
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#261B12',
    marginTop: 4,
  },
  statLbl: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A7B6B',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#EFE2D3',
    marginVertical: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EADB',
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF2DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#261B12',
    flex: 1,
  },
})
