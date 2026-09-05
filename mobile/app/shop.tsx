import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import {
  GemIcon,
  StreakFreezeGem,
  DoubleXPBadge,
  HintLightbulb,
  HeartRefill,
} from './components/vectors'
import { useApp } from './context/AppContext'

export default function ShopScreen() {
  const router = useRouter()
  const { state, buyItem } = useApp()
  const [activeTab, setActiveTab] = useState<'Items' | 'Themes'>('Items')

  const items = [
    {
      id: 'streak_freeze',
      title: 'Streak Freeze',
      cost: 100,
      renderIcon: () => <StreakFreezeGem size={46} />,
    },
    {
      id: 'double_xp',
      title: 'Double XP\n(30 min)',
      cost: 150,
      renderIcon: () => <DoubleXPBadge size={46} />,
    },
    {
      id: 'hint',
      title: 'Hint',
      cost: 100,
      renderIcon: () => <HintLightbulb size={46} />,
    },
    {
      id: 'health_refill',
      title: 'Health Refill',
      cost: 80,
      renderIcon: () => <HeartRefill size={46} />,
    },
  ]

  const handlePurchase = (item: (typeof items)[0]) => {
    const success = buyItem(item.id, item.cost)
    if (success) {
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } catch {}
      }
      Alert.alert('Purchased!', `You got ${item.title.replace('\n', ' ')}!`)
    } else {
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        } catch {}
      }
      Alert.alert('Not enough gems', 'Complete lessons to earn more gems!')
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2A2016" />
        </Pressable>
        <Text style={styles.headerTitle}>Shop</Text>
        {/* Gem pill */}
        <View style={styles.gemPill}>
          <GemIcon size={18} />
          <Text style={styles.gemText}>{state.gems}</Text>
        </View>
      </View>

      {/* Tabs: Items / Themes */}
      <View style={styles.tabsContainer}>
        {(['Items', 'Themes'] as const).map((tab) => (
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
        {activeTab === 'Items' ? (
          <View style={styles.grid}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.itemCard,
                  pressed && styles.itemCardPressed,
                ]}
                onPress={() => handlePurchase(item)}
              >
                <View style={styles.iconContainer}>{item.renderIcon()}</View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View style={styles.costBadge}>
                  <GemIcon size={14} />
                  <Text style={styles.costText}>{item.cost}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyThemes}>
            <Ionicons name="color-palette-outline" size={48} color="#C4B4A2" />
            <Text style={styles.emptyThemesText}>
              More exciting themes coming soon!
            </Text>
          </View>
        )}
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
    marginBottom: 18,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  itemCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderColor: '#EFE0CD',
    borderWidth: 1.5,
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemCardPressed: {
    transform: [{ scale: 0.97 }],
  },
  iconContainer: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#261B12',
    textAlign: 'center',
    height: 36,
    marginBottom: 10,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4E5',
    borderColor: '#F2DFCA',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  costText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9C5800',
  },
  emptyThemes: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyThemesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9E8E7E',
    marginTop: 12,
  },
})
