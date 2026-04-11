'use client'

import { useId } from 'react'

/** AI 亲声讲 · 星空 + 月牙（与落地页一致；mask id 用 useId 避免多实例冲突） */
export function NightSkyDecor() {
  const id = useId().replace(/:/g, '')
  const maskId = `nightCrescent-${id}`

  const stars = [
    { cx: 48, cy: 56, r: 1.2, o: 0.45 },
    { cx: 92, cy: 38, r: 1.8, o: 0.75 },
    { cx: 140, cy: 72, r: 1, o: 0.5 },
    { cx: 188, cy: 48, r: 2.2, o: 0.88 },
    { cx: 228, cy: 96, r: 1.3, o: 0.42 },
    { cx: 268, cy: 36, r: 1.6, o: 0.65 },
    { cx: 312, cy: 78, r: 1, o: 0.55 },
    { cx: 72, cy: 118, r: 1.4, o: 0.42 },
    { cx: 156, cy: 132, r: 1.1, o: 0.68 },
    { cx: 260, cy: 112, r: 1.7, o: 0.48 },
  ]
  const mx = 318
  const my = 48
  const mr = 17
  const biteR = 15
  const biteCx = mx + 10
  const biteCy = my - 4

  const sx = 393 / 390

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      viewBox="0 0 393 320"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden>
      <g transform={`scale(${sx}, 1)`}>
        <defs>
          <mask id={maskId}>
            <circle cx={mx} cy={my} r={mr} fill="white" />
            <circle cx={biteCx} cy={biteCy} r={biteR} fill="black" />
          </mask>
        </defs>
        {stars.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#FFFFFF" opacity={s.o} />
        ))}
        <circle cx={mx} cy={my} r={mr} fill="#FFF5D6" mask={`url(#${maskId})`} opacity={0.98} />
      </g>
    </svg>
  )
}
