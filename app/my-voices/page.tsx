'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  countDoneSlots,
  getVoiceSlots,
  getVoiceSlotsServerSnapshot,
  sessionAudioKey,
  type VoiceSlotId,
  type VoiceSlotsState,
  VOICE_SLOT_TOTAL,
} from '@/lib/voiceSlots'

const SLOT_UI: Record<
  VoiceSlotId,
  { title: string; emoji: string; emptyTitle: string; emptyDesc: string; recordLabel: string }
> = {
  mom: {
    title: '妈妈的声音',
    emoji: '👩',
    emptyTitle: '妈妈的声音',
    emptyDesc: '还没有克隆妈妈的声音',
    recordLabel: '录制妈妈的声音',
  },
  dad: {
    title: '爸爸的声音',
    emoji: '👨',
    emptyTitle: '爸爸的声音',
    emptyDesc: '还没有克隆爸爸的声音',
    recordLabel: '录制爸爸的声音',
  },
  elder: {
    title: '其他家人的声音',
    emoji: '✨',
    emptyTitle: '其他家人的声音',
    emptyDesc: '还没有克隆其他家人的声音',
    recordLabel: '录制其他家人的声音',
  },
}

function cloneQuery(slot: VoiceSlotId) {
  if (slot === 'mom') return `/voice-clone?skipRole=1&role=mom&from=my-voices`
  if (slot === 'dad') return `/voice-clone?skipRole=1&role=dad&from=my-voices`
  return `/voice-clone?skipRole=1&role=other&custom=${encodeURIComponent('其他家人')}&from=my-voices`
}

