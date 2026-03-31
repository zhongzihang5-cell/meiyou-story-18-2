'use client'
import { AGE_OPTIONS } from '@/lib/mockData'
import type { AgeGroup } from '@/lib/mockData'

interface Props {
  selected: AgeGroup | undefined
  onChange: (v: AgeGroup | undefined) => void
}

export default function AgeTabBar({ selected, onChange }: Props) {
  return (
    <div className="flex overflow-x-auto no-scrollbar border-b border-[#F0E8FF] bg-[#FBF7FF]">
      {AGE_OPTIONS.map(opt => {
        const active = selected === opt.value
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`
              flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap
              relative transition-colors duration-150
              ${active ? 'text-[#E91E63] font-bold' : 'text-[#B0A0C8]'}
            `}
          >
            {opt.label}
            {active && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#E91E63] rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
