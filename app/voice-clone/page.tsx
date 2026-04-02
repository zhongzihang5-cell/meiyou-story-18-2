'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'role' | 'prepare' | 'record' | 'processing' | 'done'
type Role =
  | 'mom'
  | 'dad'
  | 'grandma'
  | 'grandpa'
  | 'waipo'
  | 'waigong'
  | 'nainai'
  | 'yeye'
  | 'yiyi'
  | 'other'
  | null

const MAIN_ROLES = [
  { id: 'mom' as const, label: '妈妈', emoji: '👩' },
  { id: 'dad' as const, label: '爸爸', emoji: '👨' },
]

const OTHER_ROLE = { id: 'other' as const, label: '其他角色', emoji: '✨' }

/** 其他家人：两行四列，最后一格为「+ 其他角色」 */
const FAMILY_GRID_ROLES: { id: Exclude<Role, 'mom' | 'dad' | 'other' | null>; label: string; emoji: string; circleBg: string }[] = [
  { id: 'waipo', label: '姥姥', emoji: '👵', circleBg: '#FCE4EC' },
  { id: 'waigong', label: '姥爷', emoji: '👴', circleBg: '#E8F5E9' },
  { id: 'nainai', label: '奶奶', emoji: '👵', circleBg: '#FFF9C4' },
  { id: 'yeye', label: '爷爷', emoji: '👴', circleBg: '#E3F2FD' },
  { id: 'grandma', label: '外婆', emoji: '👵', circleBg: '#F3E5F5' },
  { id: 'grandpa', label: '外公', emoji: '👴', circleBg: '#E0F7FA' },
  { id: 'yiyi', label: '姨姨', emoji: '👩', circleBg: '#FFE0B2' },
]

const ALL_ROLES = [...MAIN_ROLES, OTHER_ROLE, ...FAMILY_GRID_ROLES]

const SENTENCES = [
  '小宝贝，今天妈妈给你讲一个温暖的故事。',
  '在一片美丽的森林里，住着一只可爱的小兔子。',
  '小兔子有一双长长的耳朵，走到哪里都很开心。',
  '每天早上，它都会去草地上采摘新鲜的蔬菜。',
  '有一天，小兔子遇到了一只迷路的小鸟。',
  '小兔子说：别担心，我帮你找到回家的路。',
  '它们一起走啊走，终于找到了小鸟的家。',
  '小鸟的妈妈非常感谢小兔子，送给它一束花。',
  '小兔子开心地说：帮助朋友，是最快乐的事。',
  '宝宝，要像小兔子一样善良，好不好？',
]

const IS_MEMBER = false

function pickRecorderMime(): string | undefined {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  for (const t of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) return t
  }
  return undefined
}

