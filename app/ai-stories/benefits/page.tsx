'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { VOICE_CLONE_PERKS } from '@/lib/voiceClonePerks'
import { CloneDonePerkIcon, cloneDonePerkIconBg } from '@/components/voice-clone/CloneDonePerkIcon'

/** 星空点（固定布局，轻量不抢内容） */
const STAR_DOTS: { t: number; l: number; s: number; o: number }[] = [
  { t: 6, l: 12, s: 2, o: 0.35 },
  { t: 10, l: 78, s: 1.5, o: 0.45 },
  { t: 16, l: 44, s: 2, o: 0.22 },
  { t: 22, l: 22, s: 1, o: 0.5 },
  { t: 14, l: 58, s: 1, o: 0.28 },
  { t: 28, l: 88, s: 1.5, o: 0.32 },
  { t: 8, l: 36, s: 1, o: 0.25 },
]

/**
 * AI 亲声讲 · 权益说明：深色星空 + 与克隆完成页相同的四条卖点卡片（可选中）。
 */
export default function AIStoriesBenefitsPage() {
  const router = useRouter()
  const [picked, setPicked] = useState<Set<string>>(() => new Set())

  const toggle = useCallback((id: string) => {
    setPicked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div
      className="phone-shell relative flex flex-col overflow-hidden !bg-[#0f0a1a]"
      style={{ background: 'linear-gradient(180deg, #151028 0%, #0f0a1a 42%, #0c0814 100%)' }}>
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-[1] h-[45%] max-h-[360px]"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% -5%, rgba(88, 52, 140, 0.55) 0%, rgba(40, 24, 72, 0) 70%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        {STAR_DOTS.map((d, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: d.s,
              height: d.s,
              top: `${d.t}%`,
              left: `${d.l}%`,
              opacity: d.o,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex h-12 flex-shrink-0 items-center justify-between px-7 pt-3">
          <span className="text-[15px] font-bold text-white/75">21:09</span>
          <span className="text-sm opacity-80">📶🔋</span>
        </div>

        <div className="relative flex h-12 flex-shrink-0 items-center justify-center px-4">
          <button
            type="button"
            onClick={() => router.push('/ai-stories/home')}
            className="absolute left-1 flex h-9 w-9 items-center justify-center active:opacity-60"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            aria-label="返回">
            <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-center text-[17px] font-bold text-white/90">AI亲声讲</h1>
          <span className="absolute right-1 h-9 w-9 shrink-0" aria-hidden />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-36 pt-2 no-scrollbar">
          <div className="flex w-full flex-col items-stretch pt-2">
            <div className="mb-4 flex flex-col gap-3">
              {VOICE_CLONE_PERKS.map(p => {
                const sel = picked.has(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(p.id)}
                    aria-pressed={sel}
                    className={`flex w-full items-center gap-3.5 rounded-[16px] border bg-white p-4 text-left shadow-[0_2px_12px_rgba(123,63,212,0.06)] transition-all duration-200 active:scale-[0.99] ${
                      sel
                        ? 'border-[#7B3FD4] ring-2 ring-[#7B3FD4]/35'
                        : 'border-[#F0E8FF]'
                    }`}>
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] border border-[#F0E8FF] ${cloneDonePerkIconBg(p.colorClass)}`}>
                      <CloneDonePerkIcon colorClass={p.colorClass} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1.5 text-[15px] font-bold leading-snug text-[#1A0A2E]">{p.title}</p>
                      <p className="text-[13px] leading-relaxed text-[#6B5B8C]">{p.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 px-5 pb-10 pt-4"
          style={{
            background: 'linear-gradient(to top, #0c0814 75%, transparent)',
          }}>
          <button
            type="button"
            onClick={() => router.push('/voice-clone?skipRole=1&role=mom')}
            className="pointer-events-auto w-full border-0 font-bold text-white"
            style={{
              borderRadius: 26,
              padding: '15px 24px',
              fontSize: 15,
              letterSpacing: 0.3,
              cursor: 'pointer',
              display: 'block',
              background: 'linear-gradient(135deg, #A855F7 0%, #D946EF 48%, #EC4899 100%)',
              boxShadow: '0 10px 32px rgba(168, 85, 247, 0.42), 0 0 0 1px rgba(255,255,255,0.08)',
            }}>
            开始录音，今晚就能用
          </button>
        </div>
      </div>
    </div>
  )
}
