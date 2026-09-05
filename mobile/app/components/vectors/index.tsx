import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  G,
  Polygon,
} from 'react-native-svg'

interface VectorProps {
  size?: number
  scale?: number
}

/**
 * 1. GemIcon: Golden/Orange Gemstone
 */
export function GemIcon({ size = 22 }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <SvgGradient id="gemGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE57F" />
          <Stop offset="0.45" stopColor="#FF9F1A" />
          <Stop offset="1" stopColor="#D96600" />
        </SvgGradient>
      </Defs>
      <Path
        d="M3 8.5L7 3.5h10l4 5L12 21.5 3 8.5z"
        fill="url(#gemGrad)"
        stroke="#B85300"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <Path
        d="M7 3.5L9.5 8.5h5L17 3.5M3 8.5h18M9.5 8.5L12 21.5l2.5-13"
        fill="none"
        stroke="#FFF8C4"
        strokeWidth="1.1"
        opacity="0.85"
      />
    </Svg>
  )
}

/**
 * 2. StreakFlame: Glowing Orange Fire Streak with 3D Depth
 */
export function StreakFlame({ size = 24 }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <SvgGradient id="flameOuter" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#FF3D00" />
          <Stop offset="0.6" stopColor="#FF8F00" />
          <Stop offset="1" stopColor="#FFA000" />
        </SvgGradient>
        <SvgGradient id="flameInner" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#FFD54F" />
          <Stop offset="1" stopColor="#FFFDE7" />
        </SvgGradient>
      </Defs>
      {/* Outer Flame */}
      <Path
        d="M12 2c-.3 2.1-.9 3.8-2 5.2-1.3 1.7-3 3-3 5.6 0 4.4 3.6 7.2 8 7.2s7-2.8 7-7.2c0-3.3-1.8-5.8-3.5-7.7-.6-.7-1.1-1.4-1.5-2.1-.2 1.4-.8 2.6-1.8 3.5-.4.4-.9.7-1.4.9.4-1.6.3-3.7-.8-5.4z"
        fill="url(#flameOuter)"
      />
      {/* Inner Flame Core */}
      <Path
        d="M12 10c-.8 1.1-1.5 2.1-1.5 3.8 0 2.2 1.6 3.7 3.5 3.7s3-1.5 3-3.7c0-1.5-.8-2.6-1.6-3.4-.2.9-.6 1.6-1.2 2.1-.4-1-.5-1.8-.2-2.5z"
        fill="url(#flameInner)"
      />
    </Svg>
  )
}

/**
 * 3. XPStar: Glossy 3D Golden Star
 */
export function XPStar({ size = 24 }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <SvgGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE066" />
          <Stop offset="0.5" stopColor="#FFB800" />
          <Stop offset="1" stopColor="#E69500" />
        </SvgGradient>
      </Defs>
      <Path
        d="M12 2.5l2.9 6.2 6.8.9-5 4.8 1.2 6.8L12 18l-6 3.2 1.2-6.8-5-4.8 6.8-.9L12 2.5z"
        fill="url(#starGrad)"
        stroke="#C97B00"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <Path
        d="M12 4.5l2 4.5 4.8.6-3.5 3.4.9 4.8L12 15.5"
        fill="none"
        stroke="#FFFCE6"
        strokeWidth="1"
        opacity="0.8"
      />
    </Svg>
  )
}

/**
 * 4. BataaAvatar: Friendly 3D White Duck Portrait with optional Edit Pencil
 */
