import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { TactileButton } from './components/ui/TactileButton'
import { HeartRefill, HintLightbulb } from './components/vectors'
import { useApp } from './context/AppContext'

export default function LessonScreen() {
  const router = useRouter()
  const { state, completeLessonStep } = useApp()
  const [previewClicked, setPreviewClicked] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handlePreviewPress = () => {
    setPreviewClicked(true)
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch {}
    }
  }

  const handleCheck = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch {}
    }
    completeLessonStep(1)
    router.replace('/success')
  }

  const handleHint = () => {
    setShowHint((prev) => !prev)
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch {}
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Navigation & Progress Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#3E3123" />
        </Pressable>

        {/* Progress Bar (Step 1 of 4 = 25%) */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: '25%' }]} />
        </View>

        {/* Hearts counter */}
        <View style={styles.heartsPill}>
          <HeartRefill size={20} />
          <Text style={styles.heartsText}>{state.hearts}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Instruction Header */}
        <View style={styles.instructionArea}>
          <Text style={styles.stepBadge}>Step 1 of 4</Text>
          <Text style={styles.title}>Create the HTML structure</Text>
          <Text style={styles.subtitle}>
            Add the HTML code for a button element:
          </Text>
        </View>

        {/* Code Editor Box */}
        <View style={styles.editorCard}>
          <View style={styles.editorHeader}>
            <View style={styles.editorDots}>
              <View style={[styles.dot, { backgroundColor: '#FF5F56' }]} />
              <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
              <View style={[styles.dot, { backgroundColor: '#27C93F' }]} />
            </View>
            <Text style={styles.editorFileName}>index.html</Text>
          </View>

          <View style={styles.codeBody}>
            {/* Line Numbers */}
            <View style={styles.lineNumbers}>
              <Text style={styles.lineNum}>1</Text>
              <Text style={styles.lineNum}>2</Text>
              <Text style={styles.lineNum}>3</Text>
            </View>

            {/* Code Lines with Syntax Coloring */}
            <View style={styles.codeLines}>
              <Text style={styles.codeRow}>
                <Text style={styles.syntaxTag}>&lt;button&gt;</Text>
              </Text>
              <Text style={styles.codeRow}>
                {'  '}<Text style={styles.syntaxContent}>Click me</Text>
              </Text>
              <Text style={styles.codeRow}>
                <Text style={styles.syntaxTag}>&lt;/button&gt;</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Live Interactive Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Preview</Text>
          <View style={styles.previewCard}>
            <Pressable
              onPress={handlePreviewPress}
              style={({ pressed }) => [
                styles.interactivePreviewButton,
                pressed && styles.interactivePreviewButtonPressed,
              ]}
            >
              <Text style={styles.interactiveButtonText}>Click me</Text>
            </Pressable>
            {previewClicked && (
              <Text style={styles.previewFeedbackText}>
                Button clicked! Great job.
              </Text>
            )}
          </View>
        </View>

        {/* Hint Box (if toggled) */}
        {showHint && (
          <View style={styles.hintCard}>
            <Ionicons name="information-circle" size={18} color="#D97A00" />
            <Text style={styles.hintText}>
              In HTML, <Text style={{ fontFamily: 'monospace' }}>&lt;button&gt;</Text> tags wrap clickable text for user interaction.
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Action Footer with Check Button & Hint Lightbulb */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <View style={styles.checkButtonWrapper}>
            <TactileButton
              title="Check"
              onPress={handleCheck}
              variant="success"
              size="lg"
            />
          </View>
          <Pressable style={styles.hintButton} onPress={handleHint}>
            <HintLightbulb size={32} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEFAF1',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#EBE0CF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
    borderRadius: 6,
  },
  heartsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E60039',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  instructionArea: {
    marginBottom: 18,
  },
  stepBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9C8E7E',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#21180F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6E6051',
    lineHeight: 20,
  },
  editorCard: {
    backgroundColor: '#1E1A16',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    shadowColor: '#36230E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2721',
    marginBottom: 10,
  },
  editorDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  editorFileName: {
    fontSize: 11,
    color: '#8A7D70',
    fontWeight: '600',
  },
  codeBody: {
    flexDirection: 'row',
  },
  lineNumbers: {
    width: 24,
    marginRight: 8,
  },
  lineNum: {
    fontSize: 14,
    lineHeight: 22,
    color: '#5C5144',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'right',
  },
  codeLines: {
    flex: 1,
  },
  codeRow: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  syntaxTag: {
    color: '#FF7B72',
    fontWeight: '600',
  },
  syntaxContent: {
    color: '#F0F6FC',
  },
  previewSection: {
    marginTop: 4,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#706152',
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: '#FFF4E5',
    borderRadius: 18,
    borderColor: '#EFE0CC',
    borderWidth: 1.5,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interactivePreviewButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5D6C3',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
    shadowColor: '#6B4312',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  interactivePreviewButtonPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: '#FAF5EE',
  },
  interactiveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#261C12',
  },
  previewFeedbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
    marginTop: 8,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF7E6',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderColor: '#FCE0AD',
    borderWidth: 1,
  },
  hintText: {
    fontSize: 12,
    color: '#784600',
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FEFAF1',
    borderTopWidth: 1,
    borderTopColor: '#F2E8DA',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkButtonWrapper: {
    flex: 1,
  },
  hintButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFF0D4',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#F0DCBE',
    borderWidth: 1.5,
  },
})
