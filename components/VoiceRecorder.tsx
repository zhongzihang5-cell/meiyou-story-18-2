'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  onComplete: (audioBase64: string, durationSec: number, format: string) => void
  disabled?: boolean
}

type RecordState = 'idle' | 'recording' | 'done' | 'error'

export default function VoiceRecorder({ onComplete, disabled }: Props) {
  const [state, setState] = useState<RecordState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [errMsg, setErrMsg] = useState('')
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => () => clearInterval(timerRef.current), [])

  const start = async () => {
    if (disabled) return
    setErrMsg('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const base64 = await blobToBase64(blob)
        onComplete(base64, elapsed, 'webm')
        setState('done')
      }
      mr.start()
      mediaRef.current = mr
      setState('recording')
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } catch (e) {
      setErrMsg('麦克风权限被拒绝，请在浏览器设置中允许访问麦克风')
      setState('error')
    }
  }

  const stop = () => {
    clearInterval(timerRef.current)
    mediaRef.current?.stop()
  }

  const reset = () => { setState('idle'); setElapsed(0) }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main button */}
      <div className="relative">
        {state === 'recording' && (
          <>
            <div className="absolute inset-0 rounded-full pulse-ring"
              style={{ background: 'rgba(233,30,99,0.2)' }} />
            <div className="absolute inset-0 rounded-full pulse-ring"
              style={{ background: 'rgba(233,30,99,0.12)', animationDelay: '0.5s' }} />
          </>
        )}
        <button
          onClick={state === 'recording' ? stop : start}
          disabled={disabled || state === 'done'}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center
            shadow-lg transition-all duration-200
            ${state === 'recording'
              ? 'bg-[#E91E63] scale-110'
              : state === 'done'
              ? 'bg-green-500'
              : 'bg-gradient-to-br from-[#7B3FD4] to-[#E91E63]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
          `}
        >
          {state === 'done' ? (
            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
            </svg>
          )}
        </button>
      </div>

      {/* State label */}
      <div className="text-center">
        {state === 'idle' && <p className="text-sm text-[#6B5B8C]">点击开始录制</p>}
        {state === 'recording' && (
          <p className="text-sm font-bold text-[#E91E63]">
            录制中… {fmt(elapsed)}
          </p>
        )}
        {state === 'done' && (
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-green-600">录制完成 · {fmt(elapsed)}</p>
            <button onClick={reset} className="text-xs text-[#7B3FD4] underline">重录</button>
          </div>
        )}
        {state === 'error' && <p className="text-xs text-red-500">{errMsg}</p>}
      </div>
    </div>
  )
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res((r.result as string).split(',')[1])
    r.onerror = rej
    r.readAsDataURL(blob)
  })
}