export function BataaAvatar({
  size = 64,
  showPencil = false,
}: VectorProps & { showPencil?: boolean }) {
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgGradient id="avatarBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF2DC" />
            <Stop offset="1" stopColor="#FFE0B2" />
          </SvgGradient>
          <SvgGradient id="duckHead" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.8" stopColor="#F9F5EE" />
            <Stop offset="1" stopColor="#EDE3D1" />
          </SvgGradient>
          <SvgGradient id="billGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFA62B" />
            <Stop offset="1" stopColor="#EA6C00" />
          </SvgGradient>
        </Defs>

        {/* Circular Background halo */}
        <Circle cx="50" cy="50" r="48" fill="url(#avatarBg)" stroke="#EBD4B5" strokeWidth="2.5" />

        {/* Duck Body / Shoulders */}
        <Path d="M22 88c5-16 16-24 28-24s23 8 28 24z" fill="#F4EDE0" />

        {/* Duck Head */}
        <Circle cx="50" cy="46" r="30" fill="url(#duckHead)" stroke="#DDD1BE" strokeWidth="1.5" />

        {/* Soft Cheeks */}
        <Circle cx="32" cy="52" r="5" fill="#FFBBA6" opacity="0.6" />
        <Circle cx="68" cy="52" r="5" fill="#FFBBA6" opacity="0.6" />

        {/* Big Expressive Eyes */}
        <Circle cx="40" cy="42" r="5.5" fill="#201812" />
        <Circle cx="42" cy="40" r="2" fill="#FFFFFF" />
        <Circle cx="60" cy="42" r="5.5" fill="#201812" />
        <Circle cx="62" cy="40" r="2" fill="#FFFFFF" />

        {/* Cute Yellow/Orange Duck Bill */}
        <Path
          d="M36 50c3-3 8-4 14-4s11 1 14 4c2 3 1 7-3 9-4 2-8 3-11 3s-7-1-11-3c-4-2-5-6-3-9z"
          fill="url(#billGrad)"
          stroke="#C85800"
          strokeWidth="1.2"
        />
        {/* Bill Smile Line */}
        <Path d="M43 54c2 1 5 1.5 7 1.5s5-.5 7-1.5" fill="none" stroke="#9E4000" strokeWidth="1.2" strokeLinecap="round" />
      </Svg>

      {/* Optional Pencil Badge */}
      {showPencil && (
        <View style={styles.pencilBadge}>
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Path
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
              fill="#FFFFFF"
            />
          </Svg>
        </View>
      )}
    </View>
  )
}

/**
 * 5. BataaCelebrationMascot: The White 3D Duck jumping on Golden Star with Confetti (Exact match to Screen 4)
 */
export function BataaCelebrationMascot({ size = 210 }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 220 220">
      <Defs>
        <SvgGradient id="starBevel" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE675" />
          <Stop offset="0.45" stopColor="#FFBA19" />
          <Stop offset="1" stopColor="#E68A00" />
        </SvgGradient>
        <SvgGradient id="duckBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.7" stopColor="#F7F1E6" />
          <Stop offset="1" stopColor="#E5D9C4" />
        </SvgGradient>
        <SvgGradient id="beakOrange" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFB338" />
          <Stop offset="1" stopColor="#E66800" />
        </SvgGradient>
      </Defs>

      {/* Celebration Confetti in the sky */}
      <Rect x="30" y="38" width="9" height="7" rx="2" fill="#22C55E" transform="rotate(25 30 38)" />
      <Circle cx="185" cy="45" r="4.5" fill="#FF7A00" />
      <Polygon points="195,85 202,91 195,97 188,91" fill="#3B82F6" />
      <Rect x="42" y="105" width="8" height="6" rx="1.5" fill="#EF4444" transform="rotate(-30 42 105)" />
      <Circle cx="165" cy="22" r="4" fill="#FACC15" />
      <Polygon points="45,18 52,24 45,30" fill="#EC4899" />
      <Rect x="180" y="125" width="7" height="7" rx="1.5" fill="#10B981" transform="rotate(15 180 125)" />
      <Circle cx="22" cy="75" r="3.5" fill="#A855F7" />

      {/* Golden 3D Star Platform */}
      <Path
        d="M110 148l16 28 32 4-24 22 6 32-30-16-30 16 6-32-24-22 32-4z"
        fill="url(#starBevel)"
        stroke="#BD7200"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Star Highlight */}
      <Path
        d="M110 152l12 22 24 3-18 16 4 24-22-12"
        fill="none"
        stroke="#FFF8C4"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Duck Webbed Feet */}
      <Path d="M96 158c-4 0-8 3-8 6s4 4 8 4 8-1 8-4-4-6-8-6z" fill="#FFA500" stroke="#C86E00" strokeWidth="1" />
      <Path d="M124 158c-4 0-8 3-8 6s4 4 8 4 8-1 8-4-4-6-8-6z" fill="#FFA500" stroke="#C86E00" strokeWidth="1" />

      {/* Duck Chubby Body */}
      <Path
        d="M80 115c0-18 14-32 30-32s30 14 30 32c0 20-13 40-30 40s-30-20-30-40z"
        fill="url(#duckBodyGrad)"
        stroke="#D5C7B0"
        strokeWidth="1.5"
      />

      {/* Left Flapping Wing (up & waving) */}
      <Path
        d="M82 110c-16-12-28-8-34 4-4 6 2 14 11 12 9-2 18-8 23-16z"
        fill="#FFFFFF"
        stroke="#D5C7B0"
        strokeWidth="1.5"
      />
      {/* Right Flapping Wing (up & waving) */}
      <Path
        d="M138 110c16-12 28-8 34 4 4 6-2 14-11 12-9-2-18-8-23-16z"
        fill="#FFFFFF"
        stroke="#D5C7B0"
        strokeWidth="1.5"
      />

      {/* Cute Round Duck Head */}
      <Circle cx="110" cy="80" r="30" fill="url(#duckBodyGrad)" stroke="#D5C7B0" strokeWidth="1.5" />

      {/* Rosy Cheeks */}
      <Circle cx="92" cy="88" r="5.5" fill="#FFAE9E" opacity="0.65" />
      <Circle cx="128" cy="88" r="5.5" fill="#FFAE9E" opacity="0.65" />

      {/* Big Sparkling Eyes */}
      <Circle cx="99" cy="76" r="6" fill="#1C140E" />
      <Circle cx="101" cy="74" r="2.2" fill="#FFFFFF" />
      <Circle cx="121" cy="76" r="6" fill="#1C140E" />
      <Circle cx="123" cy="74" r="2.2" fill="#FFFFFF" />

      {/* Cheerful Beak */}
      <Path
        d="M95 84c5-4 10-5 15-5s10 1 15 5c3 4 1 8-4 10-4 2-8 3-11 3s-7-1-11-3c-5-2-6-6-4-10z"
        fill="url(#beakOrange)"
        stroke="#B85500"
        strokeWidth="1.2"
      />
      {/* Smile Crease */}
      <Path d="M103 91c2 1 5 1.5 7 1.5s5-.5 7-1.5" fill="none" stroke="#8E4300" strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  )
}

