import React from 'react';
import { motion } from 'framer-motion';
import { MascotPose } from '@/types';

interface DuckMascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  animate?: boolean;
}

export const BataaDuckMascot: React.FC<DuckMascotProps> = ({
  pose = 'waving',
  size = 140,
  className = '',
  animate = true,
}) => {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      animate={animate ? { y: [0, -3, 0] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <svg
        viewBox="0 0 240 240"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          <radialGradient id="duckBody" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fbf6ee" />
            <stop offset="100%" stopColor="#ebdcc8" />
          </radialGradient>
          
          <radialGradient id="duckHead" cx="38%" cy="30%" r="62%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#faf3e6" />
            <stop offset="100%" stopColor="#eedcc6" />
          </radialGradient>

          <linearGradient id="duckBeak" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff9d24" />
            <stop offset="50%" stopColor="#ff7a00" />
            <stop offset="100%" stopColor="#d85200" />
          </linearGradient>

          <linearGradient id="duckFeet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffa02e" />
            <stop offset="100%" stopColor="#d45900" />
          </linearGradient>

          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(45, 24, 11, 0.28)" />
            <stop offset="100%" stopColor="rgba(45, 24, 11, 0)" />
          </radialGradient>

          <linearGradient id="goldStar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe600" />
            <stop offset="100%" stopColor="#ff9900" />
          </linearGradient>
        </defs>

        <ellipse cx="120" cy="216" rx="65" ry="14" fill="url(#groundShadow)" />

        {pose === 'trophy' && (
          <g id="trophy-podium">
            <path d="M 40 215 L 200 215 L 195 200 L 45 200 Z" fill="#e8d5bf" />
            <path d="M 65 200 L 175 200 L 170 185 L 70 185 Z" fill="#f4e4d0" />
            <path d="M 85 185 L 155 185 L 150 172 L 90 172 Z" fill="#fdf0dd" />
          </g>
        )}

        {pose !== 'peeking' && (
          <g id="feet">
            <ellipse cx="96" cy="208" rx="16" ry="8" fill="url(#duckFeet)" />
            <ellipse cx="144" cy="208" rx="16" ry="8" fill="url(#duckFeet)" />
          </g>
        )}

        {pose !== 'peeking' && (
          <path
            d="M 68 150 C 68 115 95 105 120 105 C 145 105 172 115 172 150 C 172 188 152 208 120 208 C 88 208 68 188 68 150 Z"
            fill="url(#duckBody)"
          />
        )}

        {pose === 'celebrating' ? (
          <g id="wings-celebrating">
            <motion.path
              d="M 75 145 C 50 120 30 85 45 75 C 60 65 78 100 85 130 Z"
              fill="url(#duckBody)"
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.path
              d="M 165 145 C 190 120 210 85 195 75 C 180 65 162 100 155 130 Z"
              fill="url(#duckBody)"
              animate={{ rotate: [8, -8, 8] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </g>
        ) : pose === 'waving' ? (
          <g id="wings-waving">
            <path d="M 68 140 C 52 145 52 170 70 180 C 76 170 76 150 68 140 Z" fill="#eedcc6" />
            <motion.path
              d="M 168 135 C 195 120 205 95 192 90 C 178 85 165 110 162 140 Z"
              fill="url(#duckBody)"
              animate={{ rotate: [0, 14, 0] }}
              style={{ transformOrigin: '165px 140px' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        ) : pose === 'teacher' ? (
          <g id="wings-teacher">
            <path d="M 68 140 C 52 145 52 170 70 180 C 76 170 76 150 68 140 Z" fill="#eedcc6" />
            <path d="M 165 140 C 180 135 185 145 175 160 C 168 160 165 150 165 140 Z" fill="url(#duckBody)" />
            <line x1="172" y1="150" x2="225" y2="85" stroke="#9e663a" strokeWidth="4" strokeLinecap="round" />
            <circle cx="225" cy="85" r="4" fill="#ffd600" />
          </g>
        ) : pose === 'laptop' ? (
          <g id="wings-laptop">
            <path d="M 80 145 C 75 155 85 168 100 165 C 95 155 88 148 80 145 Z" fill="#eedcc6" />
            <path d="M 160 145 C 165 155 155 168 140 165 C 145 155 152 148 160 145 Z" fill="#eedcc6" />
          </g>
        ) : pose === 'screen_point' ? (
          <g id="wings-screen-point">
            <path d="M 68 140 C 52 145 52 170 70 180 C 76 170 76 150 68 140 Z" fill="#eedcc6" />
            <path d="M 165 140 C 190 135 205 130 215 135 C 205 148 185 152 165 150 Z" fill="url(#duckBody)" />
          </g>
        ) : (
          <g id="wings-default">
            <path d="M 68 140 C 52 145 52 170 70 180 C 76 170 76 150 68 140 Z" fill="#eedcc6" />
            <path d="M 172 140 C 188 145 188 170 170 180 C 164 170 164 150 172 140 Z" fill="#eedcc6" />
          </g>
        )}

        <circle
          cx="120"
          cy={pose === 'peeking' ? "140" : "85"}
          r="48"
          fill="url(#duckHead)"
        />

        {pose === 'celebrating' ? (
          <g id="eyes-happy" stroke="#2d180b" strokeWidth="4" strokeLinecap="round">
            <path d="M 96 78 Q 106 68 114 78" />
            <path d="M 126 78 Q 134 68 144 78" />
          </g>
        ) : pose === 'sad' ? (
          <g id="eyes-sad">
            <ellipse cx="105" cy="80" rx="6.5" ry="8" fill="#2d180b" />
            <ellipse cx="135" cy="80" rx="6.5" ry="8" fill="#2d180b" />
            <circle cx="103" cy="77" r="2.5" fill="#ffffff" />
            <circle cx="133" cy="77" r="2.5" fill="#ffffff" />
            <path d="M 98 88 C 96 93 94 96 94 98 C 94 101 96 103 98 103 C 100 103 102 101 102 98 C 102 96 100 93 98 88 Z" fill="#1cb0f6" />
          </g>
        ) : (
          <g id="eyes-normal">
            <ellipse cx="105" cy="78" rx="6.5" ry="8.5" fill="#2d180b" />
            <ellipse cx="135" cy="78" rx="6.5" ry="8.5" fill="#2d180b" />
            <circle cx="103" cy="75" r="2.5" fill="#ffffff" />
            <circle cx="133" cy="75" r="2.5" fill="#ffffff" />
            <circle cx="107" cy="81" r="1.2" fill="#ffffff" />
            <circle cx="137" cy="81" r="1.2" fill="#ffffff" />
          </g>
        )}

        <circle cx="90" cy="88" r="8" fill="#ff7a00" opacity="0.18" />
        <circle cx="150" cy="88" r="8" fill="#ff7a00" opacity="0.18" />

        <path
          d="M 102 85 C 102 85 110 82 120 82 C 130 82 138 85 138 85 C 145 92 142 105 120 105 C 98 105 95 92 102 85 Z"
          fill="url(#duckBeak)"
        />
        <path d="M 106 92 C 112 96 128 96 134 92" stroke="#b04000" strokeWidth="1.8" strokeLinecap="round" />

        {pose === 'laptop' && (
          <g id="prop-laptop">
            <rect x="80" y="160" width="80" height="25" rx="4" fill="#dfd0be" stroke="#cbb49e" strokeWidth="2" />
            <path d="M 90 160 L 90 120 L 150 120 L 150 160 Z" fill="#444152" stroke="#cbb49e" strokeWidth="2" />
            <text x="120" y="145" textAnchor="middle" fill="#ff8500" fontSize="14" fontWeight="bold" fontFamily="monospace">&lt; / &gt;</text>
            <rect x="175" y="162" width="16" height="20" rx="3" fill="#ffffff" stroke="#cbb49e" strokeWidth="1.5" />
            <path d="M 191 166 C 196 166 196 176 191 176" stroke="#cbb49e" strokeWidth="1.5" fill="none" />
            <text x="183" y="176" textAnchor="middle" fill="#ff8500" fontSize="8" fontWeight="bold">&lt;/&gt;</text>
          </g>
        )}

        {pose === 'trophy' && (
          <g id="prop-flag">
            <line x1="180" y1="50" x2="180" y2="180" stroke="#895f3c" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 180 50 L 230 65 L 180 80 Z" fill="#ff8500" stroke="#d45900" strokeWidth="2" />
            <text x="198" y="69" fill="#ffffff" fontSize="10" fontWeight="900" fontFamily="monospace">&lt;/&gt;</text>
          </g>
        )}

        {pose === 'thinking' && (
          <motion.g
            id="prop-lightbulb"
            animate={{ y: [-2, 2, -2], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <circle cx="165" cy="35" r="16" fill="#ffe600" opacity="0.25" />
            <circle cx="165" cy="35" r="10" fill="#ffd600" stroke="#e5c000" strokeWidth="1.5" />
            <path d="M 162 45 L 168 45" stroke="#2d180b" strokeWidth="2" strokeLinecap="round" />
            <line x1="165" y1="20" x2="165" y2="16" stroke="#ff9900" strokeWidth="2" strokeLinecap="round" />
            <line x1="178" y1="25" x2="182" y2="22" stroke="#ff9900" strokeWidth="2" strokeLinecap="round" />
            <line x1="152" y1="25" x2="148" y2="22" stroke="#ff9900" strokeWidth="2" strokeLinecap="round" />
          </motion.g>
        )}

        {pose === 'celebrating' && (
          <g id="celebration-particles">
            <motion.path
              d="M 120 18 L 123 27 L 132 27 L 125 33 L 128 42 L 120 36 L 112 42 L 115 33 L 108 27 L 117 27 Z"
              fill="url(#goldStar)"
              animate={{ rotate: [0, 360], scale: [0.9, 1.1, 0.9] }}
              style={{ transformOrigin: '120px 30px' }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
            <circle cx="65" cy="45" r="3" fill="#ff9900" />
            <circle cx="180" cy="40" r="3" fill="#58cc02" />
            <circle cx="50" cy="80" r="2.5" fill="#1cb0f6" />
            <circle cx="195" cy="90" r="3" fill="#ffd600" />
          </g>
        )}
      </svg>
    </motion.div>
  );
};
