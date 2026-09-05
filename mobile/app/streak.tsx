import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { StreakFlame } from './components/vectors'
import { useApp } from './context/AppContext'

export default function StreakScreen() {
  const router = useRouter()
  const { state } = useApp()

  const days = [
    { label: 'M', active: true },
    { label: 'T', active: true },
    { label: 'W', active: true },
    { label: 'T', active: true },
    { label: 'F', active: true },
    { label: 'S', active: true },
    { label: 'S', active: true },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2A2016" />
        </Pressable>
        <Text style={styles.headerTitle}>Day Streak</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Streak Hero Badge */}
        <View style={styles.heroSection}>
          <View style={styles.flameContainer}>
            <StreakFlame size={72} />
          </View>
          <Text style={styles.streakCount}>{state.streak}</Text>
          <Text style={styles.streakSubtitle}>days in a row!</Text>
        </View>

        {/* 7-Day Habit Strip */}
        <View style={styles.weekCard}>
          <View style={styles.weekRow}>
            {days.map((d, idx) => (
              <View key={idx} style={styles.dayCol}>
                <View
                  style={[
                    styles.checkCircle,
                    d.active ? styles.checkCircleActive : styles.checkCircleInactive,
                  ]}
                >
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.dayLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Encouragement Card */}
        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementTitle}>Great job!</Text>
          <Text style={styles.encouragementText}>
            You're building an amazing habit.
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  flameContainer: {
    marginBottom: 8,
  },
  streakCount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#241A0E',
    letterSpacing: -1,
  },
  streakSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7A6B5C',
    marginTop: 2,
  },
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 16,
    width: '100%',
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dayCol: {
    alignItems: 'center',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkCircleActive: {
    backgroundColor: '#FF7A00',
  },
  checkCircleInactive: {
    borderWidth: 1.5,
    borderColor: '#E2D3C0',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C7C6B',
  },
  encouragementCard: {
    backgroundColor: '#FFF4E5',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    borderColor: '#F2DFCA',
    borderWidth: 1.5,
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#261B10',
    marginBottom: 4,
  },
  encouragementText: {
    fontSize: 14,
    color: '#6E5C4B',
    lineHeight: 20,
    fontWeight: '500',
  },
})
