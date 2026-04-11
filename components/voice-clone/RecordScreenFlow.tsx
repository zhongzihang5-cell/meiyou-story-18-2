'use client'

/**
 * 录制流：进度条、对话流、按住录音；每段录完只追加一条系统说明。
 * 视觉与真实录音逻辑对齐美柚 voice-clone（浅色紫粉 + MediaRecorder）。
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { QinshengMicVisual } from '@/components/ai-stories/QinshengMicVisual'

/** 与 qinsheng RECORD_LINES 一致 + 首段哄睡提示 */
export const VOICE_RECORD_INTRO_SYS =
  '宝宝快要睡觉了吗？\n\n先录一段你平时哄他睡觉的声音——嘘嘘声、哼唱都可以。宝宝<em>今晚就能听到你</em>。'

export const VOICE_RECORD_AFTER_HUSH_SYS =
  '很好！声音录下来了，宝宝今晚就可以听到 🌙\n\n现在来读几句话，让AI<em>记住你声音的样子</em>。'

export const VOICE_RECORD_HUSH_HINT = '（录一段嘘嘘声或哼唱）'

export const VOICE_RECORD_SCRIPT: string[] = [
  '嘘——宝宝乖，妈妈在呢，\n闭上眼睛睡觉觉……',
  '月亮出来了，星星也出来了，\n宝宝闭上眼睛，做个好梦吧。',
  '从前有一只小兔子，住在森林里的一棵大树下，\n每天晚上它都会数着星星入睡。',
  '宝宝最勇敢了，今天辛苦啦，\n快快闭上眼睛，明天又是新的一天。',
  '小鸟回巢了，小鱼回家了，\n小宝贝也要睡觉觉，做个甜甜的梦。',
]

export const VOICE_RECORD_TOTAL_SEGMENTS = 1 + VOICE_RECORD_SCRIPT.length

/** 朗读卡「第 N 句」条与正文区底色区分；按句序轮换 */
const READ_CARD_THEMES = [
  { labelBg: '#EDE9FE', labelText: '#5B21B6', scriptBg: '#FAF7FF', scriptText: '#1A0A2E' },
  { labelBg: '#DBEAFE', labelText: '#1D4ED8', scriptBg: '#F0F9FF', scriptText: '#1A0A2E' },
  { labelBg: '#FCE7F3', labelText: '#9D174D', scriptBg: '#FFF7FB', scriptText: '#1A0A2E' },
] as const

type ChatItem = { type: 'sys'; text: string } | { type: 'user'; segmentIndex: number }

const REPLY_THEN_CARD_MS = 480
const CARD_AFTER_REPLY_MS = 720

function pickRecorderMime(): string | undefined {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  for (const t of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) return t
  }
  return undefined
}

