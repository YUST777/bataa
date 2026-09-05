import React from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import {
  LevelShield,
  StreakFlame,
  XPStar,
} from './components/vectors'
import { useApp } from './context/AppContext'

export default function ProgressScreen() {
  const router = useRouter()
  const { state } = useApp()

  const days = [
    { label: 'Mon', active: true },
    { label: 'Tue', active: true },
    { label: 'Wed', active: true },
    { label: 'Thu', active: false },
    { label: 'Fri', active: false },
    { label: 'Sat', active: false },
    { label: 'Sun', active: false },
  ]

  const skills = [
    { name: 'HTML', percentage: 60 },
    { name: 'CSS', percentage: 20 },
    { name: 'JavaScript', percentage: 0 },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2A2016" />
        </Pressable>
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Level Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelShieldWrapper}>
            <LevelShield size={54} level={state.level} />
            <Text style={styles.shieldNumberOverlay}>{state.level}</Text>
          </View>
          <View style={styles.levelDetails}>
            <Text style={styles.levelTitle}>Level {state.level}</Text>
            <Text style={styles.levelSubtitle}>{state.levelTitle}</Text>
            <View style={styles.levelProgressBar}>
              <View
                style={[
                  styles.levelProgressFill,
                  {
                    width: `${Math.round(
                      (state.currentLevelXp / state.nextLevelXp) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.levelXpText}>
              {state.currentLevelXp} / {state.nextLevelXp} XP
            </Text>
          </View>
        </View>

        {/* Stats Row (3 columns) */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <StreakFlame size={24} />
              <Text style={styles.statValue}>{state.streak}</Text>
              <Text style={styles.statLabel}>Day streak</Text>
            </View>
            <View style={styles.statBox}>
              <XPStar size={24} />
              <Text style={styles.statValue}>{state.xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="trophy" size={24} color="#FFB800" />
              <Text style={styles.statValue}>{state.badgesCount}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.daysRow}>
            {days.map((day, idx) => (
              <View key={idx} style={styles.dayCol}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <View
                  style={[
                    styles.dayCircle,
                    day.active ? styles.dayCircleActive : styles.dayCircleInactive,
                  ]}
                >
                  {day.active && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Skills Mastery */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsList}>
            {skills.map((skill, idx) => (
              <View key={idx} style={styles.skillItem}>
                <View style={styles.skillHeader}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillPercent}>{skill.percentage}%</Text>
                </View>
                <View style={styles.skillTrack}>
                  <View
                    style={[
                      styles.skillFill,
                      { width: `${skill.percentage}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
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
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  levelShieldWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  shieldNumberOverlay: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  levelDetails: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#261B12',
  },
  levelSubtitle: {
    fontSize: 13,
    color: '#706050',
    fontWeight: '600',
    marginBottom: 8,
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: '#F5EADB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
    borderRadius: 4,
  },
  levelXpText: {
    fontSize: 11,
    color: '#A89989',
    fontWeight: '700',
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#281C10',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#261B12',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A7B6B',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayCol: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9C8E7E',
    marginBottom: 8,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#FF7A00',
  },
  dayCircleInactive: {
    borderWidth: 1.5,
    borderColor: '#EBDCCE',
    backgroundColor: 'transparent',
  },
  skillsList: {
    gap: 14,
    marginTop: 4,
  },
  skillItem: {},
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#281C10',
  },
  skillPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A89989',
  },
  skillTrack: {
    height: 8,
    backgroundColor: '#F5EADB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
    borderRadius: 4,
  },
})
