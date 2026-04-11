'use client'

import { useRouter } from 'next/navigation'

const ORANGE = '#E87850'

const cardSurface = {
  background: 'rgba(255,255,255,0.06)' as const,
  border: '1px solid rgba(255,255,255,0.08)' as const,
  borderRadius: 12,
}

/** 与 qinsheng-react AboutScreen 同源 SVG，描边改暖橙 */
function FeatIcons({ which }: { which: 0 | 1 | 2 | 3 }) {
  switch (which) {
    case 0:
      return (
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M9 2C5.5 2 3 4.5 3 8c0 1.8.7 3.4 1.8 4.5L9 16l4.2-3.5C14.3 11.4 15 9.8 15 8c0-3.5-2.5-6-6-6z"
            stroke={ORANGE}
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      )
    case 1:
      return (
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="7" r="3.5" stroke={ORANGE} strokeWidth="1.2" fill="none" />
          <path d="M3 16s0-5 6-5 6 5 6 5" stroke={ORANGE} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      )
    case 2:
      return (
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M9 1.5l1.6 5H16l-4 3 1.5 4.7L9 11.5l-4.5 2.7 1.5-4.7-4-3h5.4z"
            stroke={ORANGE}
            strokeWidth="1.1"
            fill="none"
          />
        </svg>
      )
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="5.5" cy="7" r="2.5" stroke={ORANGE} strokeWidth="1.2" fill="none" />
          <circle cx="12.5" cy="7" r="2.5" stroke={ORANGE} strokeWidth="1.2" fill="none" />
          <path d="M1 15s0-3.5 4.5-3.5M13 11.5c4.5 0 4.5 3.5 4.5 3.5" stroke={ORANGE} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      )
  }
}

const FEATS: { title: string; desc: string; icon: 0 | 1 | 2 | 3 }[] = [
  { title: '不在身边\n声音还在', desc: '上班出差，宝宝听到的还是你', icon: 0 },
  { title: '克隆声音\n替你讲故事', desc: '同一个故事讲100遍，嗓子不用哑', icon: 1 },
  { title: '专属定制\n只属于她', desc: '宝宝喜欢的元素，AI生成专属故事', icon: 2 },
  { title: '亲友团\n一起听', desc: '爷爷奶奶每天收到宝宝的睡前故事', icon: 3 },
]

/**
 * 功能权益页：内容与结构对齐 qinsheng-react/src/screens/AboutScreen.tsx；
 * 视觉为深色壳 + 暖橙强调（与 /ai-stories 落地一致）。
 */
export default function AIStoriesBenefitsPage() {
  const router = useRouter()

  return (
    <div
      className="phone-shell relative flex flex-col overflow-hidden !bg-[#1A1228]"
      style={{ backgroundColor: '#1A1228' }}>
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-0"
        style={{
          height: '40%',
          maxHeight: '380px',
          background:
            'radial-gradient(ellipse 95% 88% at 50% 0%, rgba(61, 34, 96, 0.8) 0%, rgba(61, 34, 96, 0) 72%)',
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex h-12 flex-shrink-0 items-center justify-between px-7 pt-3">
          <span className="text-[15px] font-bold text-white/75">21:09</span>
          <span className="text-sm opacity-80">📶🔋</span>
        </div>

        <div className="relative flex h-12 flex-shrink-0 items-center justify-center px-4">
          <button
            type="button"
            onClick={() => router.push('/ai-stories')}
            className="absolute left-1 flex h-9 w-9 items-center justify-center active:opacity-60"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            aria-label="返回">
            <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-center text-[17px] font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            AI亲声讲
          </h1>
          <span className="absolute right-1 h-9 w-9 shrink-0" aria-hidden />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-40 pt-2">
          {/* 对应 AboutScreen 顶部 gradient-banner */}
          <div
            className="relative mb-5 overflow-hidden px-4 py-4"
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(61,34,96,0.5) 0%, rgba(232,120,80,0.2) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
            }}>
            <span className="text-[22px] leading-none" aria-hidden>
              ✨
            </span>
            <p className="mt-2 text-[20px] font-semibold text-white" style={{ letterSpacing: 0.3 }}>
              能做什么
            </p>
            <p className="mt-1.5 max-w-[280px] text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
              你的声音，能做五件事 —— 陪伴宝宝每一个安睡的夜晚 🌙
            </p>
          </div>

          <p
            className="mb-3 pl-1 text-[12px] font-semibold"
            style={{ color: ORANGE, letterSpacing: 2 }}>
            陪伴
          </p>

          <div className="mb-8 grid grid-cols-2 gap-3">
            {FEATS.map((f, i) => (
              <div
                key={i}
                style={{
                  ...cardSurface,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px]"
                  style={{
                    background: 'rgba(232,120,80,0.12)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                  <FeatIcons which={f.icon} />
                </div>
                <div>
                  <p className="mb-1.5 text-[14px] font-semibold leading-snug text-white">
                    {f.title.split('\n').map((line, j) => (
                      <span key={j}>
                        {line}
                        {j === 0 && <br />}
                      </span>
                    ))}
                  </p>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p
            className="mb-3 pl-1 text-[12px] font-semibold"
            style={{ color: ORANGE, letterSpacing: 2 }}>
            积累
          </p>

          <div
            style={{
              ...cardSurface,
              padding: 16,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              marginBottom: 24,
            }}>
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px]"
              style={{
                background: 'rgba(232,120,80,0.12)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
              <svg width="28" height="28" viewBox="0 0 22 22" fill="none" aria-hidden>
                <rect x="3" y="4" width="16" height="14" rx="3" stroke={ORANGE} strokeWidth="1.2" />
                <path d="M7 8h8M7 11h5" stroke={ORANGE} strokeWidth="1.1" strokeLinecap="round" />
                <circle cx="17" cy="17" r="3" fill="rgba(232,120,80,0.25)" stroke={ORANGE} strokeWidth="1" />
                <path d="M16 17h2M17 16v2" stroke={ORANGE} strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[16px] font-semibold text-white">声音册，越用越珍贵</p>
              <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                每个故事自动存档。
                <span style={{ color: ORANGE, fontWeight: 600 }}>三年后回听</span>
                ，这是你在她一岁时录下的声音。
              </p>
            </div>
          </div>
        </div>

        {/* 对应 AboutScreen 底部固定 CTA */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-20"
          style={{
            background: 'linear-gradient(to top, #1A1228 70%, transparent)',
            padding: '16px 20px 40px',
          }}>
          <button
            type="button"
            onClick={() => router.push('/voice-clone?skipRole=1&role=mom')}
            className="pointer-events-auto w-full border-0 font-semibold text-white"
            style={{
              borderRadius: 24,
              padding: '14px 32px',
              fontSize: 16,
              letterSpacing: 0.5,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #E87850, #C85080)',
              boxShadow: '0 8px 24px rgba(232, 120, 80, 0.35)',
            }}>
            开始录音
            <span className="mt-1.5 block text-[13px] font-normal" style={{ color: 'rgba(255,255,255,0.95)' }}>
              录一段，今晚就能用
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