/**
 * 6. StreakFreezeGem: Ice Crystal Diamond for Shop
 */
export function StreakFreezeGem({ size = 52 }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Defs>
        <SvgGradient id="freezeIce" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#BAF3FF" />
          <Stop offset="0.5" stopColor="#48CAE4" />
          <Stop offset="1" stopColor="#0077B6" />
        </SvgGradient>
      </Defs>
      <Polygon points="30,4 52,18 52,42 30,56 8,42 8,18" fill="url(#freezeIce)" stroke="#0096C7" strokeWidth="1.5" />
      <Polygon points="30,4 52,18 30,30 8,18" fill="#E0FAFF" opacity="0.6" />
      <Polygon points="30,30 52,18 52,42 30,56" fill="#0077B6" opacity="0.3" />
      <Polygon points="30,30 8,18 8,42 30,56" fill="#023E8A" opacity="0.4" />
      <Polygon points="30,16 42,24 30,44 18,24" fill="#FFFFFF" opacity="0.75" />
    </Svg>
  )
}

/**
 * 7. DoubleXPBadge: Glossy Purple Badge for Shop
 */
export function DoubleXPBadge({ size = 52 }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Defs>
        <SvgGradient id="xpPurp" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#C084FC" />
          <Stop offset="0.6" stopColor="#9333EA" />
          <Stop offset="1" stopColor="#6B21A8" />
        </SvgGradient>
      </Defs>
      <Circle cx="30" cy="30" r="26" fill="url(#xpPurp)" stroke="#7E22CE" strokeWidth="2" />
      <Circle cx="30" cy="30" r="22" fill="none" stroke="#E9D5FF" strokeWidth="1" opacity="0.5" />
      <Circle cx="44" cy="16" r="2" fill="#FFFFFF" />
      <Circle cx="16" cy="44" r="1.5" fill="#FFFFFF" />
      <Path
        d="M20 22L27 38M27 22L20 38M31 22h6c3 0 5 1.5 5 4.5s-2 4.5-5 4.5h-6v7"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

/**
 * 8. HintLightbulb: Glowing Yellow Idea Bulb for Shop & Lesson
 */
export function HintLightbulb({ size = 52 }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Defs>
        <SvgGradient id="bulbGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFF275" />
          <Stop offset="0.6" stopColor="#FFC700" />
          <Stop offset="1" stopColor="#E59B00" />
        </SvgGradient>
      </Defs>
      <Path
        d="M30 8c-9.5 0-17 7.5-17 17 0 6 3 11 8 14v5h18v-5c5-3 8-8 8-14 0-9.5-7.5-17-17-17z"
        fill="url(#bulbGrad)"
        stroke="#D98A00"
        strokeWidth="1.5"
      />
      <Path d="M30 2v3M10 14l3 2M50 14l-3 2" stroke="#FFD000" strokeWidth="2" strokeLinecap="round" />
      <Rect x="23" y="44" width="14" height="3" rx="1.5" fill="#B0A292" />
      <Rect x="24" y="48" width="12" height="3" rx="1.5" fill="#8C7D6D" />
      <Path d="M26 52h8" stroke="#66594C" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  )
}

/**
 * 9. HeartRefill: Glossy 3D Red Heart for Lives
 */
