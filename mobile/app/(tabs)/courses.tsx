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
import { LeavesIllustration } from '../components/vectors'

export default function CoursesScreen() {
  const router = useRouter()

  const modules = [
    {
      id: 1,
      title: 'HTML Essentials',
      lessons: '4/6 lessons',
      locked: false,
    },
    {
      id: 2,
      title: 'CSS Basics',
      lessons: '0/6 lessons',
      locked: true,
    },
    {
      id: 3,
      title: 'JavaScript Basics',
      lessons: 'Locked',
      locked: true,
    },
    {
      id: 4,
      title: 'Mini Projects',
      lessons: 'Locked',
      locked: true,
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Courses</Text>
        <Pressable style={styles.filterButton}>
          <Feather name="sliders" size={20} color="#2A2016" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Path Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroDeco}>
            <LeavesIllustration width={60} height={60} />
          </View>
          <Text style={styles.heroTitle}>Web Development Path</Text>
          <Text style={styles.heroSubtitle}>
            Learn step by step.{'\n'}Build real skills.
          </Text>

          {/* Progress Bar & Status */}
          <View style={styles.progressArea}>
            <Text style={styles.progressPercentage}>20% complete</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '20%' }]} />
            </View>
          </View>
        </View>

        {/* Modules Vertical List */}
        <View style={styles.modulesList}>
          {modules.map((mod) => (
            <Pressable
              key={mod.id}
              style={[
                styles.moduleCard,
                !mod.locked ? styles.unlockedCard : styles.lockedCard,
              ]}
              onPress={() => {
                if (!mod.locked) {
                  router.push('/daily-path')
                }
              }}
            >
              <View
                style={[
                  styles.moduleNumberBadge,
                  !mod.locked ? styles.unlockedBadge : styles.lockedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.moduleNumberText,
                    !mod.locked ? styles.unlockedNumberText : styles.lockedNumberText,
                  ]}
                >
                  {mod.id}
                </Text>
              </View>

              <View style={styles.moduleInfo}>
                <Text
                  style={[
                    styles.moduleTitle,
                    !mod.locked ? styles.unlockedTitle : styles.lockedTitle,
                  ]}
                >
                  {mod.title}
                </Text>
                <Text style={styles.moduleLessons}>{mod.lessons}</Text>
              </View>

              {mod.locked ? (
                <Ionicons name="lock-closed" size={18} color="#A89A8B" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#FF7A00" />
              )}
            </Pressable>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#241B12',
  },
  filterButton: {
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
  heroCard: {
    backgroundColor: '#FFF2DC',
    borderRadius: 24,
    padding: 22,
    marginTop: 6,
    marginBottom: 20,
    position: 'relative',
    borderColor: '#F2DFCA',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  heroDeco: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#261B12',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6E5C4B',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressArea: {
    marginTop: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B06500',
    marginBottom: 6,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#EBD5BA',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
    borderRadius: 5,
  },
  modulesList: {
    gap: 12,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  unlockedCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFE0CD',
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  lockedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: '#ECE0CE',
  },
  moduleNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  unlockedBadge: {
    backgroundColor: '#FFF0D4',
  },
  lockedBadge: {
    backgroundColor: '#ECE3D7',
  },
  moduleNumberText: {
    fontSize: 15,
    fontWeight: '800',
  },
  unlockedNumberText: {
    color: '#D96E00',
  },
  lockedNumberText: {
    color: '#9E9080',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  unlockedTitle: {
    color: '#251A10',
  },
  lockedTitle: {
    color: '#7D7060',
  },
  moduleLessons: {
    fontSize: 12,
    color: '#9C8E7E',
    marginTop: 2,
    fontWeight: '600',
  },
})
