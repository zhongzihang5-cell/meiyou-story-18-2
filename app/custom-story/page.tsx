'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  MEMBER_HOME_BABY_NAME,
  MEMBER_HOME_INTEREST_TAGS,
  MEMBER_HOME_INTEREST_VALUES,
} from '@/lib/aiQinshengMemberHome'

/** 与首页兴趣标签一致，最多可选主角数量（含宝宝/兴趣/其他角色） */
const MAX_PROTAGONISTS = 3

const ALL_BABIES = [
  { id: '1', name: MEMBER_HOME_BABY_NAME, emoji: '👧', age: '14个月' },
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

/** 「今日故事」展开区：默认文案 + 快捷填入（宝宝名与「我的宝宝」一致） */
function buildTodayStoryDefaultText(babyName: string) {
  return `宝宝今日长牙了。
今天打了疫苗。
爸爸妈妈夸${babyName}真勇敢！`
}

const TODAY_STORY_SNIPPETS = ['宝宝今日长牙了', '今天打了疫苗'] as const

const EXTRA_CHARACTERS_MORE = [
  { value: 'ultraman', label: '奥特曼', emoji: '🦸' },
  { value: 'pig', label: '小飞猪', emoji: '🐷' },
  { value: 'bear', label: '小熊', emoji: '🐻' },
  { value: 'rabbit', label: '小兔子', emoji: '🐰' },
  { value: 'fox', label: '小狐狸', emoji: '🦊' },
  { value: 'elephant', label: '小象', emoji: '🐘' },
  { value: 'dragon', label: '小龙', emoji: '🐲' },
] as const

/** 前段与 ai-stories/home「柚柚喜欢」标签 value/文案一致，便于透传勾选 */
const EXTRA_CHARACTERS = [
  ...MEMBER_HOME_INTEREST_TAGS.map(t => ({ value: t.value, label: t.label, emoji: t.emoji })),
  ...EXTRA_CHARACTERS_MORE,
]

const MESSAGE_SHORTCUTS = [
  '希望你每天都开心',
  '勇敢去探索世界',
  '你是最棒的宝贝',
  '妈妈永远爱你',
  '爸爸为你加油',
  '做个善良的孩子',
]

/** 标题字数上限：手机一行内读完 */
const STORY_TITLE_MAX = 11

function clampStoryTitle(s: string, max = STORY_TITLE_MAX): string {
  const t = s.replace(/\s+/g, '').replace(/\n/g, '').trim()
  if (!t) return '专属小故事'
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

/** 与预设主题对应的短意象词，用于拼进标题 */
const THEME_TITLE_FLAVOR: Record<string, string> = {
  sleep: '睡前',
  animal: '动物',
  emotion: '情绪',
  family: '全家',
  nature: '自然',
  adventure: '探险',
  habit: '习惯',
  friend: '朋友',
}

/**
 * 精炼故事标题：与所选宝宝/元素、主题类型挂钩，控制字数
 */
function buildCompactStoryTitle(
  selectedIds: string[],
  getLabel: (id: string) => string,
  theme: string | null,
  todayText: string,
  customTheme: string,
): string {
  const babyEntry = selectedIds.map(id => ALL_BABIES.find(b => b.id === id)).find(Boolean)
  const labels = selectedIds.map(getLabel).filter(Boolean)
  const primary = (babyEntry?.name ?? labels[0] ?? '宝宝').slice(0, 4)
  const nonBabyLabels = selectedIds
    .filter(id => !ALL_BABIES.some(b => b.id === id))
    .map(getLabel)
    .filter(Boolean)
  const extra = (nonBabyLabels[0] ?? '').slice(0, 3)

  let raw = ''
  if (theme === 'none') {
    raw = extra ? `${primary}·${extra}` : `${primary}奇遇`
  } else if (theme === 'today') {
    const t = todayText
    let hook = '今日'
    if (t.includes('长牙') && t.includes('疫苗')) hook = '长牙疫苗'
    else if (t.includes('长牙')) hook = '长牙'
    else if (t.includes('疫苗')) hook = '疫苗'
    raw = `${primary}·${hook}`
  } else if (theme === 'custom') {
    const core = customTheme.trim().replace(/\s+/g, '').slice(0, 4)
    raw = core ? `${primary}·${core}` : `${primary}故事`
  } else if (theme && THEME_TITLE_FLAVOR[theme]) {
    const flav = THEME_TITLE_FLAVOR[theme]
    raw = extra ? `${primary}·${extra}${flav}` : `${primary}·${flav}`
  } else {
    raw = `${primary}故事`
  }

  return clampStoryTitle(raw)
}

/** 传给播放器：短标签，用于字幕里的「喜欢xxx」，避免整段日记 */
function buildPlayerThemeSummary(theme: string | null, todayText: string, customT: string): string {
  if (theme === 'none') return '自由发挥'
  if (theme === 'today') {
    const t = todayText
    if (t.includes('长牙') && t.includes('疫苗')) return '长牙与疫苗'
    if (t.includes('长牙')) return '长牙了'
    if (t.includes('疫苗')) return '打疫苗'
    return '今日小事'
  }
  if (theme === 'custom') {
    const c = customT.trim().replace(/\s+/g, '')
    return c ? clampStoryTitle(c, 10) : '自定义'
  }
  const label = THEME_OPTIONS.find(x => x.value === theme)?.label ?? '故事'
  return clampStoryTitle(label.replace('故事', '').trim() || label, 8)
}

/** 播放器里「角色列表」用短串：最多两人，多则用「等」 */
function buildPlayerCharsShort(selectedIds: string[], getLabel: (id: string) => string): string {
  const labels = selectedIds.map(getLabel).filter(Boolean)
  if (labels.length === 0) return '小朋友'
  if (labels.length === 1) return labels[0].slice(0, 6)
  if (labels.length === 2) return `${labels[0].slice(0, 4)}和${labels[1].slice(0, 4)}`
  return `${labels[0].slice(0, 4)}和${labels[1].slice(0, 4)}等`
}

function CustomStoryPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [customChars, setCustomChars] = useState<Array<{ value: string; label: string; emoji: string }>>([])
  const [showCustomChar, setShowCustomChar] = useState(false)
  const [customCharInput, setCustomCharInput] = useState('')

  const [theme, setTheme] = useState<string | null>(null)
  const [showCustomTheme, setShowCustomTheme] = useState(false)
  const [customTheme, setCustomTheme] = useState('')
  const [showTodayStory, setShowTodayStory] = useState(false)
  const [todayStoryText, setTodayStoryText] = useState(() =>
    buildTodayStoryDefaultText(MEMBER_HOME_BABY_NAME),
  )
  const [messageOtherActive, setMessageOtherActive] = useState(false)
  const [selectedChars, setSelectedChars] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const raw = searchParams.get('interests')
    if (!raw?.trim()) return
    const ids = raw.split(',').map(s => s.trim()).filter(Boolean)
    const picked = ids.filter(id => MEMBER_HOME_INTEREST_VALUES.has(id)).slice(0, MAX_PROTAGONISTS)
    if (picked.length > 0) setSelectedChars(picked)
  }, [searchParams])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const themeReady =
    theme === 'none' ||
    (theme === 'today' && todayStoryText.trim().length > 0) ||
    (theme === 'custom' && customTheme.trim().length > 0) ||
    (!!theme && THEME_OPTIONS.some(t => t.value === theme))

  const canGenerate = themeReady && selectedChars.length > 0

  const steps = [
    { n: 1, label: '选主题', done: themeReady, active: !themeReady },
    {
      n: 2,
      label: '选元素',
      done: selectedChars.length > 0,
      active: themeReady && selectedChars.length === 0,
    },
    {
      n: 3,
      label: '给宝宝的寄语',
      done: !!message.trim(),
      active: selectedChars.length > 0 && !message.trim(),
    },
    { n: 4, label: '生成', done: false, active: canGenerate },
  ]

  const toggleChar = (val: string) => {
    setSelectedChars(prev => {
      if (prev.includes(val)) return prev.filter(v => v !== val)
      if (prev.length >= MAX_PROTAGONISTS) return prev
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
    setSelectedChars(prev => (prev.length < MAX_PROTAGONISTS ? [...prev, newChar.value] : prev))
    setCustomCharInput('')
    setShowCustomChar(false)
  }

  const appendTodaySnippet = (snippet: string) => {
    setTodayStoryText(prev => {
      const t = prev.trim()
      if (!t) return `${snippet}。`
      if (prev.includes(snippet)) return prev
      return `${prev.replace(/\s+$/, '')}\n${snippet}。`
    })
  }

  const selectThemeNone = () => {
    setTheme('none')
    setShowCustomTheme(false)
    setShowTodayStory(false)
  }

  const selectThemeToday = () => {
    setTheme('today')
    setShowTodayStory(true)
    setShowCustomTheme(false)
    setTodayStoryText(t => (t.trim() ? t : buildTodayStoryDefaultText(MEMBER_HOME_BABY_NAME)))
  }

  const selectThemePreset = (value: string) => {
    setTheme(value)
    setShowCustomTheme(false)
    setShowTodayStory(false)
  }

  const selectThemeCustom = () => {
    setShowCustomTheme(t => {
      const next = !t
      if (next) {
        setTheme('custom')
        setShowTodayStory(false)
      }
      return next
    })
  }

  const isShortcutMessage = MESSAGE_SHORTCUTS.includes(message)

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
          const storyTitle = buildCompactStoryTitle(
            selectedChars,
            resolveCharLabel,
            theme,
            todayStoryText,
            customTheme,
          )
          const themeSummary = buildPlayerThemeSummary(theme, todayStoryText, customTheme)
          const charsShort = buildPlayerCharsShort(selectedChars, resolveCharLabel)
          router.push(
            `/player/ai-story?title=${encodeURIComponent(storyTitle)}&chars=${encodeURIComponent(charsShort)}&theme=${encodeURIComponent(themeSummary)}&msg=${encodeURIComponent(message)}`,
          )
        }, 600)
      }
    }, 300)
  }

  return (
    <div className="phone-shell relative bg-[#FBF7FF] flex flex-col">
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
            <button
              type="button"
              onClick={selectThemeToday}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] transition-all"
              style={{
                background: theme === 'today' ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#fff',
                color: theme === 'today' ? '#fff' : '#6B5B8C',
                borderColor: theme === 'today' ? 'transparent' : '#F0E8FF',
                boxShadow: theme === 'today' ? '0 3px 12px rgba(155,63,212,0.28)' : 'none',
              }}>
              <span>📅</span> 今日故事
            </button>
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => selectThemePreset(opt.value)}
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
              onClick={selectThemeCustom}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] transition-all"
              style={{
                background: showCustomTheme ? '#FFF0F5' : '#fff',
                color: showCustomTheme ? '#E91E63' : '#6B5B8C',
                borderColor: showCustomTheme ? '#F48FB1' : '#F0E8FF',
              }}>
              <span>✏️</span> 其他
            </button>
            <button
              type="button"
              onClick={selectThemeNone}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] transition-all"
              style={{
                background: theme === 'none' ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#fff',
                color: theme === 'none' ? '#fff' : '#6B5B8C',
                borderColor: theme === 'none' ? 'transparent' : '#F0E8FF',
                boxShadow: theme === 'none' ? '0 3px 12px rgba(155,63,212,0.28)' : 'none',
              }}>
              <span>✨</span> 无主题
            </button>
          </div>
          {theme === 'today' && showTodayStory && (
            <div className="mt-3 rounded-[16px] border border-[#F0E8FF] bg-white px-4 py-3">
              <div className="mb-2 text-[11px] font-semibold text-[#B0A0C8]">今天发生了什么？可点选填入，也可自由修改</div>
              <div className="mb-3 flex flex-wrap gap-2">
                {TODAY_STORY_SNIPPETS.map(snippet => (
                  <button
                    key={snippet}
                    type="button"
                    onClick={() => appendTodaySnippet(snippet)}
                    className="rounded-full border border-[#E8DEF8] bg-[#FBF7FF] px-3 py-1.5 text-[12px] font-medium text-[#6B5B8C] active:scale-[0.98]">
                    {snippet}
                  </button>
                ))}
              </div>
              <textarea
                value={todayStoryText}
                onChange={e => setTodayStoryText(e.target.value)}
                placeholder="写下宝宝今天的故事…"
                rows={4}
                className="w-full resize-none rounded-[12px] border border-[#F0E8FF] bg-[#FFFBFE] p-3 text-[14px] leading-relaxed text-[#1A0A2E] outline-none"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
          )}
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
            <span>🎭</span> 故事里的元素
          </div>
          <div className="text-[11px] text-[#B0A0C8] mb-3">最多选{MAX_PROTAGONISTS}个（宝宝、兴趣或角色）</div>
          <div className="flex flex-wrap gap-2">
            {ALL_BABIES.map(baby => {
              const isSelected = selectedChars.includes(baby.id)
              const isDisabled = !isSelected && selectedChars.length >= MAX_PROTAGONISTS
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
              const isDisabled = !isSelected && selectedChars.length >= MAX_PROTAGONISTS
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
              const isDisabled = !isSelected && selectedChars.length >= MAX_PROTAGONISTS
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
            <span>💌</span> 给宝宝的寄语
            <span className="text-[11px] font-normal text-[#B0A0C8]">选填</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {MESSAGE_SHORTCUTS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setMessage(message === s ? '' : s)
                  setMessageOtherActive(false)
                }}
                className="px-3 py-1.5 rounded-full text-[12px] border-[1.5px] transition-all"
                style={{
                  background: message === s && !messageOtherActive ? '#FFF0F5' : '#fff',
                  color: message === s && !messageOtherActive ? '#E91E63' : '#888',
                  borderColor: message === s && !messageOtherActive ? '#F48FB1' : '#F0E8FF',
                }}>
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMessageOtherActive(true)
                if (isShortcutMessage) setMessage('')
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] border-[1.5px] transition-all"
              style={{
                background: messageOtherActive || (!isShortcutMessage && message.trim() !== '') ? '#FFF0F5' : '#fff',
                color: messageOtherActive || (!isShortcutMessage && message.trim() !== '') ? '#E91E63' : '#888',
                borderColor: messageOtherActive || (!isShortcutMessage && message.trim() !== '') ? '#F48FB1' : '#F0E8FF',
              }}>
              <span>✏️</span> 其他
            </button>
          </div>
          <div
            className="rounded-[16px] border-[1.5px] p-3"
            style={{
              borderColor: messageOtherActive ? '#F48FB1' : '#F0E8FF',
              background: '#fff',
              boxShadow: messageOtherActive ? '0 0 0 2px rgba(244,143,177,0.2)' : 'none',
            }}>
            <textarea
              value={message}
              onChange={e => {
                setMessage(e.target.value)
                setMessageOtherActive(true)
              }}
              placeholder={
                messageOtherActive ? '写下你想对宝宝说的话…' : '点选上方快捷语，或点「其他」后在此输入'
              }
              rows={3}
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
            <div className="text-[13px] text-[#1A0A2E] mb-2">
              <span className="text-[#B0A0C8]">故事题目：</span>
              <span className="font-black text-[#E91E63] truncate inline-block max-w-full align-bottom">
                {buildCompactStoryTitle(
                  selectedChars,
                  resolveCharLabel,
                  theme,
                  todayStoryText,
                  customTheme,
                )}
              </span>
            </div>
            <div className="text-[12px] text-[#6B5B8C] leading-snug line-clamp-2">
              {theme === 'today'
                ? `围绕：${buildPlayerThemeSummary(theme, todayStoryText, customTheme)}，结合所选元素展开。`
                : theme === 'none'
                  ? '无固定主题，围绕所选元素自由发挥。'
                  : `主题：${buildPlayerThemeSummary(theme, todayStoryText, customTheme)}。`}
              {message ? ` 寄语已选。` : ''}
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
          {canGenerate ? '立即生成专属故事' : '请先选择主题和故事元素'}
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
            <div className="text-[13px] text-[#6B5B8C] mb-5 line-clamp-2 px-1">
              AI正在为「{buildPlayerCharsShort(selectedChars, resolveCharLabel)}」创作专属故事
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

export default function CustomStoryPage() {
  return (
    <Suspense
      fallback={
        <div className="phone-shell relative flex min-h-[50vh] flex-col bg-[#FBF7FF]" aria-hidden />
      }>
      <CustomStoryPageInner />
    </Suspense>
  )
}
