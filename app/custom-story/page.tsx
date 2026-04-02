'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ALL_BABIES = [
  { id: '1', name: '果果', emoji: '👧', age: '2岁3个月' },
  { id: '2', name: '多多', emoji: '👦', age: '4岁1个月' },
  { id: '3', name: '小宝', emoji: '👶', age: '8个月' },
]

const THEME_OPTIONS = [
  { value: 'sleep', label: '睡前故事', emoji: '🌙' },
  { value: 'animal', label: '小动物', emoji: '🐾' },
  { value: 'emotion', label: '情绪管理', emoji: '🌈' },
  { value: 'family', label: '家庭温情', emoji: '🏠' },
  { value: 'nature', label: '大自然', emoji: '🌿' },
  { value: 'adventure', label: '探索冒险', emoji: '🚀' },
  { value: 'habit', label: '好习惯', emoji: '⭐' },
  { value: 'friend', label: '交朋友', emoji: '🤝' },
]

const EXTRA_CHARACTERS = [
  { value: 'ultraman', label: '奥特曼', emoji: '🦸' },
  { value: 'pig', label: '小飞猪', emoji: '🐷' },
  { value: 'bear', label: '小熊', emoji: '🐻' },
  { value: 'rabbit', label: '小兔子', emoji: '🐰' },
  { value: 'fox', label: '小狐狸', emoji: '🦊' },
  { value: 'elephant', label: '小象', emoji: '🐘' },
  { value: 'dragon', label: '小龙', emoji: '🐲' },
]

const MESSAGE_SHORTCUTS = [
  '希望你每天都开心',
  '勇敢去探索世界',
  '你是最棒的宝贝',
  '妈妈永远爱你',
  '爸爸为你加油',
  '做个善良的孩子',
]

