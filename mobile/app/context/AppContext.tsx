import React, { createContext, useContext, useState } from 'react'

export interface AppState {
  name: string
  tagline: string
  level: number
  levelTitle: string
  gems: number
  streak: number
  hearts: number
  maxHearts: number
  xp: number
  currentLevelXp: number
  nextLevelXp: number
  badgesCount: number
  completedStep: number
  dailyReminder: boolean
  soundEffects: boolean
  darkMode: boolean
  language: string
  inventory: Record<string, number>
}

interface AppContextType {
  state: AppState
  addXp: (amount: number) => void
  addGems: (amount: number) => void
  deductGems: (amount: number) => boolean
  refillHearts: () => void
  decrementHeart: () => void
  completeLessonStep: (stepNumber: number) => void
  toggleSetting: (key: 'dailyReminder' | 'soundEffects' | 'darkMode') => void
  setLanguage: (lang: string) => void
  buyItem: (id: string, cost: number) => boolean
}

const initialAppState: AppState = {
  name: 'Jaques',
  tagline: 'Keep coding, keep growing.',
  level: 3,
  levelTitle: 'Web Developer',
  gems: 300,
  streak: 7,
  hearts: 5,
  maxHearts: 5,
  xp: 320,
  currentLevelXp: 120,
  nextLevelXp: 250,
  badgesCount: 5,
  completedStep: 1,
  dailyReminder: true,
  soundEffects: true,
  darkMode: false,
  language: 'English',
  inventory: {
    streak_freeze: 1,
    double_xp: 0,
    hint: 2,
  },
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialAppState)

  const addXp = (amount: number) => {
    setState((prev) => ({
      ...prev,
      xp: prev.xp + amount,
      currentLevelXp: prev.currentLevelXp + amount,
    }))
  }

  const addGems = (amount: number) => {
    setState((prev) => ({
      ...prev,
      gems: prev.gems + amount,
    }))
  }

  const deductGems = (amount: number): boolean => {
    if (state.gems < amount) return false
    setState((prev) => ({
      ...prev,
      gems: prev.gems - amount,
    }))
    return true
  }

  const refillHearts = () => {
    setState((prev) => ({
      ...prev,
      hearts: prev.maxHearts,
    }))
  }

  const decrementHeart = () => {
    setState((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
    }))
  }

  const completeLessonStep = (stepNumber: number) => {
    setState((prev) => ({
      ...prev,
      completedStep: Math.max(prev.completedStep, stepNumber),
      xp: prev.xp + 10,
    }))
  }

  const toggleSetting = (key: 'dailyReminder' | 'soundEffects' | 'darkMode') => {
    setState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const setLanguage = (language: string) => {
    setState((prev) => ({
      ...prev,
      language,
    }))
  }

  const buyItem = (id: string, cost: number): boolean => {
    if (state.gems < cost) return false
    setState((prev) => ({
      ...prev,
      gems: prev.gems - cost,
      inventory: {
        ...prev.inventory,
        [id]: (prev.inventory[id] || 0) + 1,
      },
    }))
    return true
  }

  return (
    <AppContext.Provider
      value={{
        state,
        addXp,
        addGems,
        deductGems,
        refillHearts,
        decrementHeart,
        completeLessonStep,
        toggleSetting,
        setLanguage,
        buyItem,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp must be used within AppContextProvider')
  }
  return ctx
}
