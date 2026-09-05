import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { GemIcon, StreakFlame, XPStar } from '../components/vectors'
import { useApp } from '../context/AppContext'

export default function QuestsScreen() {
  const router = useRouter()
  const { state } = useApp()
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Achievements'>('Daily')

  const dailyQuests = [
    {
      id: 1,
      title: "Complete today's lesson",
      current: 1,
      total: 1,
      completed: true,
      rewardIcon: 'check',
    },
    {
      id: 2,
      title: 'Earn 20 XP',
      current: 12,
      total: 20,
      completed: false,
      rewardIcon: 'xp',
    },
    {
      id: 3,
      title: 'Code 2 days in a row',
      current: 1,
      total: 2,
      completed: false,
      rewardIcon: 'flame',
    },
    {
      id: 4,
      title: 'Complete 4 steps',
      current: 1,
      total: 4,
      completed: false,
      rewardIcon: 'code',
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quests</Text>
        <Pressable
          style={styles.gemPill}
          onPress={() => router.push('/shop')}
        >
          <GemIcon size={18} />
          <Text style={styles.gemText}>{state.gems}</Text>
        </Pressable>
      </View>

      {/* Segmented Tabs: Daily / Weekly / Achievements */}
      <View style={styles.tabsContainer}>
        {(['Daily', 'Weekly', 'Achievements'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTabText]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quest Cards */}
        <View style={styles.questsList}>
          {dailyQuests.map((quest) => {
            const pct = Math.min(100, Math.round((quest.current / quest.total) * 100))

            return (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questTopRow}>
                  <View style={styles.questInfo}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    <Text style={styles.questProgressCount}>
                      {quest.current}/{quest.total}
                    </Text>
                  </View>

                  {/* Reward / Status Icon */}
                  <View style={styles.rewardIconWrapper}>
                    {quest.completed ? (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      </View>
                    ) : quest.rewardIcon === 'xp' ? (
                      <View style={styles.xpCircleBadge}>
                        <Text style={styles.xpCircleText}>XP</Text>
                      </View>
                    ) : quest.rewardIcon === 'flame' ? (
                      <StreakFlame size={24} />
                    ) : (
                      <View style={styles.codeBadgeCircle}>
                        <Text style={styles.codeBadgeText}>&lt;/&gt;</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.questProgressBar}>
                  <View
                    style={[
                      styles.questProgressFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: quest.completed ? '#22C55E' : '#FF7A00',
                      },
                    ]}
                  />
                </View>
              </View>
            )
          })}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#241B12',
  },
  gemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF2DC',
    borderColor: '#F0DEC5',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  gemText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A5200',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F5EADB',
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#523A1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8C7C6B',
  },
  activeTabText: {
    color: '#241A0E',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  questsList: {
    gap: 12,
  },
  questCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  questTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questInfo: {
    flex: 1,
    marginRight: 12,
  },
  questTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#241A0F',
    marginBottom: 4,
  },
  questProgressCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9C8E7E',
  },
  rewardIconWrapper: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpCircleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFB800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpCircleText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  codeBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
  },
  questProgressBar: {
    height: 8,
    backgroundColor: '#F5EADB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
})
