'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoryById, MOCK_STORIES } from '@/lib/mockData'
import { toggleFavorite, isFavorited, subscribe } from '@/lib/favorites'
import { isCollectionFromParam, pathAfterCollectionBack } from '@/lib/collectionNav'

const COLLECTION_STORIES = MOCK_STORIES.slice(0, 12)

const SUBTITLES = [
  { start: 0,  end: 5,  text: '嗨，小朋友们，今天的故事开始啦～' },
  { start: 6,  end: 12, text: '夜空里，有一颗小星星，一闪一闪亮晶晶。' },
  { start: 13, end: 19, text: '小星星眨眨眼睛，好像在说……' },
  { start: 20, end: 26, text: '宝宝，我在这里呢！' },
  { start: 27, end: 33, text: '宝宝，你也看到小星星了吗？' },
  { start: 34, end: 40, text: '故事讲完啦，宝宝要乖乖睡觉～' },
]

const TIMER_OPTIONS = [
  { label: '不定时', value: 0 },
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '45分钟', value: 45 },
  { label: '60分钟', value: 60 },
]

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s) % 60).padStart(2, '0')}`
}

function safeDecodeParam(raw: string | null): string | undefined {
  if (raw == null || raw === '') return undefined
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function PlayerContent({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const autoplay = searchParams.get('autoplay') === '1'

  const currentIndex = COLLECTION_STORIES.findIndex(s => s.id === id)
  const baseStory = currentIndex >= 0 ? COLLECTION_STORIES[currentIndex] : (getStoryById(id) ?? MOCK_STORIES[0])
  const titleOverride = safeDecodeParam(searchParams.get('title'))
  const emojiOverride = safeDecodeParam(searchParams.get('emoji'))
  const bgOverride = safeDecodeParam(searchParams.get('bg'))
  const charsParam = safeDecodeParam(searchParams.get('chars')) ?? ''
  const themeParam = safeDecodeParam(searchParams.get('theme')) ?? ''
  const msgParam = safeDecodeParam(searchParams.get('msg')) ?? ''
  const isAiStory = id === 'ai-story'

  const story = {
    ...baseStory,
    ...(titleOverride != null ? { title: titleOverride } : {}),
    ...(emojiOverride != null ? { cover_emoji: emojiOverride } : {}),
    ...(bgOverride != null ? { cover_bg: bgOverride } : {}),
  }

  const firstCharName = charsParam.split('和')[0] || '小朋友'
  const AI_SUBTITLES = charsParam
    ? [
        { start: 0, end: 6, text: `从前，有一个叫${firstCharName}的小朋友。` },
        { start: 7, end: 13, text: `${firstCharName}非常喜欢${themeParam}。` },
        { start: 14, end: 20, text: `有一天，${charsParam}决定一起去探险。` },
        { start: 21, end: 27, text: '他们走啊走，遇到了好多有趣的事情。' },
        { start: 28, end: 34, text: `经历了这一切，${firstCharName}学到了很多。` },
        {
          start: 35,
          end: 41,
          text: msgParam ? `妈妈说：${msgParam}。` : '这真是美好的一天啊！',
        },
        { start: 42, end: 48, text: '故事讲完啦，宝宝要乖乖睡觉～' },
      ]
    : SUBTITLES

  const subtitleList = isAiStory ? AI_SUBTITLES : SUBTITLES

  const colId = searchParams.get('col')
  const fromParam = searchParams.get('from')
  const isVoiceGuided = id === '003'

  const handleBack = () => {
    if (colId) {
      const q = isCollectionFromParam(fromParam) ? `?from=${fromParam}` : ''
      router.push(`/collection/${colId}${q}`)
    } else {
      router.push(pathAfterCollectionBack(fromParam))
    }
  }

  const [playing, setPlaying] = useState(false)
  const [currentSec, setCurrentSec] = useState(0)
  const [playMode, setPlayMode] = useState<'sequence'|'shuffle'|'repeat'>('sequence')
  const [rotation, setRotation] = useState(0)
  const rafRef = useRef<number>()
  const lastRef = useRef<number>()

  const [subtitleMode, setSubtitleMode] = useState(false)
  const currentSub = subtitleList.find(s => currentSec >= s.start && currentSec <= s.end)

  const [voiceMode, setVoiceMode] = useState<'default'|'original'>('default')
  const [showVipSheet, setShowVipSheet] = useState(false)
  const [showBubble, setShowBubble] = useState(isVoiceGuided)

  const [showTimer, setShowTimer] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [playlistTab, setPlaylistTab] = useState<'list'|'recent'>('list')
  const [selectedTimer, setSelectedTimer] = useState(0)

  // 收藏
  const [faved, setFaved] = useState(false)
  useEffect(() => {
    setFaved(isFavorited(id))
    const unsub = subscribe(() => setFaved(isFavorited(id)))
    return unsub
  }, [id])

  const handleFav = () => {
    toggleFavorite({
      id,
      type: 'story',
      title: story.title,
      emoji: story.cover_emoji,
      bg: story.cover_bg,
      subtitle: `${story.category_label} · ${story.age_label}`,
      savedAt: Date.now(),
    })
  }

  useEffect(() => {
    setCurrentSec(0)
    setPlaying(false)
    setSubtitleMode(false)
  }, [id])

  useEffect(() => {
    if (autoplay) setPlaying(true)
  }, [autoplay])

  useEffect(() => {
    if (playing) {
      const tick = (now: number) => {
        if (lastRef.current) {
          const d = (now - lastRef.current) / 1000
          setRotation(r => (r + d * 12) % 360)
          setCurrentSec(s => {
            if (s + d >= story.duration_sec) { setPlaying(false); return story.duration_sec }
            return s + d
          })
        }
        lastRef.current = now
        rafRef.current = requestAnimationFrame(tick)
      }
      lastRef.current = undefined
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastRef.current = undefined
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [playing, story.duration_sec])

  const pct = story.duration_sec > 0 ? (currentSec / story.duration_sec) * 100 : 0
  const cycleMode = () => setPlayMode(m => m==='sequence'?'shuffle':m==='shuffle'?'repeat':'sequence')

  const goPrev = () => {
    if (isAiStory) return
    const colParam = colId ? `?col=${colId}` : ''
    if (playMode === 'shuffle') {
      router.push(`/player/${COLLECTION_STORIES[Math.floor(Math.random() * COLLECTION_STORIES.length)].id}${colParam}`)
    } else if (currentIndex > 0) {
      router.push(`/player/${COLLECTION_STORIES[currentIndex - 1].id}${colParam}`)
    }
  }

  const goNext = () => {
    if (isAiStory && playMode !== 'repeat') return
    const colParam = colId ? `?col=${colId}` : ''
    if (playMode === 'repeat') { setCurrentSec(0); setPlaying(true) }
    else if (playMode === 'shuffle') {
      router.push(`/player/${COLLECTION_STORIES[Math.floor(Math.random() * COLLECTION_STORIES.length)].id}${colParam}`)
    } else if (currentIndex < COLLECTION_STORIES.length - 1) {
      router.push(`/player/${COLLECTION_STORIES[currentIndex + 1].id}${colParam}`)
    }
  }

  const handleVoiceSwitch = (mode: 'default'|'original') => {
    if (mode === 'original' && voiceMode === 'default') setShowVipSheet(true)
    else setVoiceMode(mode)
  }

  const modeIcon = playMode === 'sequence' ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ) : playMode === 'shuffle' ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
      <line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      <text x="10" y="14" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">1</text>
    </svg>
  )

  return (
    <div className="phone-shell relative flex flex-col"
      style={{ background: 'linear-gradient(170deg,#3D1060 0%,#7B2050 50%,#4A0A20 100%)' }}>
      <div className="absolute inset-0 flex items-center justify-center text-[300px] opacity-[0.05] pointer-events-none select-none">{story.cover_emoji}</div>

      <div className="h-12 px-7 flex justify-between items-center pt-3 relative z-10 flex-shrink-0">
        <span className="text-[15px] font-bold text-white">21:09</span>
        <span className="text-sm text-white">📶🔋</span>
      </div>

      <div className="px-5 flex items-center justify-between relative z-10 flex-shrink-0">
        <button onClick={() => handleBack()}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="text-[15px] font-bold text-white flex-1 text-center mx-3 truncate">{story.title}</div>
        <button onClick={() => setShowTimer(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* 封面 / 字幕 */}
      <div className="px-10 mt-4 relative z-10 flex-shrink-0" onClick={() => setSubtitleMode(m => !m)}>
        {!subtitleMode ? (
          <div className="relative cursor-pointer">
            <div className="absolute inset-[-8px] rounded-full" style={{ background: 'radial-gradient(circle,#2a0a3e,#1a0520)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}/>
            <div className="relative w-full aspect-square rounded-full flex items-center justify-center text-[80px] overflow-hidden shadow-2xl"
              style={{ background: story.cover_bg, transform: `rotate(${rotation}deg)`, transition: playing ? 'none' : 'transform 0.3s ease', boxShadow: playing ? '0 0 40px rgba(240,98,146,0.35)' : '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 50%)' }}/>
              <span className="relative z-10">{story.cover_emoji}</span>
              {[60,48,36].map(s => <div key={s} className="absolute rounded-full border border-white/5" style={{ width:`${s}%`, height:`${s}%` }}/>)}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 border-2 border-white/40"/>
            <div className="absolute bottom-[-18px] left-0 right-0 text-center text-[10px] text-white/25">点击切换字幕</div>
          </div>
        ) : (
          <div className="w-full aspect-square rounded-[28px] flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-[36px] mb-4 opacity-25">{story.cover_emoji}</div>
            <div className="text-white text-[16px] font-semibold text-center leading-relaxed px-8">{currentSub?.text ?? '...'}</div>
            <div className="mt-4 text-[10px] text-white/20">点击切换封面</div>
          </div>
        )}
      </div>

      {/* 标题 + 收藏 + 声音模式 */}
      <div className="text-center px-7 mt-7 relative z-10 flex-shrink-0">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="text-[18px] font-black text-white truncate max-w-[220px]">{story.title}</div>
          <button onClick={handleFav} className="flex-shrink-0 transition-transform active:scale-90">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={faved ? '#F06292' : 'none'} stroke={faved ? '#F06292' : 'rgba(255,255,255,0.5)'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div className="text-[12px] text-white/50 mb-3">{story.sub_category} · {story.age_label}</div>

        <div className="inline-flex rounded-full overflow-hidden border border-white/15" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <button onClick={() => handleVoiceSwitch('default')} className="px-4 py-2 text-[11px] font-bold transition-all"
            style={{ background: voiceMode==='default' ? 'rgba(255,255,255,0.22)' : 'transparent', color: voiceMode==='default' ? '#fff' : 'rgba(255,255,255,0.4)' }}>
            默认音色
          </button>
          <button onClick={() => handleVoiceSwitch('original')} className="px-4 py-2 text-[11px] font-bold flex items-center gap-1 transition-all"
            style={{ background: voiceMode==='original' ? 'rgba(255,255,255,0.22)' : 'transparent', color: voiceMode==='original' ? '#FFE566' : 'rgba(255,255,255,0.4)' }}>
            🎙️ 原声讲述
            <span className="text-[9px] bg-[#E91E63] text-white px-1.5 py-0.5 rounded-full">VIP</span>
          </button>
        </div>

        {isVoiceGuided && showBubble && (
          <div className="mt-2 relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold text-white" style={{ background: 'rgba(233,30,99,0.9)' }}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45" style={{ background: 'rgba(233,30,99,0.9)' }}/>
            👆 点击切换爸妈原声讲故事
            <button onClick={e => { e.stopPropagation(); setShowBubble(false) }} className="text-white/60 ml-0.5">✕</button>
          </div>
        )}
      </div>

      {/* 进度条 */}
      <div className="px-7 mt-4 relative z-10 flex-shrink-0">
        <div className="h-1.5 bg-white/15 rounded-full relative cursor-pointer"
          onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setCurrentSec(((e.clientX - r.left) / r.width) * story.duration_sec) }}>
          <div className="h-full rounded-full" style={{ width:`${pct}%`, background:'linear-gradient(90deg,#F06292,#9C6FD6)' }}/>
          <div className="w-4 h-4 bg-white rounded-full absolute top-1/2 shadow-md" style={{ left:`${pct}%`, transform:'translateX(-50%) translateY(-50%)' }}/>
        </div>
        <div className="flex justify-between mt-1.5 text-[11px] text-white/35">
          <span>{fmt(currentSec)}</span><span>{fmt(story.duration_sec)}</span>
        </div>
      </div>

      {/* 播放控制 */}
      <div className="flex items-center justify-between px-6 mt-3 relative z-10 flex-shrink-0">
        <button onClick={cycleMode} className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ color:'rgba(255,255,255,0.55)' }}>{modeIcon}</button>
        <button onClick={goPrev} className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ opacity: currentIndex<=0 && playMode!=='shuffle' ? 0.3 : 0.85 }}>
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="3" height="16"/></svg>
        </button>
        <button onClick={() => setPlaying(p => !p)} className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl flex-shrink-0">
          {playing
            ? <svg className="w-7 h-7 text-[#7B3FD4]" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg className="w-7 h-7 text-[#7B3FD4] ml-1" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          }
        </button>
        <button onClick={goNext} className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ opacity: currentIndex>=COLLECTION_STORIES.length-1 && playMode==='sequence' ? 0.3 : 0.85 }}>
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,4 15,12 5,20"/><rect x="16" y="4" width="3" height="16"/></svg>
        </button>
        <button onClick={() => { setShowPlaylist(true); setPlaylistTab('list') }} className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" style={{ color:'rgba(255,255,255,0.55)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* 换声模块（仅引导故事）*/}
      {isVoiceGuided && (
        <div className="mx-4 mt-3 relative z-10 flex-shrink-0">
          <div className="rounded-[18px] overflow-hidden" style={{ background:'linear-gradient(135deg,rgba(123,63,212,0.55),rgba(233,30,99,0.45))', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.18)' }}>
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-[26px] flex-shrink-0">👨‍👩‍👧</div>
                <div>
                  <div className="text-[13px] font-black text-white mb-0.5">换成你的声音讲这个故事</div>
                  <div className="text-[11px] text-white/65 leading-relaxed">录制15秒，AI克隆你的声音。宝宝听到爸妈的声音，睡得更安心。</div>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {[['🎤','录音15秒'],['🤖','AI克隆'],['✨','立即生成']].map(([icon,label]) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl" style={{ background:'rgba(255,255,255,0.1)' }}>
                    <span className="text-[14px]">{icon}</span>
                    <span className="text-[9px] text-white/75 font-semibold">{label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/voice-clone')} className="w-full h-10 rounded-full font-black text-[13px]" style={{ background:'linear-gradient(135deg,#fff,#f0e8ff)', color:'#7B3FD4' }}>
                🎙️ 开始克隆我的声音
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 定时停止 */}
      {showTimer && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }} onClick={() => setShowTimer(false)}>
          <div className="w-full bg-[#1A0A2E] rounded-t-[24px] px-5 pt-5 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mb-5"/>
            <div className="text-white text-[16px] font-bold mb-4">⏱ 定时停止</div>
            <div className="grid grid-cols-3 gap-3">
              {TIMER_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => { setSelectedTimer(opt.value); setShowTimer(false) }}
                  className="py-3 rounded-2xl text-[13px] font-bold"
                  style={{ background: selectedTimer===opt.value ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : 'rgba(255,255,255,0.1)', color: selectedTimer===opt.value ? '#fff' : 'rgba(255,255,255,0.65)' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIP弹层 */}
      {showVipSheet && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }} onClick={() => setShowVipSheet(false)}>
          <div className="w-full bg-white rounded-t-[28px] px-5 pt-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-[#E0D8F0] rounded-full mx-auto mb-5"/>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎙️</div>
              <div className="text-[17px] font-black text-[#1A0A2E] mb-1">开通会员解锁原声讲述</div>
              <div className="text-[12px] text-[#6B5B8C] leading-relaxed px-1">用爸妈的声音，给宝宝讲库里的每一首故事</div>
            </div>
            <div className="bg-[#F8F4FF] rounded-2xl p-4 mb-5 border border-[#F0E8FF]">
              {[
                ['可克隆音色', '会员最多3种'],
                ['适用故事', '0～6岁故事全库畅听'],
                ['定制故事', 'AI生成每月30次'],
                ['保存时长', '永久有效'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[#F0E8FF] last:border-0">
                  <span className="text-[12px] text-[#B0A0C8]">{k}</span>
                  <span className="text-[12px] font-bold text-[#1A0A2E]">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setShowVipSheet(false); router.push('/voice-clone') }} className="w-full h-[52px] rounded-full text-white font-extrabold text-[15px] mb-3" style={{ background:'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
              开通会员克隆声音
            </button>
            <button onClick={() => setShowVipSheet(false)} className="w-full h-10 text-[#B0A0C8] text-[13px]">暂不开通</button>
          </div>
        </div>
      )}

      {/* 播放列表 */}
      {showPlaylist && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }} onClick={() => setShowPlaylist(false)}>
          <div className="w-full bg-[#1A0A2E] rounded-t-[24px] pt-5 pb-10 flex flex-col" style={{ maxHeight:'68vh' }} onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mb-3 flex-shrink-0"/>
            <div className="flex px-5 gap-5 mb-3 flex-shrink-0 items-end">
              {[{id:'list',label:'播放列表'},{id:'recent',label:'最近播放'}].map(tab => (
                <button key={tab.id} onClick={() => setPlaylistTab(tab.id as any)} className="text-[14px] font-bold pb-2 relative" style={{ color: playlistTab===tab.id ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                  {tab.label}
                  {playlistTab===tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F06292] rounded-full"/>}
                </button>
              ))}
              <div className="ml-auto text-[11px] text-white/30 pb-2">{playlistTab==='list' ? `${COLLECTION_STORIES.length}首` : '最近8首'}</div>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              {(playlistTab==='list' ? COLLECTION_STORIES : MOCK_STORIES.slice(0,8)).map((s,i) => (
                <div key={s.id} onClick={() => { setShowPlaylist(false); router.push(`/player/${s.id}`) }}
                  className="flex items-center gap-3 py-3 cursor-pointer" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  {playlistTab==='list' ? (
                    <div className="w-6 text-center text-[12px] font-bold flex-shrink-0" style={{ color: s.id===id ? '#F06292' : 'rgba(255,255,255,0.25)' }}>{s.id===id ? '▶' : i+1}</div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl" style={{ background:s.cover_bg }}>{s.cover_emoji}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate" style={{ color: s.id===id ? '#F06292' : '#fff' }}>{s.title}</div>
                    <div className="text-[11px] text-white/30 mt-0.5">{s.sub_category} · {fmt(s.duration_sec)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PlayerPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="phone-shell flex items-center justify-center" style={{ background:'linear-gradient(170deg,#3D1060 0%,#4A0A20 100%)' }}>
        <div className="text-white/50 text-sm">加载中...</div>
      </div>
    }>
      <PlayerContent id={params.id} />
    </Suspense>
  )
}
