import React, { useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native'
import * as Haptics from 'expo-haptics'

export type ButtonVariant = 'primary' | 'success' | 'outline' | 'ghost' | 'danger'

interface TactileButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function TactileButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  icon,
  size = 'md',
}: TactileButtonProps) {
  const [pressed, setPressed] = useState(false)

  const handlePressIn = () => {
    if (disabled) return
    setPressed(true)
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch {}
    }
  }

  const handlePressOut = () => {
    if (disabled) return
    setPressed(false)
  }

  const handlePress = () => {
    if (disabled) return
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      } catch {}
    }
    onPress()
  }

  const getColors = () => {
    if (disabled) {
      return {
        bg: '#E2D9CD',
        shadow: '#C5B9AA',
        text: '#9C9082',
      }
    }
    switch (variant) {
      case 'success':
        return {
          bg: '#22C55E',
          shadow: '#16A34A',
          text: '#FFFFFF',
        }
      case 'outline':
        return {
          bg: '#FFFFFF',
          shadow: '#E2D5C3',
          border: '#E8DC CD',
          text: '#1F1A14',
        }
      case 'danger':
        return {
          bg: '#EF4444',
          shadow: '#B91C1C',
          text: '#FFFFFF',
        }
      case 'ghost':
        return {
          bg: 'transparent',
          shadow: 'transparent',
          text: '#FF7A00',
        }
      case 'primary':
      default:
        return {
          bg: '#FF7A00',
          shadow: '#D96000',
          text: '#FFFFFF',
        }
    }
  }

  const colors = getColors()
  const depth = variant === 'ghost' ? 0 : size === 'sm' ? 3 : 4

  return (
    <View
      style={[
        styles.outerContainer,
        {
          backgroundColor: colors.shadow,
          borderRadius: size === 'sm' ? 12 : 16,
        },
        style,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.innerButton,
          {
            backgroundColor: colors.bg,
            transform: [{ translateY: pressed ? depth : 0 }],
            marginBottom: pressed ? 0 : depth,
            borderRadius: size === 'sm' ? 12 : 16,
            paddingVertical: size === 'sm' ? 10 : size === 'lg' ? 18 : 14,
            paddingHorizontal: size === 'sm' ? 14 : 20,
            borderColor: colors.border || 'transparent',
            borderWidth: colors.border ? 1.5 : 0,
          },
        ]}
      >
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: colors.text,
                fontSize: size === 'sm' ? 14 : size === 'lg' ? 17 : 15,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    overflow: 'hidden',
  },
  innerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
})
