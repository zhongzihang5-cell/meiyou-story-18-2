'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  audioUrl: string | null
  durationSec: number
}

export default function AudioPlayer({ audioUrl, durationSec }: Props) {
  const [playing, setPlaying] = useState(false)
  const [currentSec, setCurrentSec] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  // Mock playback (no real audio yet)
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCurrentSec(s => {
          if (s >= durationSec) { setPlaying(false); return 0 }
          return s + 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, durationSec])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
  const pct = durationSec > 0 ? (currentSec / durationSec) * 100 : 0

  const toggle = () => {
    if (audioUrl && audioRef.current) {
      playing ? audioRef.current.pause() : audioRef.current.play()
    }
    setPlaying(p => !p)
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    setCurrentSec(Math.floor(ratio * durationSec))
  }

  return (
    <div className="w-full">
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}

      {/* Progress bar */}
      <div className="px-7 mb-2">
        <div
          className="h-1.5 bg-[#F0E8FF] rounded-full relative cursor-pointer"
          onClick={seek}
        >
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg,#F06292,#9C6FD6)'
            }}
          />
          <div
            className="w-4 h-4 bg-white rounded-full absolute top-1/2 -translate-y-1/2 shadow-md border-2 border-purple-400"
            style={{ left: `${pct}%`, transform: `translateX(-50%) translateY(-50%)` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/50">
          <span>{fmt(currentSec)}</span>
          <span>{fmt(durationSec)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-7 mb-6">
        <button className="p-1 opacity-70">
          <svg className="w-7 h-7 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
        </button>
        <button className="p-1 opacity-70">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="3" height="16"/>
          </svg>
        </button>
        <button
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl"
          onClick={toggle}
        >
          {playing ? (
            <svg className="w-7 h-7 text-[#7B3FD4]" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg className="w-7 h-7 text-[#7B3FD4] ml-1" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>
        <button className="p-1 opacity-70">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,4 15,12 5,20"/><rect x="16" y="4" width="3" height="16"/>
          </svg>
        </button>
        <button className="p-1 opacity-70">
          <svg className="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/>
            <circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
