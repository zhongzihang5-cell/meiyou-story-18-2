'use client'
import { useMemo, useState } from 'react'

interface VoiceChip {
  id: string
  label: string
  /** 需要会员才能选用（点击走 onUnlock） */
  vip: boolean
}

export interface VoiceSwitcherProps {
  isVip?: boolean
  onUnlock?: () => void
  /** 「声音管理」→ 我的声音列表 */
  onManage?: () => void
  /** 「+ 录制」→ 克隆流程 */
  onRecord?: () => void
}

export default function VoiceSwitcher({
  isVip = false,
  onUnlock = () => {},
  onManage = () => {},
  onRecord = onManage,
}: VoiceSwitcherProps) {
  const [selected, setSelected] = useState('default')

  const chips = useMemo<VoiceChip[]>(() => {
    const base: VoiceChip = { id: 'default', label: '默认音色', vip: false }
    if (isVip) {
      return [base, { id: 'mom', label: '妈妈原声', vip: false }]
    }
    return [base, { id: 'original', label: '原声讲述', vip: true }]
  }, [isVip])

  const handleChipClick = (voice: VoiceChip) => {
    if (voice.vip && !isVip) {
      onUnlock()
      return
    }
    setSelected(voice.id)
  }

  return (
    <div className="w-full font-sans">
      <div className="flex flex-nowrap items-center gap-1.5 w-full min-w-0">
        {chips.map(voice => {
          const isActive = selected === voice.id
          const isLocked = voice.vip && !isVip
          return (
            <button
              key={voice.id}
              type="button"
              onClick={() => handleChipClick(voice)}
              className={[
                'inline-flex items-center gap-1 flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-200',
                isActive
                  ? 'bg-white text-[#1A0A2E] shadow-sm'
                  : isLocked
                    ? 'bg-amber-400/12 border border-amber-400/55 text-amber-200 hover:bg-amber-400/20'
                    : 'bg-white/12 border border-white/25 text-white/90 hover:bg-white/20',
              ].join(' ')}>
              {isActive && voice.id === 'mom' && <MicIcon className="w-3 h-3 text-[#7B3FD4] flex-shrink-0" />}
              <span className="whitespace-nowrap">{voice.label}</span>
              {voice.vip && !isVip && (
                <span className="text-[8px] font-bold bg-amber-400 text-amber-950 px-1 py-px rounded leading-none">VIP</span>
              )}
            </button>
          )
        })}

        {isVip && (
          <button
            type="button"
            onClick={onRecord}
            className="inline-flex flex-shrink-0 items-center gap-0.5 px-2.5 py-1 rounded-full text-[11px] border border-white/30 text-white/75 hover:bg-white/12 transition-all">
            + 录制
          </button>
        )}

        <button
          type="button"
          onClick={onManage}
          className="ml-auto flex-shrink-0 pl-1 text-[11px] text-white/45 hover:text-white/70 transition-colors whitespace-nowrap inline-flex items-center gap-0.5">
          声音管理
          <ChevronIcon className="w-3 h-3 opacity-80" />
        </button>
      </div>

      {!isVip && (
        <div
          className="mt-2.5 flex items-center gap-2 px-2.5 py-2 rounded-lg border-l-2 border-amber-400/90"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <p className="flex-1 min-w-0 text-[11px] text-white/60 leading-snug">
            切换妈妈原声讲故事，让柚柚更亲切
          </p>
          <button
            type="button"
            onClick={onUnlock}
            className="text-[11px] font-semibold text-amber-300 whitespace-nowrap flex-shrink-0 hover:text-amber-200 transition-colors">
            解锁 VIP →
          </button>
        </div>
      )}
    </div>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="5" y="1" width="6" height="8" rx="3" fill="currentColor" />
      <path d="M3 7.5a5 5 0 0 0 10 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <line x1="8" y1="12.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M4.5 3 7.5 6l-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
