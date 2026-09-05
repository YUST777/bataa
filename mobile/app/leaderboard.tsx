import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { BataaAvatar } from './components/vectors'
import { useApp } from './context/AppContext'

export default function LeaderboardScreen() {
  const router = useRouter()
  const { state } = useApp()
  const [activeScope, setActiveScope] = useState<'Global' | 'Friends' | 'Country'>('Global')

  const rankings = [
    { rank: 1, name: 'Alex', xp: '1250 XP', isUser: false },
    { rank: 2, name: 'Maya', xp: '950 XP', isUser: false },
    { rank: 3, name: 'Omar', xp: '780 XP', isUser: false },
    { rank: 4, name: 'You', xp: `${state.xp} XP`, isUser: true },
    { rank: 5, name: 'Zain', xp: '280 XP', isUser: false },
  ]

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFB800' // Gold
      case 2:
        return '#94A3B8' // Silver
      case 3:
        return '#D97706' // Bronze
      default:
        return '#B8A896'
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2A2016" />
        </Pressable>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scope Segmented Tabs */}
      <View style={styles.tabsContainer}>
        {(['Global', 'Friends', 'Country'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabButton, activeScope === tab && styles.activeTabButton]}
            onPress={() => setActiveScope(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeScope === tab && styles.activeTabText,
              ]}
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
        <View style={styles.list}>
          {rankings.map((item) => (
            <View
              key={item.rank}
              style={[
                styles.rankCard,
                item.isUser ? styles.userCard : styles.regularCard,
              ]}
            >
              {/* Rank Position Badge */}
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: getRankBadgeColor(item.rank) },
                ]}
              >
                <Text style={styles.rankNumberText}>{item.rank}</Text>
              </View>

              {/* Avatar */}
              <View style={styles.avatarWrapper}>
                <BataaAvatar size={36} />
              </View>

              {/* Player Name */}
              <Text
                style={[
                  styles.playerName,
                  item.isUser && styles.userPlayerName,
                ]}
              >
                {item.name}
              </Text>

              {/* XP Count */}
              <Text style={styles.xpText}>{item.xp}</Text>
            </View>
          ))}
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
  list: {
    gap: 10,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  regularCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFE0CD',
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  userCard: {
    backgroundColor: '#FFF2DC',
    borderColor: '#F2D7B3',
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumberText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  avatarWrapper: {
    marginRight: 12,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A1E14',
    flex: 1,
  },
  userPlayerName: {
    fontWeight: '900',
    color: '#D96500',
  },
  xpText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A7A6A',
  },
})
