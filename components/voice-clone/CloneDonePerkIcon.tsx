'use client'

import type { VoiceClonePerkColor } from '@/lib/voiceClonePerks'

const STROKE: Record<VoiceClonePerkColor, string> = {
  p1: '#7B3FD4',
  p2: '#E91E63',
  p3: '#2E7D32',
  p4: '#F9A825',
}

export function cloneDonePerkIconBg(colorClass: VoiceClonePerkColor): string {
  switch (colorClass) {
    case 'p1':
      return 'bg-[#F5F0FF]'
    case 'p2':
      return 'bg-[#FFF5F8]'
    case 'p3':
      return 'bg-[#E8F5E9]'
    case 'p4':
      return 'bg-[#FFF8E1]'
  }
}

/** qinsheng CloneScreen PERK_ICONS，描边色对齐美柚主色 */
export function CloneDonePerkIcon({ colorClass }: { colorClass: VoiceClonePerkColor }) {
  const s = STROKE[colorClass]
  switch (colorClass) {
    case 'p1':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="6" r="3" stroke={s} strokeWidth="1.1" />
          <path
            d="M3 14s0-4 5-4 5 4 5 4"
            stroke={s}
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )
    case 'p2':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 1.5l1.4 4.3H14l-3.6 2.6 1.4 4.2L8 10.2l-3.8 2.4 1.4-4.2L2 5.8h4.6z"
            stroke={s}
            strokeWidth="1"
            fill="none"
          />
        </svg>
      )
    case 'p3':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2" y="3" width="12" height="10" rx="3" stroke={s} strokeWidth="1.1" />
          <path d="M5 7h6M5 9.5h4" stroke={s} strokeWidth="1" strokeLinecap="round" />
        </svg>
      )
    case 'p4':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="5" cy="6.5" r="2.5" stroke={s} strokeWidth="1.1" />
          <circle cx="11" cy="6.5" r="2.5" stroke={s} strokeWidth="1.1" />
          <path
            d="M1 14s0-3 4-3M12 11c4 0 4 3 4 3"
            stroke={s}
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )
  }
}