export function HeartRefill({ size = 52 }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Defs>
        <SvgGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FF4D6D" />
          <Stop offset="0.6" stopColor="#E60039" />
          <Stop offset="1" stopColor="#A80024" />
        </SvgGradient>
      </Defs>
      <Path
        d="M30 52s-19-12-19-27a11 11 0 0 1 19-7.5A11 11 0 0 1 49 25c0 15-19 27-19 27z"
        fill="url(#heartGrad)"
        stroke="#80001B"
        strokeWidth="1.5"
      />
      <Path
        d="M17 17a6 6 0 0 1 8 2"
        stroke="#FFA1B5"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  )
}

/**
 * 10. LevelShield: Hexagonal/Shield Level Badge
 */
export function LevelShield({ size = 48, level = 3 }: VectorProps & { level?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Defs>
        <SvgGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FF9F1A" />
          <Stop offset="1" stopColor="#E66800" />
        </SvgGradient>
      </Defs>
      <Polygon
        points="30,4 52,14 52,42 30,56 8,42 8,14"
        fill="url(#shieldGrad)"
        stroke="#B34B00"
        strokeWidth="2"
      />
      <Polygon
        points="30,9 47,17 47,39 30,50 13,39 13,17"
        fill="#FF9000"
        stroke="#FFCC80"
        strokeWidth="1"
      />
    </Svg>
  )
}

/**
 * 11. CactusIllustration: Tall Green Cactus from Home
 */
export function CactusIllustration({ width = 70, height = 130 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 69 128">
      <Defs>
        <SvgGradient id="cactusFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#22B85C" />
          <Stop offset="1" stopColor="#15914D" />
        </SvgGradient>
      </Defs>
      <Path
        d="M26 118V44c0-7.1 4.8-12.7 10.4-12.7 5.1 0 8.9 4.1 8.9 9.8v18.5c0 2.4 1.5 4.3 3.8 4.3s4-1.7 4-4.3v-9.2c0-4.4 2.9-7.9 6.3-7.9 4 0 6.3 3.8 6.3 8.7v18c0 10.7-7 18-16.5 18-1.8 0-3.4-.2-4.9-.7v39.5H26Z"
        fill="url(#cactusFill)"
        stroke="#158D4D"
        strokeWidth="1.2"
      />
      <Path
        d="M20 102V77c0-6.5-3.7-11.6-8.5-11.6C6.9 65.4 4 68.7 4 73v13.8c0 2.7-1.7 4.8-4 4.8v13.7c10.5 0 17-6.8 17-16.5V102h3Z"
        fill="#20AD59"
        stroke="#158D4D"
        strokeWidth="1.2"
      />
      <Path d="M32 44v68M39 43v69M53 63v41" stroke="#70D86F" strokeWidth="1.2" strokeDasharray="1.5 4.5" opacity="0.8" />
    </Svg>
  )
}

/**
 * 12. LeavesIllustration: Leaves on left from Home
 */
export function LeavesIllustration({ width = 50, height = 60 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 47 59">
      <Path
        d="M0 42c6-5 10-15 17-20 2.7-2 5.5-2.2 7.7-.7-2 6.2-5.9 10.6-12.9 14.2 7.8-3.2 16.8-2.2 22.7 2.7 3.7 3 7.4 6.8 9.1 12-7.1.3-13-1.8-18.4-5.5-5.4-3.7-9-5-15-2.4C6.9 44.2 3.7 45.1 0 42Z"
        fill="#1FA65B"
        stroke="#16894A"
        strokeWidth="1"
      />
      <Path d="M0 42c6.6-4.2 12-8.9 16.5-15.6M4 43c9 0 17.6 3.4 26.1 9" fill="none" stroke="#7DD66B" strokeWidth="1.2" opacity="0.7" />
    </Svg>
  )
}

/**
 * 13. TreasureChest: Golden Treasure Chest with lock
 */
export function TreasureChest({ size = 42 }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 39 36">
      <Defs>
        <SvgGradient id="chestGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFC21B" />
          <Stop offset="1" stopColor="#D97800" />
        </SvgGradient>
      </Defs>
      <Path
        d="M4 12.5c0-3 2.4-5.3 5.4-5.3h20.3c3 0 5.3 2.4 5.3 5.3v15.3c0 2-1.5 3.4-3.5 3.4H7.5c-2 0-3.5-1.4-3.5-3.4V12.5Z"
        fill="url(#chestGrad)"
        stroke="#B56400"
        strokeWidth="1.2"
      />
      <Path d="M4.2 13.8h30.6v5.4H4.2z" fill="#FFCE36" stroke="#B56400" strokeWidth="1" />
      <Rect x="16.1" y="18.2" width="6.3" height="7.3" rx="2" fill="#FBD245" stroke="#B56400" strokeWidth="1" />
      <Circle cx="19.2" cy="21.5" r="1" fill="#9C4E00" />
    </Svg>
  )
}

const styles = StyleSheet.create({
  pencilBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF7A00',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
})
