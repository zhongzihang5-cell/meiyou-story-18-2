'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { NightSkyDecor } from '@/components/ai-stories/NightSkyDecor'
import { QinshengMicVisual } from '@/components/ai-stories/QinshengMicVisual'

const WAVE_N = 27
const WAVE_BASELINE = 36
const WAVE_VIEW_W = 280
const WAVE_VIEW_H = 78

function buildWaveBars() {
  const center = (WAVE_N - 1) / 2
  return Array.from({ length: WAVE_N }, (_, i) => {
    const d = Math.abs(i - center) / center
    const f = Math.max(0, 1 - d * d)
    const x = 16 + (i * (WAVE_VIEW_W - 32)) / (WAVE_N - 1)
    const w = 1.4 + f * 3.4
    const h = 7 + f * 30
    return { x, w, h, f }
  })
}

/** 中间 #E87850，两侧 rgba(232,120,80,0.15) */
function waveBarFill(f: number) {
  const a = 0.15 + f * 0.85
  return `rgba(232,120,80,${a})`
}

const WAVE_BARS = buildWaveBars()

function waveBarMinH(b: (typeof WAVE_BARS)[0]) {
  return Math.max(2.5, b.h * 0.16)
}

function waveBarMidH(b: (typeof WAVE_BARS)[0]) {
  const lo = waveBarMinH(b)
  return lo + 0.5 * (b.h - lo)
}