function RecordStep({
  sentences,
  roleLabel,
  onComplete,
}: {
  sentences: string[]
  roleLabel: string
  /** 传入合并后的本地试听 blob URL（与录制页 revoke 无关，由父组件释放） */
  onComplete: (previewObjectUrl: string | null) => void
}) {
  const [recordedBlobs, setRecordedBlobs] = useState<Record<number, string>>({})
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  /** 当前进度句下标：该句待录或刚录完待点「下一句」 */
  const [recordedCount, setRecordedCount] = useState(0)
  const [audioLevels, setAudioLevels] = useState<number[]>(() => Array.from({ length: 13 }, () => 4))
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animFrameRef = useRef<number | null>(null)
  const audioRefs = useRef<Record<number, HTMLAudioElement>>({})
  const recordedBlobsRef = useRef(recordedBlobs)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mountedRef = useRef(true)
  const recordingIndexRef = useRef<number | null>(null)
  const sentenceCardRefs = useRef<(HTMLDivElement | null)[]>([])

  recordedBlobsRef.current = recordedBlobs
  recordingIndexRef.current = recordingIndex

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

  const allDone = sentences.length > 0 && sentences.every((_, i) => !!recordedBlobs[i])
  const subtitleSentenceNum = recordingIndex !== null ? recordingIndex + 1 : recordedCount + 1

  useEffect(() => {
    if (recordingIndex === null) return
    const el = sentenceCardRefs.current[recordingIndex]
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [recordingIndex])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
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
      Object.values(audioRefs.current).forEach(a => {
        try {
          a.pause()
          a.src = ''
        } catch {
          /* ignore */
        }
      })
      audioRefs.current = {}
      Object.values(recordedBlobsRef.current).forEach(url => URL.revokeObjectURL(url))
    }
  }, [stopAnalyserLoop, teardownAudioGraph])

  const startRecording = async (index: number) => {
    if (recordingIndexRef.current !== null) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
        const idx = recordingIndexRef.current
        if (!mountedRef.current) {
          URL.revokeObjectURL(url)
          mediaRecorderRef.current = null
          return
        }
        if (idx !== null) {
          setRecordedBlobs(prev => ({ ...prev, [idx]: url }))
          setExpandedIndex(idx)
        } else {
          URL.revokeObjectURL(url)
        }
        setRecordingIndex(null)
        mediaRecorderRef.current = null
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecordingIndex(index)
    } catch {
      alert('请允许麦克风权限后再录制')
    }
  }

  const stopRecording = () => {
    const mr = mediaRecorderRef.current
    if (mr && mr.state !== 'inactive') mr.stop()
  }

  const playAudio = (index: number) => {
    const existing = audioRefs.current[index]
    if (playingIndex === index && existing && !existing.paused) {
      existing.pause()
      existing.currentTime = 0
      setPlayingIndex(null)
      return
    }
    Object.values(audioRefs.current).forEach(a => {
      try {
        a.pause()
        a.currentTime = 0
      } catch {
        /* ignore */
      }
    })
    const url = recordedBlobs[index]
    if (!url) return
    const audio = new Audio(url)
    audioRefs.current[index] = audio
    audio.onended = () => {
      setPlayingIndex(cur => (cur === index ? null : cur))
    }
    audio.play().catch(() => setPlayingIndex(null))
    setPlayingIndex(index)
  }

  const reRecord = (index: number) => {
    const url = recordedBlobs[index]
    if (url) URL.revokeObjectURL(url)
    setRecordedBlobs(prev => {
      const n = { ...prev }
      delete n[index]
      return n
    })
    const a = audioRefs.current[index]
    if (a) {
      try {
        a.pause()
        a.src = ''
      } catch {
        /* ignore */
      }
      delete audioRefs.current[index]
    }
    if (playingIndex === index) setPlayingIndex(null)
    setRecordedCount(index)
    setExpandedIndex(null)
  }

  const waveHeights = [7, 13, 22, 31, 25, 37, 29, 35, 27, 33, 21, 15, 8]

  const goNextSentence = () => {
    setRecordedCount(c => (c < sentences.length - 1 ? c + 1 : c))
    setExpandedIndex(null)
  }

  return (
    <div className="min-h-full pb-8">
      <div className="text-[13px] text-[#B0A0C8] text-center mb-4">
        {roleLabel} · 第{subtitleSentenceNum}句 / 共{sentences.length}句
      </div>

      <div style={{ display: 'flex', gap: 3, padding: '4px 0 18px' }}>
        {sentences.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: recordedBlobs[i] ? '#4CAF50' : recordingIndex === i ? '#E91E63' : '#E8DCFF',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {sentences.map((sentence, i) => {
          const isDone = !!recordedBlobs[i]
          const isRecording = recordingIndex === i
          const isExpanded = expandedIndex === i
          const isPlaying = playingIndex === i

          if (isRecording) {
            return (
              <div
                key={i}
                ref={el => {
                  sentenceCardRefs.current[i] = el
                }}
                style={{
                  background: 'white',
                  border: '2px solid #E91E63',
                  borderRadius: 22,
                  padding: '22px 20px',
                  boxShadow: '0 6px 24px rgba(233,30,99,0.13)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E91E63' }} />
                    <span style={{ fontSize: 12, color: '#E91E63', fontWeight: 600 }}>第 {i + 1} 句</span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#C8A0C0',
                      background: '#FFF0F7',
                      padding: '2px 8px',
                      borderRadius: 10,
                    }}>
                    录制中
                  </span>
                </div>
                <div style={{ fontSize: 15, color: '#1A0A2E', lineHeight: 1.75, marginBottom: 20, fontWeight: 500 }}>{sentence}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3.5, height: 38, marginBottom: 22 }}>
                  {waveHeights.map((h, j) => (
                    <div
                      key={j}
                      style={{
                        width: 3,
                        height: Math.min(audioLevels[j] ?? h, 38),
                        borderRadius: 2,
                        background: j < 3 || j > 9 ? '#F48FB1' : '#E91E63',
                        transition: 'height 0.08s',
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: '50%',
                    background: 'white',
                    border: '1.5px solid #F3E0F7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 3px 14px rgba(233,30,99,0.08)',
                    cursor: 'pointer',
                    padding: 0,
                  }}>
                  <div
                    style={{
                      width: 21,
                      height: 21,
                      borderRadius: 6,
                      background: 'linear-gradient(135deg,#7B3FD4,#E91E63)',
                      boxShadow: '0 2px 8px rgba(233,30,99,0.3)',
                    }}
                  />
                </button>
              </div>
            )
          }

          if (isDone && !isRecording) {
            return (
              <div
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setExpandedIndex(isExpanded ? null : i)
                  }
                }}
                style={{
                  background: 'white',
                  border: isExpanded ? '1px solid #9C6FD6' : '1px solid #EDE7F6',
                  borderRadius: 16,
                  padding: '13px 15px',
                  cursor: 'pointer',
                  boxShadow: isExpanded ? '0 2px 12px rgba(123,63,212,0.08)' : 'none',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isExpanded ? 16 : 0 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#E8F5E9',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <polyline points="2,6 5,9 10,3" stroke="#43A047" strokeWidth="2" />
                    </svg>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontSize: 12.5,
                      color: isExpanded ? '#1A0A2E' : '#AAA',
                      lineHeight: 1.55,
                      whiteSpace: isExpanded ? 'normal' : 'nowrap',
                      overflow: isExpanded ? 'visible' : 'hidden',
                      textOverflow: isExpanded ? 'clip' : 'ellipsis',
                    }}>
                    {sentence}
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isExpanded ? '#9C6FD6' : '#CCC'} strokeWidth="2">
                    {isExpanded ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
                  </svg>
                </div>
                {isExpanded && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      paddingTop: 4,
                    }}>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        playAudio(i)
                      }}
                      style={{
                        width: '100%',
                        height: 44,
                        borderRadius: 12,
                        border: '2px solid #D8C8F0',
                        background: '#FAF7FF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#5C3D9E',
                      }}>
                      {isPlaying ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#5C3D9E">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#5C3D9E" style={{ marginLeft: 2 }}>
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      )}
                      {isPlaying ? '暂停' : '回听录音'}
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        reRecord(i)
                      }}
                      style={{
                        alignSelf: 'center',
                        padding: '6px 12px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#A898B8',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                      }}>
                      不满意？重新录制
                    </button>
                    {i < sentences.length - 1 && i === recordedCount && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          goNextSentence()
                        }}
                        style={{
                          width: '100%',
                          height: 50,
                          marginTop: 4,
                          borderRadius: 14,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 16,
                          fontWeight: 700,
                          color: 'white',
                          background: 'linear-gradient(135deg,#7B3FD4,#E91E63)',
                          boxShadow: '0 6px 20px rgba(123,63,212,0.35)',
                        }}>
                        下一句
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          }

          if (i === recordedCount && !isRecording) {
            return (
              <div
                key={i}
                ref={el => {
                  sentenceCardRefs.current[i] = el
                }}
                style={{
                  background: 'white',
                  border: '2px solid #EDE7F6',
                  borderRadius: 22,
                  padding: '22px 20px',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, color: '#7B3FD4', fontWeight: 600 }}>第 {i + 1} 句</span>
                  <span style={{ fontSize: 11, color: '#B0A0C8' }}>待录制</span>
                </div>
                <div style={{ fontSize: 15, color: '#1A0A2E', lineHeight: 1.75, marginBottom: 20, fontWeight: 500 }}>{sentence}</div>
                <button
                  type="button"
                  onClick={() => startRecording(i)}
                  disabled={recordingIndex !== null}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#7B3FD4,#E91E63)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    cursor: recordingIndex !== null ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(123,63,212,0.3)',
                    border: 'none',
                    padding: 0,
                    opacity: recordingIndex !== null ? 0.5 : 1,
                  }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" fill="none" />
                    <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" />
                    <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" />
                  </svg>
                </button>
                <div style={{ textAlign: 'center', fontSize: 11, color: '#B0A0C8', marginTop: 10 }}>点击麦克风开始录制</div>
              </div>
            )
          }

          return (
            <div
              key={i}
              style={{
                background: 'white',
                border: '1px solid #EDE7F6',
                borderRadius: 16,
                padding: '13px 15px',
                opacity: 0.38,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#F0E8FF',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <span style={{ fontSize: 11, color: '#C8B0E8', fontWeight: 600 }}>{i + 1}</span>
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 12.5,
                    color: '#C8B0E8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                  {sentence}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {allDone && (
        <button
          type="button"
          onClick={async () => {
            const blobParts: Blob[] = []
            try {
              for (let i = 0; i < sentences.length; i++) {
                const u = recordedBlobs[i]
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
          }}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 25,
            background: 'linear-gradient(135deg,#7B3FD4,#E91E63)',
            border: 'none',
            color: 'white',
            fontSize: 15,
            fontWeight: 700,
            marginTop: 20,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(123,63,212,0.3)',
          }}>
          完成录制
        </button>
      )}
    </div>
  )
}