function DoneCard({
  slot,
  meta,
}: {
  slot: VoiceSlotId
  meta: NonNullable<VoiceSlotsState[VoiceSlotId]>
}) {
  const ui = SLOT_UI[slot]
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [durationLabel, setDurationLabel] = useState('0:08')

  const previewUrl =
    typeof window !== 'undefined' ? sessionStorage.getItem(sessionAudioKey(slot)) : null

  const togglePlay = () => {
    if (!previewUrl) {
      alert('暂无本地试听缓存，请先完成一次克隆流程')
      return
    }
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
      setPlaying(false)
      return
    }
    const a = new Audio(previewUrl)
    audioRef.current = a
    a.onloadedmetadata = () => {
      const d = a.duration
      if (Number.isFinite(d)) {
        const m = Math.floor(d / 60)
        const s = Math.floor(d % 60)
        setDurationLabel(`${m}:${s.toString().padStart(2, '0')}`)
      }
    }
    a.onended = () => {
      setPlaying(false)
      audioRef.current = null
    }
    a.play()
      .then(() => setPlaying(true))
      .catch(() => {
        audioRef.current = null
        setPlaying(false)
        alert('无法播放')
      })
  }

  return (
    <div className="bg-white rounded-[16px] border border-[#F0E8FF] p-4 mb-3 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-[26px] flex-shrink-0"
          style={{ background: '#FFF0F5' }}>
          {ui.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-bold text-[#1A0A2E]">{ui.title}</span>
            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-[#43A047]">已完成</span>
          </div>
          <div className="text-[11px] text-[#B0A0C8] mt-1">
            克隆于 {meta.date ?? '—'} · {meta.sentences ?? 10}句话
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={togglePlay}
        className="w-full flex items-center gap-3 rounded-[14px] px-3 py-2.5 mb-3 border border-[#E8DCFF] bg-[#FAF7FF] active:opacity-90">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white"
          style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
          {playing ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </span>
        <span className="flex-1 text-left text-[13px] font-semibold text-[#5C3D9E]">试听我的声音</span>
        <span className="flex gap-0.5 items-end h-4">
          {[3, 5, 4, 6, 3].map((h, i) => (
            <span key={i} className="w-[3px] rounded-sm bg-[#C4B5E0]" style={{ height: h * 2 }} />
          ))}
        </span>
        <span className="text-[11px] text-[#B0A0C8] font-mono w-9 text-right">{durationLabel}</span>
      </button>

      <div className="flex gap-2">
        <Link
          href={cloneQuery(slot)}
          className="flex-1 h-10 rounded-full border border-[#E0D8F0] text-[13px] font-bold text-[#6B5B8C] flex items-center justify-center active:scale-[0.98]">
          重新录制
        </Link>
        <Link
          href="/stories"
          className="flex-[1.2] h-10 rounded-full text-[13px] font-bold text-white flex items-center justify-center active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
          用此声音讲故事
        </Link>
      </div>
    </div>
  )
}

function EmptyCard({ slot }: { slot: VoiceSlotId }) {
  const ui = SLOT_UI[slot]
  return (
    <div className="bg-white rounded-[16px] border border-[#F0E8FF] p-4 mb-3 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-[26px] flex-shrink-0 opacity-90"
          style={{ background: '#F5F0FF' }}>
          {ui.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-bold text-[#1A0A2E]">{ui.emptyTitle}</span>
            <span className="text-[10px] font-bold text-[#888] px-2 py-0.5 rounded-full bg-[#F0F0F0]">未录制</span>
          </div>
          <div className="text-[11px] text-[#B0A0C8] mt-1">{ui.emptyDesc}</div>
        </div>
      </div>
      <Link
        href={cloneQuery(slot)}
        className="w-full h-11 rounded-[14px] border-2 border-dashed border-[#D8C8E8] text-[13px] font-bold text-[#7B3FD4] flex items-center justify-center gap-1 active:bg-[#FAF7FF]">
        <span className="text-lg leading-none">+</span>
        {ui.recordLabel}
      </Link>
    </div>
  )
}

export default function MyVoicesPage() {
  const router = useRouter()
  const [slots, setSlots] = useState<VoiceSlotsState>(getVoiceSlotsServerSnapshot)

  const refresh = useCallback(() => setSlots(getVoiceSlots()), [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [refresh])

  const doneCount = countDoneSlots(slots)
  const order: VoiceSlotId[] = ['mom', 'dad', 'elder']

  return (
    <div className="phone-shell bg-[#FBF7FF] flex flex-col min-h-[844px] max-h-[min(844px,calc(100vh-48px))]">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">10:37</span>
        <span className="text-sm">📶🔋</span>
      </div>

      <div className="px-5 flex items-center flex-shrink-0 mb-2">
        <button
          type="button"
          onClick={() => router.push('/stories')}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(0,0,0,0.05)' }}>
          <svg className="w-5 h-5 text-[#1A0A2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <div className="text-[16px] font-bold text-[#1A0A2E]">我的声音</div>
          <div className="text-[11px] text-[#B0A0C8] mt-0.5">
            已克隆 {doneCount} / {VOICE_SLOT_TOTAL} 个音色
          </div>
        </div>
        <div className="w-9" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 px-5 pb-2">
          {order.map(id => {
            const s = slots[id]
            if (s.done) {
              return <DoneCard key={id} slot={id} meta={s} />
            }
            return <EmptyCard key={id} slot={id} />
          })}
        </div>

        <div className="flex-shrink-0 px-5 pb-5 pt-2">
          <div
            className="flex items-center gap-3 rounded-[14px] px-3.5 py-3.5"
            style={{
              background: 'linear-gradient(90deg, #EDE7F6 0%, #F8E8F0 45%, #FFF0F5 100%)',
              boxShadow: '0 2px 14px rgba(123, 63, 212, 0.1)',
            }}>
            <span className="text-[24px] flex-shrink-0 leading-none select-none" aria-hidden>
              🎙️
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-[#7B3FD4] leading-snug">
                已使用 {doneCount} / {VOICE_SLOT_TOTAL} 个音色额度
              </div>
              <div className="text-[11px] text-[#9B86B8] mt-1 leading-snug">
                会员可永久保存 {VOICE_SLOT_TOTAL} 个克隆音色
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