/** 声波：中间粗亮、两侧渐隐 + 镜像；每根条独立随机起伏（均衡器式），非整列同步 */
function SoundWaveBanner() {
  const mainRefs = useRef<(SVGRectElement | null)[]>([])
  const reflRefs = useRef<(SVGRectElement | null)[]>([])

  useEffect(() => {
    const applyGeometry = (i: number, h: number) => {
      const y = String(WAVE_BASELINE - h)
      const hs = String(h)
      const m = mainRefs.current[i]
      const r = reflRefs.current[i]
      if (m) {
        m.setAttribute('height', hs)
        m.setAttribute('y', y)
      }
      if (r) {
        r.setAttribute('height', hs)
        r.setAttribute('y', y)
      }
    }

    const reduce =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      WAVE_BARS.forEach((b, i) => applyGeometry(i, waveBarMidH(b)))
      return
    }

    const states = WAVE_BARS.map(() => ({
      level: 0.2 + Math.random() * 0.6,
      target: 0.15 + Math.random() * 0.75,
      speed: 0.05 + Math.random() * 0.09,
    }))

    let raf = 0
    const step = () => {
      WAVE_BARS.forEach((b, i) => {
        const s = states[i]
        if (Math.random() < 0.06) {
          s.target = 0.08 + Math.random() * 0.9
          s.speed = 0.04 + Math.random() * 0.11
        }
        s.level += (s.target - s.level) * s.speed
        s.level += (Math.random() - 0.5) * 0.028
        s.level = Math.max(0.06, Math.min(1, s.level))
        const lo = waveBarMinH(b)
        const h = lo + s.level * (b.h - lo)
        applyGeometry(i, h)
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg
      width={WAVE_VIEW_W}
      height={WAVE_VIEW_H}
      viewBox={`0 0 ${WAVE_VIEW_W} ${WAVE_VIEW_H}`}
      className="mx-auto block shrink-0"
      aria-hidden>
      <defs>
        <linearGradient id="qinshengWaveHFade" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="38%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#fff" stopOpacity="1" />
          <stop offset="62%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="qinshengWaveHFadeMask">
          <rect x="0" y="0" width={WAVE_VIEW_W} height={WAVE_VIEW_H} fill="url(#qinshengWaveHFade)" />
        </mask>
        <linearGradient id="qinshengWaveReflVFade" x1="0" y1="36" x2="0" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="qinshengWaveReflMask">
          <rect x="0" y="34" width={WAVE_VIEW_W} height="44" fill="url(#qinshengWaveReflVFade)" />
        </mask>
      </defs>
      <g mask="url(#qinshengWaveHFadeMask)">
        <g>
          {WAVE_BARS.map((b, i) => {
            const h0 = waveBarMidH(b)
            return (
              <rect
                key={`w-${i}`}
                ref={(el) => {
                  mainRefs.current[i] = el
                }}
                x={b.x - b.w / 2}
                y={WAVE_BASELINE - h0}
                width={b.w}
                height={h0}
                rx={b.w / 2}
                fill={waveBarFill(b.f)}
              />
            )
          })}
        </g>
        <g
          transform={`translate(0,${WAVE_BASELINE * 2}) scale(1,-1)`}
          opacity={0.28}
          mask="url(#qinshengWaveReflMask)">
          {WAVE_BARS.map((b, i) => {
            const h0 = waveBarMidH(b)
            return (
              <rect
                key={`wr-${i}`}
                ref={(el) => {
                  reflRefs.current[i] = el
                }}
                x={b.x - b.w / 2}
                y={WAVE_BASELINE - h0}
                width={b.w}
                height={h0}
                rx={b.w / 2}
                fill={waveBarFill(b.f)}
              />
            )
          })}
        </g>
      </g>
    </svg>
  )
}

/**
 * AI亲声讲落地页 · 分层紫靛渐变 + 底部暖光点缀，与 benefits 品牌色一致
 */
export default function AIQinShengLandingPage() {
  const router = useRouter()

  return (
    <div
      className="phone-shell relative flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#0c0814',
        backgroundImage: [
          // 顶：淡紫粉极光（与 benefits / 品牌渐变呼应）
          'radial-gradient(ellipse 110% 60% at 50% -12%, rgba(168, 85, 247, 0.38) 0%, transparent 56%)',
          // 右上：冷靛蓝，打破单调
          'radial-gradient(ellipse 70% 50% at 100% 18%, rgba(99, 102, 241, 0.18) 0%, transparent 55%)',
          // 底部：亲声讲声波暖色弱光，引导视线到麦克风区
          'radial-gradient(ellipse 95% 42% at 50% 108%, rgba(232, 120, 80, 0.16) 0%, transparent 52%)',
          // 主身：斜向深紫 → 墨蓝 → 近黑，避免一片纯黑
          'linear-gradient(168deg, #2a1f3e 0%, #1f1730 22%, #161022 48%, #0f0a18 74%, #08060e 100%)',
        ].join(', '),
      }}>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex h-10 flex-shrink-0 items-center justify-between px-7 pt-1.5">
          <span className="text-[15px] font-bold text-white/75">21:09</span>
          <span className="text-sm opacity-80">📶🔋</span>
        </div>

        <div className="relative flex h-10 flex-shrink-0 items-center justify-center px-4">
          <button
            type="button"
            onClick={() => router.push('/')}
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

        {/* 375×812 画布内：flex 分区，避免纵向堆叠留白 */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative h-[68px] shrink-0 overflow-hidden">
            <NightSkyDecor />
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0 px-5 py-1">
            <div className="origin-center scale-[0.82]">
              <SoundWaveBanner />
            </div>
            <p className="max-w-[300px] pt-2 text-center text-[21px] leading-snug text-white" style={{ fontWeight: 600 }}>
              你的声音是柚柚最熟悉的爱
            </p>
            <p
              className="mt-2 max-w-[300px] text-center text-[13px] leading-relaxed"
              style={{ fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>
              录下你的声音，今晚AI帮你给柚柚讲故事
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center pb-6 pt-1">
            <button
              type="button"
              onClick={() => router.push('/voice-clone?skipRole=1&role=mom')}
              className="border-0 bg-transparent p-0 transition-transform active:scale-[0.97]"
              aria-label="按住录音">
              <QinshengMicVisual />
            </button>
            <p className="mt-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              按住录音
            </p>
            <button
              type="button"
              onClick={() => router.push('/ai-stories/benefits')}
              className="mt-3 border-0 bg-transparent p-0 text-[12px] leading-normal underline decoration-[rgba(255,255,255,0.2)] underline-offset-[4px] active:opacity-70"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              了解功能权益
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