export default function VoiceClonePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [customRoleName, setCustomRoleName] = useState('')
  const [prepareUnlocked, setPrepareUnlocked] = useState(false)
  /** 克隆完成页「试听」用，在完成录制时从各句录音复制而来，避免子组件卸载 revoke 后失效 */
  const [clonePreviewUrl, setClonePreviewUrl] = useState<string | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const clonePreviewUrlRef = useRef<string | null>(null)

  clonePreviewUrlRef.current = clonePreviewUrl

  useEffect(() => {
    return () => {
      const u = clonePreviewUrlRef.current
      if (u) URL.revokeObjectURL(u)
      previewAudioRef.current?.pause()
      previewAudioRef.current = null
    }
  }, [])

  const showMemberPrepare = IS_MEMBER || prepareUnlocked

  const handleRoleNext = () => {
    if (!selectedRole) return
    if (selectedRole === 'other' && !customRoleName.trim()) return
    setStep('prepare')
  }

  const handleStartRecord = () => {
    setStep('record')
  }

  const handleBack = () => {
    if (step === 'role') {
      router.back()
      return
    }
    if (step === 'prepare') {
      if (!IS_MEMBER && prepareUnlocked) {
        setPrepareUnlocked(false)
      } else {
        setStep('role')
      }
      return
    }
    if (step === 'record') {
      setStep('prepare')
      return
    }
    router.back()
  }

  const resetFlow = () => {
    if (clonePreviewUrl) URL.revokeObjectURL(clonePreviewUrl)
    setClonePreviewUrl(null)
    previewAudioRef.current?.pause()
    previewAudioRef.current = null
    setStep('role')
    setSelectedRole(null)
    setCustomRoleName('')
    setPrepareUnlocked(false)
  }

  const toggleClonePreview = () => {
    if (!clonePreviewUrl) {
      alert('暂无可播放的录音')
      return
    }
    const cur = previewAudioRef.current
    if (cur && !cur.paused) {
      cur.pause()
      cur.currentTime = 0
      previewAudioRef.current = null
      return
    }
    if (cur) {
      cur.pause()
      previewAudioRef.current = null
    }
    const a = new Audio(clonePreviewUrl)
    previewAudioRef.current = a
    a.onended = () => {
      previewAudioRef.current = null
    }
    a.play().catch(() => {
      previewAudioRef.current = null
      alert('无法播放，请检查浏览器是否允许音频播放')
    })
  }

  const roleMeta = ALL_ROLES.find(r => r.id === selectedRole)
  const roleLabel =
    selectedRole === 'other' ? customRoleName.trim() : (roleMeta?.label ?? '')
  const roleEmoji = selectedRole === 'other' ? OTHER_ROLE.emoji : (roleMeta?.emoji ?? '')

  const roleStepCanProceed =
    !!selectedRole && (selectedRole !== 'other' || !!customRoleName.trim())

  return (
    <div className="phone-shell bg-[#FBF7FF] flex flex-col min-h-[844px]">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">10:37</span>
        <span className="text-sm">📶🔋</span>
      </div>

      <div className="px-5 flex items-center flex-shrink-0 mb-2">
        <button type="button" onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(0,0,0,0.05)' }}>
          <svg className="w-5 h-5 text-[#1A0A2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="flex-1 text-center text-[16px] font-bold text-[#1A0A2E]">
          {step === 'role' && '选择角色'}
          {step === 'prepare' && '录制前准备'}
          {step === 'record' && '录制声音'}
          {step === 'processing' && '正在生成音色'}
          {step === 'done' && '克隆完成'}
        </div>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 px-5 pb-8">

        {step === 'role' && (
          <div>
            <div className="text-[13px] text-[#B0A0C8] text-center mb-1">谁来给宝宝讲故事？</div>
            <div className="text-[11px] text-[#D0C8E0] text-center mb-5">选择克隆音色对应的家庭角色</div>

            <div className="text-[13px] font-bold text-[#1A0A2E] mb-2.5">主要角色</div>
            <div className="flex gap-2 mb-5">
              {MAIN_ROLES.map(role => {
                const sel = selectedRole === role.id
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id)
                      setCustomRoleName('')
                    }}
                    className="flex-1 py-4 rounded-[18px] flex flex-col items-center gap-2 border-2 transition-all bg-white"
                    style={{
                      borderColor: sel ? '#7B3FD4' : '#F0E8FF',
                      boxShadow: sel ? '0 4px 16px rgba(123,63,212,0.12)' : 'none',
                    }}>
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-[32px]"
                      style={{
                        background: role.id === 'mom' ? '#FCE4EC' : '#E3F2FD',
                      }}>
                      {role.emoji}
                    </div>
                    <span className="text-[15px] font-black" style={{ color: sel ? '#7B3FD4' : '#1A0A2E' }}>
                      {role.label}
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: sel ? '#7B3FD4' : '#B0A0C8' }}>
                      {sel ? '已选择' : '点击选择'}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="text-[13px] font-bold text-[#1A0A2E] mb-2.5">其他家人</div>
            <div className="bg-white rounded-[18px] border border-[#F0E8FF] p-3 mb-4">
              <div className="grid grid-cols-4 gap-2">
                {FAMILY_GRID_ROLES.map(role => {
                  const sel = selectedRole === role.id
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id)
                        setCustomRoleName('')
                      }}
                      className="py-2.5 rounded-[14px] flex flex-col items-center gap-1.5 border transition-all"
                      style={{
                        background: sel ? '#FFF0F5' : '#FAFAFA',
                        borderColor: sel ? '#E91E63' : '#F0E8FF',
                      }}>
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[18px]"
                        style={{ background: role.circleBg }}>
                        {role.emoji}
                      </div>
                      <span
                        className="text-[11px] font-semibold leading-tight text-center px-0.5"
                        style={{ color: sel ? '#E91E63' : '#1A0A2E' }}>
                        {role.label}
                      </span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setSelectedRole('other')}
                  className="py-2.5 rounded-[14px] flex flex-col items-center justify-center gap-0.5 border-2 border-dashed transition-all min-h-[88px]"
                  style={{
                    borderColor: selectedRole === 'other' ? '#E91E63' : '#D8C8E8',
                    background: selectedRole === 'other' ? '#FFF0F5' : '#FAFAFA',
                  }}>
                  <span className="text-[22px] font-light leading-none" style={{ color: '#B0A0C8' }}>
                    +
                  </span>
                  <span
                    className="text-[10px] font-semibold text-center leading-tight px-0.5"
                    style={{ color: selectedRole === 'other' ? '#E91E63' : '#6B5B8C' }}>
                    其他角色
                  </span>
                </button>
              </div>
            </div>

            {selectedRole === 'other' && (
              <div className="mb-4">
                <div className="text-[12px] font-semibold text-[#6B5B8C] mb-2">填写角色称呼</div>
                <input
                  type="text"
                  value={customRoleName}
                  onChange={e => setCustomRoleName(e.target.value)}
                  placeholder="例如：小姨、哥哥、保姆"
                  maxLength={16}
                  autoFocus
                  className="w-full h-11 px-3.5 rounded-[14px] border-2 border-[#F0E8FF] bg-white text-[15px] text-[#1A0A2E] placeholder:text-[#C4B8D8] outline-none focus:border-[#7B3FD4]"
                />
              </div>
            )}

            <div
              className="flex items-center gap-2 rounded-[12px] px-3 py-2.5 mb-4 border border-[#F8BBD0]"
              style={{ background: '#FFF5F8' }}>
              <span className="text-[16px] flex-shrink-0">🎙️</span>
              <span className="text-[11px] text-[#880E4F] leading-snug">
                会员可克隆<span className="font-black">3个</span>不同音色，永久保存
              </span>
            </div>

            <button
              type="button"
              onClick={handleRoleNext}
              disabled={!roleStepCanProceed}
              className="w-full h-12 rounded-full text-white font-bold text-[15px] transition-all"
              style={{
                background: roleStepCanProceed ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#E0D8F0',
              }}>
              下一步
            </button>
          </div>
        )}

        {step === 'prepare' && (
          <div>
            {!showMemberPrepare ? (
              <div>
                <div className="text-center mb-5">
                  <div className="text-[56px] mb-2">{roleEmoji}</div>
                  <div className="text-[18px] font-black text-[#1A0A2E] mb-1">
                    用{roleLabel}的声音<br/>陪伴宝宝入睡
                  </div>
                  <div className="text-[13px] text-[#B0A0C8]">只需录制约2分钟，AI帮你永久保存</div>
                </div>

                <div className="bg-white rounded-[16px] border border-[#F0E8FF] p-4 mb-4">
                  <div className="text-[13px] font-bold text-[#1A0A2E] mb-3">开通会员，解锁声音克隆</div>
                  {[
                    { icon: '🌙', title: '宝宝可以睡得更香', desc: '听到爸妈真实声音，安全感更强' },
                    { icon: '⚡', title: '2分钟完成录制', desc: '跟着提示轻声朗读，完成音色克隆' },
                    { icon: '📚', title: '0～6岁故事全库畅听', desc: '库内故事均可一键换成你的声音' },
                    { icon: '💾', title: '已换声故事永久保存', desc: '克隆一次，随时使用，永不过期' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3 py-2.5 border-b border-[#F9F0FF] last:border-0">
                      <span className="text-[20px] flex-shrink-0">{item.icon}</span>
                      <div>
                        <div className="text-[13px] font-semibold text-[#1A0A2E]">{item.title}</div>
                        <div className="text-[11px] text-[#B0A0C8] mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#FFF0F5] rounded-[14px] p-3 mb-5 border border-[#F8BBD0]">
                  <div className="text-[11px] text-[#E91E63] font-bold mb-1">💬 来自其他妈妈的评价</div>
                  <div className="text-[12px] text-[#880E4F] leading-relaxed">
                    「用自己的声音录完之后，宝宝每次听故事都特别安静，感觉真的在听我讲话一样，太感动了！」
                  </div>
                  <div className="text-[11px] text-[#F48FB1] mt-1">— 来自 8个月宝妈</div>
                </div>

                <button type="button" onClick={() => setPrepareUnlocked(true)}
                  className="w-full h-12 rounded-full text-white font-bold text-[15px] mb-2"
                  style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)', boxShadow: '0 6px 20px rgba(233,30,99,0.3)' }}>
                  开通会员 · 立即录制
                </button>
                <div className="text-center text-[11px] text-[#B0A0C8]">演示场景：点击即可进入录制准备与演示流程</div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-5">
                  <div className="text-[48px] mb-2">{roleEmoji}</div>
                  <div className="text-[16px] font-bold text-[#1A0A2E]">准备录制{roleLabel}的声音</div>
                  <div className="text-[12px] text-[#B0A0C8] mt-1">共10句话，约2分钟</div>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  {[
                    { icon: '🔇', title: '保持环境安静', desc: '关闭电视等杂音，找个安静的房间或角落' },
                    { icon: '📱', title: '手机距离适中', desc: '距离15-20cm，正常音量说话' },
                    { icon: '🗣️', title: '用讲故事的语气', desc: '温柔舒缓，克隆效果更逼真' },
                    { icon: '📝', title: '完整朗读每一句', desc: '不要中途停顿，读错了可以重录' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3 bg-white rounded-[14px] p-3.5 border border-[#F0E8FF]">
                      <span className="text-[22px] flex-shrink-0">{item.icon}</span>
                      <div>
                        <div className="text-[13px] font-bold text-[#1A0A2E]">{item.title}</div>
                        <div className="text-[11px] text-[#B0A0C8] mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={handleStartRecord}
                  className="w-full h-12 rounded-full text-white font-bold text-[15px]"
                  style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)', boxShadow: '0 6px 20px rgba(233,30,99,0.3)' }}>
                  准备好了，开始录制
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'record' && (
          <RecordStep
            sentences={SENTENCES}
            roleLabel={roleLabel || '妈妈'}
            onComplete={previewUrl => {
              setClonePreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev)
                return previewUrl
              })
              setStep('processing')
              setTimeout(() => setStep('done'), 3000)
            }}
          />
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-[56px] mb-4 animate-pulse">{roleEmoji}</div>
            <div className="text-[18px] font-bold text-[#1A0A2E] mb-2">正在生成音色...</div>
            <div className="text-[13px] text-[#B0A0C8] mb-6">AI正在学习{roleLabel}的声音特征</div>
            <div className="w-48 h-2 bg-[#F0E8FF] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7B3FD4] to-[#E91E63] rounded-full animate-pulse" style={{ width: '70%' }}/>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="text-[20px] font-black text-[#1A0A2E] mb-1">{roleLabel}的声音克隆成功！</div>
            <div className="text-[13px] text-[#B0A0C8] mb-6">现在可以用{roleLabel}的声音讲故事了</div>

            <div className="w-full bg-white rounded-[16px] border border-[#F0E8FF] p-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-[24px]"
                  style={{ background: '#FFF0F5' }}>{roleEmoji}</div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-[#1A0A2E]">{roleLabel}的声音</div>
                  <div className="text-[11px] text-[#B0A0C8]">克隆完成 · 今天</div>
                </div>
                <button
                  type="button"
                  onClick={toggleClonePreview}
                  className="px-3 py-1.5 rounded-full text-[12px] font-bold border border-[#E91E63] text-[#E91E63] active:opacity-80">
                  试听
                </button>
              </div>
            </div>

            <button type="button" onClick={() => router.push('/featured')}
              className="w-full h-12 rounded-full text-white font-bold text-[15px] mb-3"
              style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
              去听故事
            </button>
            <button type="button" onClick={resetFlow}
              className="w-full h-10 text-[13px] text-[#B0A0C8]">
              再录一个角色
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
