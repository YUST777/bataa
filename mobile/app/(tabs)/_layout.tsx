import React from 'react'
import { Tabs } from 'expo-router'
import { View, StyleSheet, Platform } from 'react-native'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

export default function TabsLayout() {
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch {}
    }
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FF7A00',
        tabBarInactiveTintColor: '#A89989',
      }}
      screenListeners={{
        tabPress: triggerHaptic,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabContainer]}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={focused ? '#FF7A00' : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabContainer]}>
              <MaterialCommunityIcons
                name={focused ? 'book-open-page-variant' : 'book-open-page-variant-outline'}
                size={24}
                color={focused ? '#FF7A00' : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabContainer]}>
              <Ionicons
                name={focused ? 'trophy' : 'trophy-outline'}
                size={24}
                color={focused ? '#FF7A00' : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabContainer]}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={24}
                color={focused ? '#FF7A00' : color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#EFE6D8',
    borderTopWidth: 1.5,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    elevation: 8,
    shadowColor: '#3A2E20',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  activeTabContainer: {
    backgroundColor: '#FFF2E0',
  },
})