/** 文案为内置常量，仅替换换行与 <em>（与 qinsheng RecordScreen 一致） */
function SysMessageBody({ text }: { text: string }) {
  const html = text
    .replace(/\n/g, '<br/>')
    .replace(/<em>/g, '<span style="color:#7B3FD4;font-style:normal;font-weight:600">')
    .replace(/<\/em>/g, '</span>')
  return (
    <p
      className="text-[14px] font-normal leading-[1.8] text-[#1A0A2E]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

const WAVE_BAR_HEIGHTS = [4, 12, 16, 8, 14, 6, 10]

export default function RecordScreenFlow({
  roleLabel,
  onComplete,
}: {
  roleLabel: string
  onComplete: (previewObjectUrl: string | null) => void
}) {
  const totalLines = VOICE_RECORD_TOTAL_SEGMENTS
  const [currentLine, setCurrentLine] = useState(0)
  const [chat, setChat] = useState<ChatItem[]>([{ type: 'sys', text: VOICE_RECORD_INTRO_SYS }])
  const [recordedBlobs, setRecordedBlobs] = useState<Record<number, string>>({})
  const [recordingLine, setRecordingLine] = useState<number | null>(null)
  const [audioLevels, setAudioLevels] = useState<number[]>(() => Array.from({ length: 13 }, () => 4))

  const chatRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animFrameRef = useRef<number | null>(null)
  const recordedBlobsRef = useRef(recordedBlobs)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mountedRef = useRef(true)
  const recordingLineRef = useRef<number | null>(null)
  const pressCleanupRef = useRef<(() => void) | null>(null)
  const stopWhenReadyAfterStartRef = useRef(false)
  const recordStartLockRef = useRef(false)
  const pendingFinishRef = useRef<number | null>(null)
  const stagedTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearStagedTimers = useCallback(() => {
    stagedTimersRef.current.forEach(id => clearTimeout(id))
    stagedTimersRef.current = []
  }, [])

  recordedBlobsRef.current = recordedBlobs
  recordingLineRef.current = recordingLine

  const scrollChat = useCallback(() => {
    setTimeout(() => {
      const el = chatRef.current
      if (el) el.scrollTop = el.scrollHeight
    }, 50)
  }, [])

  const clearPressCleanup = useCallback(() => {
    pressCleanupRef.current?.()
    pressCleanupRef.current = null
  }, [])

  const stopAnalyserLoop = useCallback(() => {
    if (animFrameRef.current != null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }, [])

  const teardownAudioGraph = useCallback(() => {
    stopAnalyserLoop()
    analyserRef.current = null
    const ctx = audioContextRef.current
    audioContextRef.current = null
    if (ctx && ctx.state !== 'closed') {
      ctx.close().catch(() => {})
    }
  }, [stopAnalyserLoop])

  const stopRecording = useCallback(() => {
    clearPressCleanup()
    stopWhenReadyAfterStartRef.current = false
    const mr = mediaRecorderRef.current
    if (mr && mr.state !== 'inactive') mr.stop()
  }, [clearPressCleanup])

  const mergeAndComplete = useCallback(async () => {
    const blobParts: Blob[] = []
    try {
      for (let i = 0; i < totalLines; i++) {
        const u = recordedBlobsRef.current[i]
        if (u) blobParts.push(await fetch(u).then(r => r.blob()))
      }
    } catch {
      onComplete(null)
      return
    }
    if (blobParts.length === 0) {
      onComplete(null)
      return
    }
    const merged = new Blob(blobParts, { type: blobParts[0].type || 'audio/webm' })
    onComplete(URL.createObjectURL(merged))
  }, [onComplete, totalLines])

  const startRecording = async (lineIndex: number) => {
    if (recordingLineRef.current !== null || recordStartLockRef.current) return
    recordStartLockRef.current = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (stopWhenReadyAfterStartRef.current) {
        stream.getTracks().forEach(t => t.stop())
        stopWhenReadyAfterStartRef.current = false
        clearPressCleanup()
        return
      }
      streamRef.current = stream

      const ctx = new AudioContext()
      audioContextRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 32
      source.connect(analyser)
      analyserRef.current = analyser

      const animate = () => {
        const a = analyserRef.current
        if (!a) return
        const data = new Uint8Array(a.frequencyBinCount)
        a.getByteFrequencyData(data)
        setAudioLevels(Array.from(data).slice(0, 13).map(v => Math.max(4, v / 6)))
        animFrameRef.current = requestAnimationFrame(animate)
      }
      animate()

      if (stopWhenReadyAfterStartRef.current) {
        stream.getTracks().forEach(t => t.stop())
        teardownAudioGraph()
        stopWhenReadyAfterStartRef.current = false
        clearPressCleanup()
        return
      }

      chunksRef.current = []
      const mime = pickRecorderMime()
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      mr.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
        teardownAudioGraph()
        setAudioLevels(Array.from({ length: 13 }, () => 4))
        const type = chunksRef.current[0]?.type || mr.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        const url = URL.createObjectURL(blob)
        const idx = pendingFinishRef.current
        pendingFinishRef.current = null
        if (!mountedRef.current) {
          URL.revokeObjectURL(url)
          mediaRecorderRef.current = null
          setRecordingLine(null)
          return
        }
        if (idx !== null) {
          clearStagedTimers()
          setRecordedBlobs(prev => ({ ...prev, [idx]: url }))
          const nextLine = idx + 1
          const sysText =
            nextLine < totalLines
              ? nextLine === 1
                ? `哄睡声录好啦～\n\n${VOICE_RECORD_AFTER_HUSH_SYS}`
                : '很好，继续读下一句'
              : null

          // 1) 先出现「已录制」
          setChat(prev => [...prev, { type: 'user', segmentIndex: idx }])
          scrollChat()

          // 2) 再出现系统回复
          if (sysText) {
            const tReply = setTimeout(() => {
              if (!mountedRef.current) return
              setChat(prev => [...prev, { type: 'sys', text: sysText }])
              scrollChat()
            }, REPLY_THEN_CARD_MS)
            stagedTimersRef.current.push(tReply)
          }

          // 3) 再切换底部朗读句 / 或全部完成
          const tCard = setTimeout(
            () => {
              if (!mountedRef.current) return
              clearStagedTimers()
              if (nextLine >= totalLines) {
                setTimeout(() => void mergeAndComplete(), 800)
              } else {
                setCurrentLine(nextLine)
              }
            },
            sysText ? REPLY_THEN_CARD_MS + CARD_AFTER_REPLY_MS : REPLY_THEN_CARD_MS
          )
          stagedTimersRef.current.push(tCard)
        } else {
          URL.revokeObjectURL(url)
        }
        setRecordingLine(null)
        mediaRecorderRef.current = null
      }
      mr.start()
      mediaRecorderRef.current = mr
      pendingFinishRef.current = lineIndex
      setRecordingLine(lineIndex)
      if (stopWhenReadyAfterStartRef.current) {
        stopWhenReadyAfterStartRef.current = false
        stopRecording()
      }
    } catch {
      clearPressCleanup()
      stopWhenReadyAfterStartRef.current = false
      setRecordingLine(null)
      alert('请允许麦克风权限后再录制')
    } finally {
      recordStartLockRef.current = false
    }
  }

  const handleMicPressStart = (lineIndex: number) => {
    if (recordingLineRef.current !== null || recordStartLockRef.current) return
    clearPressCleanup()
    stopWhenReadyAfterStartRef.current = false
    const onRelease = () => {
      clearPressCleanup()
      if (mediaRecorderRef.current?.state === 'recording') {
        stopRecording()
      } else {
        stopWhenReadyAfterStartRef.current = true
      }
    }
    window.addEventListener('pointerup', onRelease)
    window.addEventListener('pointercancel', onRelease)
    pressCleanupRef.current = () => {
      window.removeEventListener('pointerup', onRelease)
      window.removeEventListener('pointercancel', onRelease)
    }
    void startRecording(lineIndex)
  }

  const handleRerecord = useCallback(
    (segmentIndex: number) => {
      clearStagedTimers()
      setRecordedBlobs(prev => {
        const next = { ...prev }
        for (let k = segmentIndex; k < totalLines; k++) {
          const u = next[k]
          if (u) URL.revokeObjectURL(u)
          delete next[k]
        }
        return next
      })
      setChat(prev => {
        const cut = prev.findIndex(m => m.type === 'user' && m.segmentIndex === segmentIndex)
        if (cut === -1) return prev
        return prev.slice(0, cut)
      })
      setCurrentLine(segmentIndex)
      scrollChat()
    },
    [clearStagedTimers, scrollChat, totalLines]
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearStagedTimers()
      clearPressCleanup()
      stopAnalyserLoop()
      teardownAudioGraph()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop()
        } catch {
          /* ignore */
        }
      }
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      mediaRecorderRef.current = null
      Object.values(recordedBlobsRef.current).forEach(u => URL.revokeObjectURL(u))
    }
  }, [clearPressCleanup, clearStagedTimers, stopAnalyserLoop, teardownAudioGraph])

  const maxRecordedSegment = (() => {
    const keys = Object.keys(recordedBlobs).map(Number)
    return keys.length ? Math.max(...keys) : -1
  })()
  /** 进度条：已存盘的段为 done；当前进行段在「下一句」出现前也可视为下一格 active */
  const progressActiveIndex =
    recordingLine !== null ? recordingLine : Math.min(Math.max(currentLine, maxRecordedSegment + 1), totalLines - 1)
  const progressSteps = Array.from({ length: totalLines }, (_, i) => {
    if (i < progressActiveIndex) return 'done'
    if (i === progressActiveIndex) return 'active'
    return 'empty'
  })

  /** 首段为哄睡；之后每段文案前加「第 N 句」（第一段正文为第 2 句） */
  const displayLines =
    currentLine === 0
      ? [VOICE_RECORD_HUSH_HINT]
      : [`第 ${currentLine + 1} 句`, VOICE_RECORD_SCRIPT[currentLine - 1] ?? '']

  const isRecording = recordingLine === currentLine && recordingLine !== null
  const waveHeights = [7, 13, 22, 31, 25, 37, 29, 35, 27, 33, 21, 15, 8]
  const readCardTheme =
    currentLine > 0 ? READ_CARD_THEMES[(currentLine - 1) % READ_CARD_THEMES.length] : null

  return (
    <div className="flex min-h-full flex-col">
      <p className="mb-3 text-center text-[12px] text-[#B0A0C8]">{roleLabel} · 跟着提示轻声录制</p>

      <div className="mb-3 flex flex-shrink-0 items-center gap-2">
        {progressSteps.map((s, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full transition-colors duration-300"
            style={{
              background: s === 'done' ? '#7B3FD4' : s === 'active' ? '#E91E63' : '#E8DCFF',
            }}
          />
        ))}
        <span className="ml-1 shrink-0 text-[12px] font-medium text-[#B0A0C8]">
          {progressActiveIndex + 1} / {totalLines}
        </span>
      </div>

      <div
        ref={chatRef}
        className="no-scrollbar mb-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
        style={{ maxHeight: 'min(320px, 42vh)' }}>
        {chat.map((item, i) => {
          if (item.type === 'sys') {
            return (
              <div key={i} className="max-w-[90%] self-start">
                <div
                  className="rounded-[16px] rounded-bl-[8px] border border-[#F0E8FF] bg-white p-3.5 shadow-[0_2px_12px_rgba(123,63,212,0.08)]">
                  <SysMessageBody text={item.text} />
                </div>
              </div>
            )
          }
          if (item.type === 'user') {
            return (
              <div key={i} className="max-w-[85%] self-end">
                <div className="flex flex-col items-end gap-1.5">
                  <div
                    className="flex items-center gap-2.5 rounded-[16px] rounded-br-[8px] border border-[#F8BBD0] bg-[#FFF5F8] px-3 py-2.5 shadow-[0_2px_12px_rgba(233,30,99,0.06)]">
                    <div className="flex h-5 items-end gap-0.5">
                      {WAVE_BAR_HEIGHTS.map((h, j) => (
                        <div
                          key={j}
                          className="voice-record-wave-bar w-[3px] rounded-full bg-[#E91E63]"
                          style={{ height: h, transformOrigin: 'bottom', animationDelay: `${j * 0.09}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-[13px] font-semibold text-[#E91E63]">已录制</span>
                  </div>
                  <button
                    type="button"
                    disabled={recordingLine !== null}
                    onClick={() => handleRerecord(item.segmentIndex)}
                    className="rounded-full px-2 py-0.5 text-[12px] font-medium text-[#9CA3AF] underline decoration-[#D1D5DB] underline-offset-2 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline">
                    重录
                  </button>
                </div>
              </div>
            )
          }
          return null
        })}
      </div>

      <div className="mb-4 flex-shrink-0 overflow-hidden rounded-[16px] border border-[#E4D8F4] text-center shadow-[0_2px_12px_rgba(123,63,212,0.06)]">
        {currentLine === 0 ? (
          <div className="bg-[#EDE9FE] px-3.5 py-3.5">
            <p className="text-[14px] font-normal leading-[1.8] text-[#5B4A7A]">
              {displayLines[0].split('\n').map((l, j, arr) => (
                <span key={j}>
                  {l}
                  {j < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        ) : (
          readCardTheme && (
            <>
              <div
                className="px-3 py-2.5 text-[14px] font-semibold leading-snug"
                style={{ background: readCardTheme.labelBg, color: readCardTheme.labelText }}>
                {displayLines[0]}
              </div>
              <div
                className="px-3.5 py-3 text-[14px] font-semibold leading-[1.8]"
                style={{ background: readCardTheme.scriptBg, color: readCardTheme.scriptText }}>
                {displayLines[1].split('\n').map((l, j, arr) => (
                  <span key={j}>
                    {l}
                    {j < arr.length - 1 && <br />}
                  </span>
                ))}
              </div>
            </>
          )
        )}
      </div>

      {isRecording && (
        <div className="mb-3 flex h-9 items-center justify-center gap-1">
          {waveHeights.map((h, j) => (
            <div
              key={j}
              className="w-[3px] rounded-sm transition-[height]"
              style={{
                height: Math.min(audioLevels[j] ?? h, 36),
                background: j < 3 || j > 9 ? '#F48FB1' : '#E91E63',
              }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-shrink-0 flex-col items-center pb-6 pt-1">
        <button
          type="button"
          className={`touch-none select-none border-0 bg-transparent p-0 transition-transform active:scale-[0.97] ${isRecording ? 'scale-[1.02]' : ''}`}
          onPointerDown={e => {
            e.preventDefault()
            if (recordingLine !== null) return
            handleMicPressStart(currentLine)
          }}
          onKeyDown={e => {
            if (e.key !== ' ' && e.key !== 'Enter') return
            e.preventDefault()
            if (e.repeat || recordingLine !== null) return
            handleMicPressStart(currentLine)
          }}
          aria-label="按住录音">
          <QinshengMicVisual pressing={isRecording} />
        </button>
        <p className="mt-2 text-[12px] text-[#B0A0C8]">按住录音</p>
      </div>
    </div>
  )
}
