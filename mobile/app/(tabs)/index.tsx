import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useApp } from '../context/AppContext'
import {
  BataaAvatar,
  GemIcon,
  StreakFlame,
  CactusIllustration,
  LeavesIllustration,
  TreasureChest,
} from '../components/vectors'

export default function HomeScreen() {
  const router = useRouter()
  const { state } = useApp()

  const handlePressPath = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch {}
    }
    router.push('/daily-path')
  }

  const handlePressGems = () => {
    router.push('/shop')
  }

  const handlePressStreak = () => {
    router.push('/streak')
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          {/* User Avatar & Name */}
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <BataaAvatar size={36} />
            <Text style={styles.userName}>Hi, {state.name}</Text>
          </Pressable>

          {/* Stats Badges */}
          <View style={styles.statsRow}>
            {/* Gems Pill */}
            <Pressable style={styles.statPill} onPress={handlePressGems}>
              <GemIcon size={18} />
              <Text style={styles.statText}>{state.gems}</Text>
            </Pressable>

            {/* Streak Pill */}
            <Pressable style={styles.statPill} onPress={handlePressStreak}>
              <StreakFlame size={18} />
              <Text style={styles.statText}>{state.streak}</Text>
            </Pressable>
          </View>
        </View>

        {/* Hero Headline */}
        <View style={styles.headlineArea}>
          <Text style={styles.headline}>
            You are about to{'\n'}code{' '}
            <Text style={styles.highlightText}>amazing</Text>
            {'\n'}things
          </Text>
        </View>

        {/* Continue Your Path Section */}
        <View style={styles.pathSection}>
          <Text style={styles.pathTitle}>Continue your path</Text>

          {/* Interactive Path Canvas */}
          <View style={styles.pathContainer}>
            {/* Left Foliage Decoration */}
            <View style={styles.foliageLeft}>
              <LeavesIllustration width={44} height={54} />
            </View>

            {/* Right Cactus Decoration */}
            <View style={styles.cactusRight}>
              <CactusIllustration width={58} height={110} />
            </View>

            {/* Day 1: Active Task Card */}
            <Pressable
              style={({ pressed }) => [
                styles.dayCard,
                styles.activeDayCard,
                pressed && styles.cardPressed,
              ]}
              onPress={handlePressPath}
            >
              <View style={styles.codeIconCircle}>
                <Text style={styles.codeIconText}>&lt;/&gt;</Text>
              </View>
              <View style={styles.dayInfo}>
                <Text style={styles.dayBadgeText}>Day 1</Text>
                <Text style={styles.dayTitleText}>Code a Button</Text>
              </View>
            </Pressable>

            {/* Path connector line */}
            <View style={[styles.connectorLine, { left: 42 }]} />

            {/* Day 2: Locked */}
            <View style={[styles.dayCard, styles.lockedDayCard]}>
              <View style={styles.lockIconCircle}>
                <Ionicons name="lock-closed" size={16} color="#A89A8B" />
              </View>
              <View style={styles.dayInfo}>
                <Text style={styles.lockedDayBadgeText}>Day 2</Text>
                <Text style={styles.lockedDayTitleText}>Style it</Text>
              </View>
            </View>

            {/* Path connector line */}
            <View style={[styles.connectorLine, { left: 42 }]} />

            {/* Day 3: Locked */}
            <View style={[styles.dayCard, styles.lockedDayCard]}>
              <View style={styles.lockIconCircle}>
                <Ionicons name="lock-closed" size={16} color="#A89A8B" />
              </View>
              <View style={styles.dayInfo}>
                <Text style={styles.lockedDayBadgeText}>Day 3</Text>
                <Text style={styles.lockedDayTitleText}>Add Hover Effect</Text>
              </View>
            </View>

            {/* Path connector line */}
            <View style={[styles.connectorLine, { left: 42 }]} />

            {/* Day 4: Locked */}
            <View style={[styles.dayCard, styles.lockedDayCard]}>
              <View style={styles.lockIconCircle}>
                <Ionicons name="lock-closed" size={16} color="#A89A8B" />
              </View>
              <View style={styles.dayInfo}>
                <Text style={styles.lockedDayBadgeText}>Day 4</Text>
                <Text style={styles.lockedDayTitleText}>Make it interactive</Text>
              </View>
            </View>

            {/* Treasure Chest at end of unit */}
            <View style={styles.chestContainer}>
              <TreasureChest size={44} />
            </View>
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
  container: {
    flex: 1,
    backgroundColor: '#FEFAF1',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#382D20',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF2DC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderColor: '#F0DEC5',
    borderWidth: 1,
  },
  statText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A5200',
  },
  headlineArea: {
    marginTop: 18,
    marginBottom: 24,
  },
  headline: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '900',
    color: '#241B12',
    letterSpacing: -0.5,
  },
  highlightText: {
    color: '#FF7A00',
  },
  pathSection: {
    marginTop: 6,
  },
  pathTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#706152',
    marginBottom: 16,
  },
  pathContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 24,
    padding: 18,
    position: 'relative',
    borderColor: '#F5E2C9',
    borderWidth: 1,
    overflow: 'hidden',
  },
  foliageLeft: {
    position: 'absolute',
    top: 10,
    left: -12,
    opacity: 0.85,
  },
  cactusRight: {
    position: 'absolute',
    top: 50,
    right: 12,
    opacity: 0.9,
  },
  chestContainer: {
    position: 'absolute',
    bottom: 16,
    right: 24,
  },
  connectorLine: {
    width: 3,
    height: 14,
    backgroundColor: '#EBD5BA',
    marginVertical: 2,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    maxWidth: 200,
  },
  activeDayCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  lockedDayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  codeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  codeIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  lockIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dayInfo: {
    flex: 1,
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8F5800',
  },
  dayTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2B2015',
    marginTop: 1,
  },
  lockedDayBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A89989',
  },
  lockedDayTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A7B6B',
    marginTop: 1,
  },
})