export default function CustomStoryPage() {
  const router = useRouter()

  const [customChars, setCustomChars] = useState<Array<{ value: string; label: string; emoji: string }>>([])
  const [showCustomChar, setShowCustomChar] = useState(false)
  const [customCharInput, setCustomCharInput] = useState('')

  const [theme, setTheme] = useState<string | null>(null)
  const [showCustomTheme, setShowCustomTheme] = useState(false)
  const [customTheme, setCustomTheme] = useState('')
  const [selectedChars, setSelectedChars] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const themeReady = !!theme && (theme !== 'custom' || customTheme.trim().length > 0)
  const canGenerate = themeReady && selectedChars.length > 0

  const steps = [
    { n: 1, label: '选主题', done: themeReady, active: !themeReady },
    { n: 2, label: '选主角', done: selectedChars.length > 0, active: themeReady && selectedChars.length === 0 },
    { n: 3, label: '加寄语', done: !!message, active: selectedChars.length > 0 && !message },
    { n: 4, label: '生成', done: false, active: canGenerate },
  ]

  const toggleChar = (val: string) => {
    setSelectedChars(prev => {
      if (prev.includes(val)) return prev.filter(v => v !== val)
      if (prev.length >= 2) return prev
      return [...prev, val]
    })
  }

  const resolveCharLabel = (id: string) => {
    const baby = ALL_BABIES.find(b => b.id === id)
    const extra = EXTRA_CHARACTERS.find(c => c.value === id)
    const custom = customChars.find(c => c.value === id)
    return baby?.name ?? extra?.label ?? custom?.label ?? ''
  }

  const confirmCustomChar = () => {
    const label = customCharInput.trim()
    if (!label) return
    const newChar = { value: `custom-${Date.now()}`, label, emoji: '🌟' }
    setCustomChars(prev => [...prev, newChar])
    setSelectedChars(prev => (prev.length < 2 ? [...prev, newChar.value] : prev))
    setCustomCharInput('')
    setShowCustomChar(false)
  }

  const handleGenerate = () => {
    if (!canGenerate) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setGenerating(true)
    setProgress(0)
    let p = 0
    intervalRef.current = setInterval(() => {
      p = Math.min(p + Math.random() * 12, 95)
      setProgress(p)
      if (p >= 95 && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        timeoutRef.current = setTimeout(() => {
          setGenerating(false)
          const charNames = selectedChars
            .map(id => {
              const baby = ALL_BABIES.find(b => b.id === id)
              const extra = EXTRA_CHARACTERS.find(c => c.value === id)
              const custom = customChars.find(c => c.value === id)
              return baby?.name ?? extra?.label ?? custom?.label ?? ''
            })
            .filter(Boolean)
            .join('和')
          const storyTheme =
            theme === 'custom' ? customTheme : THEME_OPTIONS.find(t => t.value === theme)?.label ?? ''
          const storyTitle = `${charNames}的${storyTheme}`
          router.push(
            `/player/ai-story?title=${encodeURIComponent(storyTitle)}&chars=${encodeURIComponent(charNames)}&theme=${encodeURIComponent(storyTheme)}&msg=${encodeURIComponent(message)}`,
          )
        }, 600)
      }
    }, 300)
  }

  return (
    <div className="phone-shell relative bg-[#FBF7FF] flex flex-col min-h-[844px]">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">14:56</span>
        <span className="text-sm">📶🔋</span>
      </div>

      <div className="relative flex items-center px-4 pb-2 flex-shrink-0" style={{ height: 44 }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#EDE7F6] absolute left-4">
          <svg className="w-5 h-5 text-[#7B3FD4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="w-full text-center text-[17px] font-black text-[#1A0A2E]">✨ 定制专属故事</div>
      </div>

      <div className="flex items-center justify-center px-6 pb-4 flex-shrink-0">
        {steps.map((step, i) => (
          <div key={step.n} className="flex items-center" style={{ flex: i < 3 ? 1 : 'none' }}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all"
                style={{
                  background: step.done
                    ? 'linear-gradient(135deg,#7B3FD4,#E91E63)'
                    : step.active
                      ? '#7B3FD4'
                      : '#F0E8FF',
                  color: step.done || step.active ? '#fff' : '#B0A0C8',
                  boxShadow: step.active ? '0 0 0 3px #EDE7F6' : 'none',
                }}>
                {step.done ? '✓' : step.n}
              </div>
              <div
                className="text-[10px] whitespace-nowrap"
                style={{
                  color: step.active ? '#7B3FD4' : step.done ? '#4CAF50' : '#B0A0C8',
                  fontWeight: step.active ? 700 : 400,
                }}>
                {step.label}
              </div>
            </div>
            {i < 3 && (
              <div
                className="h-[2px] mx-1 rounded-full transition-all"
                style={{
                  width: 32,
                  background: step.done ? 'linear-gradient(90deg,#7B3FD4,#E91E63)' : '#F0E8FF',
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 px-4 pb-4">
        <div
          className="bg-white rounded-[18px] border border-[#F0E8FF] p-4 mb-6"
          style={{ boxShadow: '0 2px 12px rgba(123,63,212,0.06)' }}>
          <div className="text-[12px] text-[#B0A0C8] mb-3 font-semibold">我的宝宝</div>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-[22px] flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#EDE7F6,#FCE4EC)' }}>
              {ALL_BABIES[0].emoji}
            </div>
            <div>
              <div className="text-[15px] font-black text-[#1A0A2E]">{ALL_BABIES[0].name}</div>
              <div className="text-[11px] text-[#B0A0C8]">{ALL_BABIES[0].age}</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-[15px] font-black text-[#1A0A2E] mb-3 flex items-center gap-1.5">
            <span>🎨</span> 选择故事主题
          </div>
          <div className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value)
                  setShowCustomTheme(false)
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] transition-all"
                style={{
                  background: theme === opt.value ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#fff',
                  color: theme === opt.value ? '#fff' : '#6B5B8C',
                  borderColor: theme === opt.value ? 'transparent' : '#F0E8FF',
                  boxShadow: theme === opt.value ? '0 3px 12px rgba(155,63,212,0.28)' : 'none',
                }}>
                <span>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowCustomTheme(t => {
                  if (!t) setTheme('custom')
                  return !t
                })
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] transition-all"
              style={{
                background: showCustomTheme ? '#FFF0F5' : '#fff',
                color: showCustomTheme ? '#E91E63' : '#6B5B8C',
                borderColor: showCustomTheme ? '#F48FB1' : '#F0E8FF',
              }}>
              <span>✏️</span> 其他
            </button>
          </div>
          {showCustomTheme && (
            <div className="mt-3 bg-white border border-[#F0E8FF] rounded-[16px] px-4 py-3">
              <input
                value={customTheme}
                onChange={e => setCustomTheme(e.target.value)}
                placeholder="输入自定义主题，例如：太空探险"
                className="w-full text-[14px] text-[#1A0A2E] bg-transparent border-none outline-none"
              />
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="text-[15px] font-black text-[#1A0A2E] mb-1 flex items-center gap-1.5">
            <span>🎭</span> 故事主角是谁？
          </div>
          <div className="text-[11px] text-[#B0A0C8] mb-3">最多选2个</div>
          <div className="flex flex-wrap gap-2">
            {ALL_BABIES.map(baby => {
              const isSelected = selectedChars.includes(baby.id)
              const isDisabled = !isSelected && selectedChars.length >= 2
              return (
                <button
                  key={baby.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleChar(baby.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] transition-all disabled:cursor-not-allowed"
                  style={{
                    background: isSelected ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#fff',
                    color: isSelected ? '#fff' : '#6B5B8C',
                    borderColor: isSelected ? 'transparent' : '#F0E8FF',
                    opacity: isDisabled ? 0.4 : 1,
                    boxShadow: isSelected ? '0 3px 12px rgba(155,63,212,0.28)' : 'none',
                  }}>
                  <span>{baby.emoji}</span>
                  {baby.name}
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full ml-0.5"
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.25)' : '#F0E8FF',
                      color: isSelected ? '#fff' : '#B0A0C8',
                    }}>
                    宝宝
                  </span>
                </button>
              )
            })}

            {EXTRA_CHARACTERS.map(opt => {
              const isSelected = selectedChars.includes(opt.value)
              const isDisabled = !isSelected && selectedChars.length >= 2
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleChar(opt.value)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] transition-all disabled:cursor-not-allowed"
                  style={{
                    background: isSelected ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#fff',
                    color: isSelected ? '#fff' : isDisabled ? '#D0C0E0' : '#6B5B8C',
                    borderColor: isSelected ? 'transparent' : '#F0E8FF',
                    opacity: isDisabled ? 0.5 : 1,
                    boxShadow: isSelected ? '0 3px 12px rgba(155,63,212,0.28)' : 'none',
                  }}>
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              )
            })}

            {customChars.map(opt => {
              const isSelected = selectedChars.includes(opt.value)
              const isDisabled = !isSelected && selectedChars.length >= 2
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleChar(opt.value)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] transition-all disabled:cursor-not-allowed"
                  style={{
                    background: isSelected ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#fff',
                    color: isSelected ? '#fff' : '#6B5B8C',
                    borderColor: isSelected ? 'transparent' : '#F0E8FF',
                    opacity: isDisabled ? 0.5 : 1,
                    boxShadow: isSelected ? '0 3px 12px rgba(155,63,212,0.28)' : 'none',
                  }}>
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              )
            })}

            <button
              type="button"
              onClick={() => setShowCustomChar(s => !s)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] transition-all"
              style={{
                background: showCustomChar ? '#FFF0F5' : '#fff',
                color: showCustomChar ? '#E91E63' : '#6B5B8C',
                borderColor: showCustomChar ? '#F48FB1' : '#F0E8FF',
              }}>
              ✏️ 自定义
            </button>

            {showCustomChar && (
              <div className="w-full mt-1 bg-white border border-[#F0E8FF] rounded-[14px] px-4 py-3 flex gap-2 items-center">
                <input
                  value={customCharInput}
                  onChange={e => setCustomCharInput(e.target.value)}
                  placeholder="输入角色名，如：小恐龙"
                  className="flex-1 text-[14px] text-[#1A0A2E] bg-transparent border-none outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customCharInput.trim()) {
                      e.preventDefault()
                      confirmCustomChar()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={confirmCustomChar}
                  className="text-[13px] text-white font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
                  确认
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-[15px] font-black text-[#1A0A2E] mb-3 flex items-center gap-1.5">
            <span>💌</span> 加一句寄语
            <span className="text-[11px] font-normal text-[#B0A0C8]">选填</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {MESSAGE_SHORTCUTS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setMessage(message === s ? '' : s)}
                className="px-3 py-1.5 rounded-full text-[12px] border-[1.5px] transition-all"
                style={{
                  background: message === s ? '#FFF0F5' : '#fff',
                  color: message === s ? '#E91E63' : '#888',
                  borderColor: message === s ? '#F48FB1' : '#F0E8FF',
                }}>
                {s}
              </button>
            ))}
          </div>
          <div className="bg-white border-[1.5px] border-[#F0E8FF] rounded-[16px] p-3">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="或者自己写一句话…"
              rows={2}
              className="w-full border-none outline-none resize-none text-[14px] text-[#1A0A2E] bg-transparent leading-relaxed"
              style={{ fontFamily: 'inherit' }}
            />
            <div className="text-[11px] text-[#B0A0C8]">✨ AI会把这句话编进故事结尾</div>
          </div>
        </div>

        {canGenerate && (
          <div
            className="rounded-[20px] p-4 mb-4 border border-[#F0E8FF]"
            style={{ background: 'linear-gradient(135deg,#EDE7F6,#FCE4EC)' }}>
            <div className="text-[11px] font-bold text-[#7B3FD4] mb-2">📖 故事预览</div>
            <div className="text-[14px] text-[#1A0A2E] leading-relaxed">
              一个关于
              <span className="text-[#E91E63] font-bold">
                {selectedChars.map(id => resolveCharLabel(id)).filter(Boolean).join('和')}
              </span>
              的
              <span className="text-[#E91E63] font-bold">
                {theme === 'custom' ? customTheme : THEME_OPTIONS.find(t => t.value === theme)?.label}
              </span>
              故事。
              {message && (
                <>
                  结尾寄语：「
                  <span className="text-[#E91E63] font-bold">
                    {message.slice(0, 15)}
                    {message.length > 15 ? '…' : ''}
                  </span>
                  」
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || generating}
          className="w-full h-14 rounded-full text-[16px] font-black flex items-center justify-center gap-2 transition-all disabled:opacity-90"
          style={{
            background: canGenerate ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#E0D8F0',
            boxShadow: canGenerate ? '0 8px 24px rgba(155,63,212,0.35)' : 'none',
            color: canGenerate ? '#fff' : '#9E8FB8',
          }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          {canGenerate ? '立即生成专属故事' : '请先选择主题和主角'}
        </button>
      </div>

      {generating && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div
            className="bg-white rounded-[28px] p-9 text-center w-[300px]"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div
              className="text-[48px] mb-4"
              style={{ display: 'inline-block', animation: 'custom-story-spin 2s linear infinite' }}>
              ✨
            </div>
            <div className="text-[17px] font-black text-[#1A0A2E] mb-2">正在生成故事中…</div>
            <div className="text-[13px] text-[#6B5B8C] mb-5">
              AI正在为
              {selectedChars
                .map(id => {
                  const baby = ALL_BABIES.find(b => b.id === id)
                  const extra = EXTRA_CHARACTERS.find(c => c.value === id)
                  const custom = customChars.find(c => c.value === id)
                  return baby?.name ?? extra?.label ?? custom?.label ?? ''
                })
                .filter(Boolean)
                .join('和')}
              创作专属故事
            </div>
            <div className="h-1.5 bg-[#F0E8FF] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7B3FD4,#E91E63)' }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes custom-story-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
