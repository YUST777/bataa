import { useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import * as Haptics from 'expo-haptics'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Svg, { Circle, Path, Rect, Stop, Defs, LinearGradient as SvgGradient } from 'react-native-svg'

const BASE_WIDTH = 237
const BASE_HEIGHT = 521

type Lesson = {
  day: string
  title: string
  locked?: boolean
}

const lessons: Lesson[] = [
  { day: 'Day 1', title: 'Code a Button' },
  { day: 'Day 2', title: 'Style it', locked: true },
  { day: 'Day 3', title: 'Add Hover Effect', locked: true },
  { day: 'Day 4', title: 'Make it Interactive', locked: true },
]

function GemIcon({ scale }: { scale: number }) {
  return (
    <Svg width={21 * scale} height={21 * scale} viewBox="0 0 21 21">
      <Defs>
        <SvgGradient id="gemFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE66C" />
          <Stop offset="0.5" stopColor="#F89A16" />
          <Stop offset="1" stopColor="#C85D08" />
        </SvgGradient>
      </Defs>
      <Path d="M2 7.1 5.4 2.9h10.2L19 7.1l-8.5 10.7L2 7.1Z" fill="url(#gemFill)" stroke="#C5680A" strokeWidth=".7" />
      <Path d="M5.5 3 8 7.2h5L15.6 3M2.2 7.3h16.5" fill="none" stroke="#FFF2A6" strokeWidth=".8" opacity=".9" />
      <Path d="m8 7.2 2.5 10.3L13 7.2" fill="#E9780C" opacity=".55" />
    </Svg>
  )
}

function Avatar({ scale }: { scale: number }) {
  return (
    <View style={[styles.avatar, { width: 25 * scale, height: 25 * scale, borderRadius: 13 * scale }]}> 
      <Svg width={25 * scale} height={25 * scale} viewBox="0 0 25 25">
        <Circle cx="12.5" cy="12.5" r="12" fill="#E79A42" />
        <Path d="M2.5 11.8c.4-5.9 4.3-9.4 9.7-9.4 4.8 0 8.5 2.3 10.2 6.2-2.1 1.8-3.9 2.7-6.6 2.7-3.7 0-6.3-1.5-8.3-3.7-.5 2.2-2.1 4.2-5 4.2Z" fill="#713615" />
        <Circle cx="12" cy="11.7" r="5.1" fill="#F5BF83" />
        <Circle cx="10.2" cy="11.5" r=".6" fill="#3F200F" />
        <Circle cx="14.1" cy="11.5" r=".6" fill="#3F200F" />
        <Path d="M10.3 14c1.4 1.2 3 1.2 4.4 0" fill="none" stroke="#713615" strokeWidth=".7" strokeLinecap="round" />
        <Path d="M5 23.8c.6-4.6 3.3-7 7.4-7s6.8 2.4 7.5 7" fill="#2A6C70" />
      </Svg>
    </View>
  )
}

function Leaves({ scale }: { scale: number }) {
  return (
    <Svg width={47 * scale} height={59 * scale} viewBox="0 0 47 59" style={styles.illustration}>
      <Path d="M0 42c6-5 10-15 17-20 2.7-2 5.5-2.2 7.7-.7-2 6.2-5.9 10.6-12.9 14.2 7.8-3.2 16.8-2.2 22.7 2.7 3.7 3 7.4 6.8 9.1 12-7.1.3-13-1.8-18.4-5.5-5.4-3.7-9-5-15-2.4C6.9 44.2 3.7 45.1 0 42Z" fill="#1FA65B" stroke="#16894A" strokeWidth=".7" />
      <Path d="M0 42c6.6-4.2 12-8.9 16.5-15.6M4 43c9 0 17.6 3.4 26.1 9" fill="none" stroke="#7DD66B" strokeWidth="1.1" opacity=".62" />
      <Path d="M0 33c1-6 5.9-14.4 12.4-20.3 3.2-2.8 6.6-3.6 9.9-2.6-1.1 8.3-5.4 14-12.5 18.1C6.5 31.2 3.3 33.7 0 33Z" fill="#29B562" />
    </Svg>
  )
}

function Cactus({ scale }: { scale: number }) {
  return (
    <Svg width={69 * scale} height={128 * scale} viewBox="0 0 69 128" style={styles.illustration}>
      <Defs>
        <SvgGradient id="cactus" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#22B85C" />
          <Stop offset="1" stopColor="#15914D" />
        </SvgGradient>
      </Defs>
      <Path d="M26 118V44c0-7.1 4.8-12.7 10.4-12.7 5.1 0 8.9 4.1 8.9 9.8v18.5c0 2.4 1.5 4.3 3.8 4.3s4-1.7 4-4.3v-9.2c0-4.4 2.9-7.9 6.3-7.9 4 0 6.3 3.8 6.3 8.7v18c0 10.7-7 18-16.5 18-1.8 0-3.4-.2-4.9-.7v39.5H26Z" fill="url(#cactus)" stroke="#158D4D" strokeWidth=".9" />
      <Path d="M20 102V77c0-6.5-3.7-11.6-8.5-11.6C6.9 65.4 4 68.7 4 73v13.8c0 2.7-1.7 4.8-4 4.8v13.7c10.5 0 17-6.8 17-16.5V102h3Z" fill="#20AD59" stroke="#158D4D" strokeWidth=".9" />
      <Path d="M32 44v68M39 43v69M53 63v41" stroke="#70D86F" strokeWidth="1" strokeDasharray="1.4 4.2" opacity=".8" />
      <Path d="M34 37c-1.6-2.8-1.6-5.2-.4-7.2M55 58c.5-2.9 1.7-4.9 3.7-6.3M12 72c-1.3-2.4-1.4-4.5-.4-6.1" stroke="#FFF07F" strokeWidth="1" strokeLinecap="round" />
      <Circle cx="19" cy="22" r="1.3" fill="#54CA61" /><Circle cx="9" cy="42" r="1.1" fill="#54CA61" /><Circle cx="63" cy="25" r="1.1" fill="#54CA61" />
    </Svg>
  )
}

function Chest({ scale }: { scale: number }) {
  return (
    <Svg width={39 * scale} height={36 * scale} viewBox="0 0 39 36" style={styles.illustration}>
      <Defs>
        <SvgGradient id="chest" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFC21B" />
          <Stop offset="1" stopColor="#D97800" />
        </SvgGradient>
      </Defs>
      <Path d="M4 12.5c0-3 2.4-5.3 5.4-5.3h20.3c3 0 5.3 2.4 5.3 5.3v15.3c0 2-1.5 3.4-3.5 3.4H7.5c-2 0-3.5-1.4-3.5-3.4V12.5Z" fill="url(#chest)" stroke="#B56400" strokeWidth="1.2" />
      <Path d="M4.2 13.8h30.6v5.4H4.2z" fill="#FFCE36" stroke="#B56400" strokeWidth="1" />
      <Path d="M9 8.7c.9-4.8 4-6.7 7-4.8 2.1 1.4 3.5 1.2 5.5-.1 3-2 6.3 0 7.1 4.9" fill="#F9A709" stroke="#B56400" strokeWidth="1.2" />
      <Path d="M17.1 14v8.8M21.3 14v8.8" stroke="#A85700" strokeWidth="1.4" />
      <Rect x="16.1" y="18.2" width="6.3" height="7.3" rx="2" fill="#FBD245" stroke="#B56400" strokeWidth="1" />
      <Circle cx="19.2" cy="21.5" r="1" fill="#9C4E00" />
    </Svg>
  )
}

function CodeBadge({ scale }: { scale: number }) {
  return (
    <View style={[styles.codeBadge, { width: 31 * scale, height: 31 * scale, borderRadius: 16 * scale }]}> 
      <MaterialCommunityIcons name="code-tags" size={18 * scale} color="#FFF8DD" />
    </View>
  )
}

function LockBadge({ scale }: { scale: number }) {
  return (
    <View style={[styles.lockBadge, { width: 29 * scale, height: 29 * scale, borderRadius: 15 * scale }]}> 
      <MaterialCommunityIcons name="lock" size={14 * scale} color="#85612B" />
    </View>
  )
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions()
  const [activeTab, setActiveTab] = useState('home')
  // useWindowDimensions can briefly report 0 during web hydration; keep SVG
  // dimensions valid for that first paint and let the real viewport update.
  const scale = useMemo(() => Math.max(0.1, Math.min(width / BASE_WIDTH, height / BASE_HEIGHT)), [width, height])
  const cardWidth = width
  const cardHeight = height
  const u = (value: number) => value * scale

  const chooseLesson = async (index: number) => {
    await Haptics.selectionAsync()
    if (lessons[index].locked) {
      Alert.alert('Keep going', 'Finish Day 1 to unlock this lesson.')
      return
    }
  }

  const navItems = [
    { key: 'home', icon: 'home-variant', label: 'Home' },
    { key: 'list', icon: 'clipboard-text-outline', label: 'Path' },
    { key: 'trophy', icon: 'trophy-outline', label: 'Rank' },
    { key: 'profile', icon: 'account-outline', label: 'Profile' },
  ] as const

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.background}>
        <View style={[styles.card, { width: cardWidth, height: cardHeight, borderRadius: 0, marginTop: 0, marginLeft: 0 }]}>
          <LinearGradient colors={['#FFF8DA', '#FFF0B8', '#FFE7A0']} locations={[0, 0.52, 1]} style={StyleSheet.absoluteFill} />
          <View style={[styles.topPanel, { height: u(171), borderBottomLeftRadius: u(31), borderBottomRightRadius: u(31) }]} />

          <View style={[styles.topRow, { left: u(10), top: u(37), right: u(11), height: u(26) }]}>
            <View style={styles.greeting}>
              <Avatar scale={scale} />
              <Text style={[styles.greetingText, { fontSize: u(10.5) }]}>Hi, Jaques</Text>
            </View>
            <View style={styles.stats}>
              <View style={[styles.statPill, styles.gemPill, { height: u(23), borderRadius: u(12), paddingHorizontal: u(5), gap: u(1) }]}>
                <GemIcon scale={scale} />
                <Text style={[styles.statText, { fontSize: u(11) }]}>300</Text>
              </View>
              <View style={[styles.statPill, styles.firePill, { height: u(23), borderRadius: u(12), paddingHorizontal: u(5), gap: u(1) }]}>
                <MaterialCommunityIcons name="fire" size={u(17)} color="#F47711" />
                <Text style={[styles.statText, { fontSize: u(11) }]}>7</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.title, { left: u(13), top: u(81), width: u(205), fontSize: u(22), lineHeight: u(26) }]}>
            You are about to{`\n`}code <Text style={styles.titleAccent}>amazing</Text>{`\n`}things
          </Text>

          <Text style={[styles.pathCaption, { left: u(16), top: u(183), fontSize: u(10.5) }]}>Continue your path</Text>
          <Svg width={u(164)} height={u(314)} viewBox="0 0 164 314" style={[styles.trail, { left: u(24), top: u(198) }]}>
            <Path d="M72 8c38 18 47 42 31 69-16 28-43 29-42 58 1 26 49 35 43 70-4 24-24 35-57 35" fill="none" stroke="#FFF4CB" strokeWidth="12" strokeLinecap="round" />
          </Svg>

          <View style={[styles.leavesWrap, { left: u(-1), top: u(204) }]}><Leaves scale={scale} /></View>
          <View style={[styles.cactusWrap, { left: u(164), top: u(228) }]}><Cactus scale={scale * 1.08} /></View>

          <Pressable onPress={() => chooseLesson(0)} style={({ pressed }) => [styles.dayOne, { left: u(45), top: u(201), width: u(121), height: u(45), borderRadius: u(23), paddingHorizontal: u(5) }, pressed && styles.pressed]}>
            <CodeBadge scale={scale} />
            <View style={{ marginLeft: u(7) }}>
              <Text style={[styles.dayLabel, { fontSize: u(9.5), lineHeight: u(12) }]}>Day 1</Text>
              <Text style={[styles.lessonTitle, { fontSize: u(9.5), lineHeight: u(12) }]}>Code a Button</Text>
            </View>
            <View style={[styles.spark, { left: u(18), bottom: u(-7), width: u(10), height: u(10), borderRadius: u(5) }]} />
          </Pressable>

          {lessons.slice(1).map((lesson, index) => {
            const y = 268 + index * 52
            return (
              <Pressable key={lesson.day} onPress={() => chooseLesson(index + 1)} style={({ pressed }) => [styles.lessonRow, { left: u(36), top: u(y), width: u(127), height: u(42), borderRadius: u(22), paddingLeft: u(10), paddingRight: u(2) }, pressed && styles.pressed]}>
                <LockBadge scale={scale} />
                <View style={{ marginLeft: u(7), flex: 1 }}>
                  <Text style={[styles.dayLabel, { fontSize: u(9.5), lineHeight: u(12) }]}>{lesson.day}</Text>
                  <Text style={[styles.lessonTitle, { fontSize: u(9.5), lineHeight: u(12) }]}>{lesson.title}</Text>
                </View>
              </Pressable>
            )
          })}

          <View style={[styles.chestWrap, { left: u(172), top: u(390) }]}><Chest scale={scale} /></View>

          <View style={[styles.bottomNav, { left: u(11), right: u(14), bottom: u(11), height: u(35), borderRadius: u(18) }]}>
            {navItems.map((item) => {
              const selected = activeTab === item.key
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => { setActiveTab(item.key); Haptics.selectionAsync() }}
                  style={({ pressed }) => [styles.navItem, { width: u(44), height: u(31), borderRadius: u(14) }, selected && styles.navItemSelected, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons name={item.icon} size={u(17)} color={selected ? '#9A4D0A' : '#845523'} />
                </Pressable>
              )
            })}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFE7A0' },
  background: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', backgroundColor: '#FFE7A0' },
  topPanel: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(255,249,220,.72)' },
  card: {
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#A87626',
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 0,
  },
  topRow: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(119,68,21,.2)' },
  greetingText: { color: '#4F2A10', fontWeight: '700', letterSpacing: -0.2 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6E360E', borderWidth: 0 },
  gemPill: { minWidth: 44 },
  firePill: { minWidth: 30 },
  statText: { color: '#FFF4C1', fontWeight: '800', fontVariant: ['tabular-nums'] },
  title: { position: 'absolute', color: '#63330F', fontWeight: '800', letterSpacing: -0.6 },
  titleAccent: { color: '#E66A0B' },
  pathCaption: { position: 'absolute', color: '#4B2A0D', fontWeight: '600' },
  trail: { position: 'absolute', opacity: 0.92 },
  illustration: { position: 'absolute' },
  leavesWrap: { position: 'absolute' },
  cactusWrap: { position: 'absolute' },
  chestWrap: { position: 'absolute' },
  dayOne: { position: 'absolute', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, backgroundColor: 'rgba(255,253,242,.93)', borderWidth: 1, borderColor: 'rgba(226,200,133,.48)', shadowColor: '#A56C16', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  lessonRow: { position: 'absolute', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 2, backgroundColor: 'rgba(255,249,217,.55)' },
  codeBadge: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E77A13', borderWidth: 2, borderColor: '#FFC042', shadowColor: '#A85F0F', shadowOpacity: 0.2, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  lockBadge: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#DFC184', borderWidth: 1, borderColor: '#C8A767', shadowColor: '#8E6A30', shadowOpacity: 0.2, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  dayLabel: { color: '#795021', fontWeight: '600' },
  lessonTitle: { color: '#633A15', fontWeight: '500' },
  spark: { position: 'absolute', backgroundColor: '#E8A927', borderWidth: 1, borderColor: '#B76D0A' },
  bottomNav: { position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 1 },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navItemSelected: { backgroundColor: '#FFFDF2', borderWidth: 1, borderColor: 'rgba(223,196,129,.35)', shadowColor: '#C88B25', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  pressed: { transform: [{ scale: 0.96 }], opacity: 0.85 },
})
