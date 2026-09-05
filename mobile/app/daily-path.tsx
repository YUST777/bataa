import React from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { TactileButton } from './components/ui/TactileButton'
import { LeavesIllustration } from './components/vectors'

export default function DailyPathScreen() {
  const router = useRouter()

  const handleStartLesson = () => {
    router.push('/lesson')
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2A2016" />
        </Pressable>
        <Text style={styles.headerTitle}>Today's Task</Text>
        <Pressable
          style={styles.iconButton}
          onPress={() => router.push('/streak')}
        >
          <Ionicons name="calendar-outline" size={22} color="#2A2016" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Task Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroDeco}>
            <LeavesIllustration width={50} height={50} />
          </View>
          <Text style={styles.dayBadge}>Day 1</Text>
          <Text style={styles.heroTitle}>Code a Button</Text>
          <Text style={styles.heroSubtitle}>
            Let's build your first{'\n'}HTML button.
          </Text>
        </View>

        {/* Steps List */}
        <View style={styles.stepsSection}>
          <Text style={styles.stepsHeader}>Steps (1/4)</Text>

          {/* Step 1: Active */}
          <Pressable
            style={[styles.stepRow, styles.activeStepRow]}
            onPress={handleStartLesson}
          >
            <View style={[styles.stepNumberBadge, styles.activeBadge]}>
              <Text style={styles.activeNumberText}>1</Text>
            </View>
            <Text style={styles.activeStepText}>Create the HTML structure</Text>
          </Pressable>

          {/* Step 2: Locked */}
          <View style={[styles.stepRow, styles.lockedStepRow]}>
            <View style={[styles.stepNumberBadge, styles.lockedBadge]}>
              <Text style={styles.lockedNumberText}>2</Text>
            </View>
            <Text style={styles.lockedStepText}>Style the button</Text>
            <Ionicons name="lock-closed" size={16} color="#A89A8B" style={styles.lockIcon} />
          </View>

          {/* Step 3: Locked */}
          <View style={[styles.stepRow, styles.lockedStepRow]}>
            <View style={[styles.stepNumberBadge, styles.lockedBadge]}>
              <Text style={styles.lockedNumberText}>3</Text>
            </View>
            <Text style={styles.lockedStepText}>Add hover effect</Text>
            <Ionicons name="lock-closed" size={16} color="#A89A8B" style={styles.lockIcon} />
          </View>

          {/* Step 4: Locked */}
          <View style={[styles.stepRow, styles.lockedStepRow]}>
            <View style={[styles.stepNumberBadge, styles.lockedBadge]}>
              <Text style={styles.lockedNumberText}>4</Text>
            </View>
            <Text style={styles.lockedStepText}>Test your button</Text>
            <Ionicons name="lock-closed" size={16} color="#A89A8B" style={styles.lockIcon} />
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action CTA */}
      <View style={styles.footer}>
        <TactileButton
          title="Start Lesson"
          onPress={handleStartLesson}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2A2016',
  },
  heroCard: {
    backgroundColor: '#FFF2DC',
    borderRadius: 24,
    padding: 24,
    marginTop: 8,
    marginBottom: 24,
    position: 'relative',
    borderColor: '#F2DFCA',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  heroDeco: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.7,
  },
  dayBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B06500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#261B12',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6E5C4B',
    fontWeight: '500',
  },
  stepsSection: {
    marginTop: 8,
  },
  stepsHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2A2016',
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  activeStepRow: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F2DEC8',
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  lockedStepRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: '#ECE0CE',
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  activeBadge: {
    backgroundColor: '#FF7A00',
  },
  activeNumberText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  lockedBadge: {
    backgroundColor: 'transparent',
  },
  lockedNumberText: {
    color: '#A89989',
    fontWeight: '700',
    fontSize: 13,
  },
  activeStepText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2016',
    flex: 1,
  },
  lockedStepText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8A7A6A',
    flex: 1,
  },
  lockIcon: {
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FEFAF1',
    borderTopWidth: 1,
    borderTopColor: '#F2E8DA',
  },
})
