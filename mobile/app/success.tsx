import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { TactileButton } from './components/ui/TactileButton'
import {
  BataaCelebrationMascot,
  XPStar,
  StreakFlame,
} from './components/vectors'
import { useApp } from './context/AppContext'

export default function SuccessScreen() {
  const router = useRouter()
  const { state } = useApp()

  useEffect(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch {}
    }
  }, [])

  const handleContinue = () => {
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Header with Close Button */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.closeButton} onPress={handleContinue}>
          <Ionicons name="close" size={24} color="#3E3123" />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Mascot Celebration Animation/Illustration */}
        <View style={styles.mascotArea}>
          <BataaCelebrationMascot size={210} />
        </View>

        {/* Celebratory Text */}
        <View style={styles.textArea}>
          <Text style={styles.headline}>Excellent!</Text>
          <Text style={styles.subtitle}>
            You completed Step 1 🎉{'\n'}Keep going!
          </Text>
        </View>

        {/* Reward Pills Row */}
        <View style={styles.rewardsRow}>
          {/* XP Pill */}
          <View style={styles.rewardPill}>
            <XPStar size={22} />
            <Text style={styles.rewardText}>+10 XP</Text>
          </View>

          {/* Streak Pill */}
          <View style={styles.rewardPill}>
            <StreakFlame size={22} />
            <Text style={styles.rewardText}>1 Day streak</Text>
          </View>
        </View>
      </View>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <TactileButton
          title="Continue"
          onPress={handleContinue}
          size="lg"
          variant="primary"
        />
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mascotArea: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headline: {
    fontSize: 32,
    fontWeight: '900',
    color: '#21180F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6E6051',
    fontWeight: '600',
    textAlign: 'center',
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A1F14',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FEFAF1',
    borderTopWidth: 1,
    borderTopColor: '#F2E8DA',
  },
})
