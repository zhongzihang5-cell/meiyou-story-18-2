'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MOCK_STORIES, AGE_OPTIONS } from '@/lib/mockData'
import type { AgeGroup } from '@/lib/mockData'
import StoryCard from '@/components/StoryCard'
import MiniPlayer from '@/components/MiniPlayer'
import { getFavorites, subscribe } from '@/lib/favorites'
import type { FavoriteItem } from '@/lib/favorites'
import { collectionHref } from '@/lib/collectionNav'
import { buildVoiceStoryPlayerUrl } from '@/lib/voicePlayerLink'
import { setLastAgeLevel } from '@/lib/searchAgeContext'

const VOICE_STORIES: Record<string, {
  id: string; title: string; emoji: string; bg: string; scene: string; duration: string
}> = {
  'L1': { id:'v-l1', title:'月光摇篮曲',   emoji:'🌙', bg:'linear-gradient(135deg,#1a1a3e,#4a1a6e)', scene:'睡前故事', duration:'2:22' },
  'L2': { id:'v-l2', title:'躲猫猫真好玩', emoji:'🙈', bg:'linear-gradient(135deg,#0d2137,#1a4a6e)', scene:'亲子互动', duration:'2:08' },
  'L3': { id:'v-l3', title:'小熊爱刷牙',   emoji:'🐻', bg:'linear-gradient(135deg,#2d1b4e,#6e1a4a)', scene:'生活习惯', duration:'3:12' },
  'L4': { id:'v-l4', title:'我的好朋友',   emoji:'🤝', bg:'linear-gradient(135deg,#3e2010,#8B4513)', scene:'爱与情感', duration:'3:45' },
  'L5': { id:'v-l5', title:'天为什么会下雨',emoji:'🌧️',bg:'linear-gradient(135deg,#0d3720,#1a6e4a)', scene:'认知探索', duration:'4:30' },
}

const SLEEP_STORIES = [
  { id:'001', title:'睡吧，我的宝贝', emoji:'🌙', bg:'linear-gradient(135deg,#1a1a3e,#4a1a6e)', eps:23 },
  { id:'003', title:'和宝贝说晚安',   emoji:'⭐', bg:'linear-gradient(135deg,#0d2137,#1a4a6e)', eps:23 },
  { id:'002', title:'睡前故事爸爸篇', emoji:'👨', bg:'linear-gradient(135deg,#2d1b4e,#6e1a4a)', eps:20 },
  { id:'004', title:'睡前十分钟',     emoji:'🐻', bg:'linear-gradient(135deg,#3e2010,#8B4513)', eps:24 },
]
const NURSERY_SONGS = [
  { id:'s1', title:'亲子运动歌',   emoji:'🦁', bg:'linear-gradient(135deg,#7B2D8B,#E91E8C)', eps:62 },
  { id:'s2', title:'认知学习儿歌', emoji:'🐰', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:66 },
  { id:'s3', title:'身体律动歌',   emoji:'🎵', bg:'linear-gradient(135deg,#E91E63,#FF9800)', eps:40 },
  { id:'s4', title:'习惯养成儿歌', emoji:'🌟', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:35 },
]
const ANIMATIONS = [
  { id:'a1', title:'小猫汤米', emoji:'🐱', bg:'linear-gradient(135deg,#FF6B6B,#FF8E53)', eps:24 },
  { id:'a2', title:'豆小鸭迷你冒险', emoji:'🐥', bg:'linear-gradient(135deg,#F7DC6F,#F39C12)', eps:18 },
  { id:'a3', title:'超级飞侠', emoji:'✈️', bg:'linear-gradient(135deg,#5DADE2,#2E86C1)', eps:32 },
  { id:'a4', title:'小猪佩奇', emoji:'🐷', bg:'linear-gradient(135deg,#F1948A,#E74C3C)', eps:26 },
]

const TABS = [
  { label: '精选', href: '/featured' },
  { label: '儿歌', href: '/nursery' },
  { label: '动画', href: '/animation' },
  { label: '故事', href: '/stories' },
  { label: '识字', href: '/literacy' },
]

const BANNERS = [
  {
    id: 'voice',
    bg: 'linear-gradient(120deg,#5520A0 0%,#9E1568 55%,#FF5D38 100%)',
    tag: '🎙️ 会员专属权益',
    title: '用爸妈声音\n给宝宝讲故事',
    sub: '声音克隆 · 永久保存',
    btnText: '了解详情',
    btnHref: '/voice-clone',
    emoji: '👩👶',
  },
  {
    id: 'custom',
    bg: 'linear-gradient(120deg,#0D47A1 0%,#1976D2 40%,#7B1FA2 100%)',
    tag: '✨ 限时免费体验 3次',
    title: '妈妈太累了？\nAI替你讲故事',
    sub: '输入主题 · 30秒生成',
    btnText: '立即体验',
    btnHref: '/custom-story',
    emoji: '🤖📖',
  },
]

export default function FeaturedPage() {
  const router = useRouter()
  const [ageFilter, setAgeFilter] = useState<AgeGroup | undefined>('L1' as AgeGroup)
  const [bannerIdx, setBannerIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000)
    return () => clearInterval(t)
  }, [])

  const ageKey = ageFilter ?? 'L1'
  const voiceStory = VOICE_STORIES[ageKey] ?? VOICE_STORIES['L1']
  const banner = BANNERS[bannerIdx]

  const filteredStories = ageFilter
    ? MOCK_STORIES.filter(s => s.age_group === ageFilter).slice(0, 2)
    : MOCK_STORIES.slice(0, 2)

  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  useEffect(() => {
    setFavorites(getFavorites())
    const unsub = subscribe(() => setFavorites(getFavorites()))
    return unsub
  }, [])

  useEffect(() => {
    setLastAgeLevel(ageKey)
  }, [ageKey])

  return (
    <div className="phone-shell bg-[#FBF7FF]" style={{ paddingBottom: 80 }}>
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">21:09</span>
        <span className="text-sm">📶🔋</span>
      </div>

      {/* 顶部导航栏 · 标题固定「儿歌故事」 */}
      <div className="relative flex items-center px-4 py-2 flex-shrink-0" style={{ height: 48 }}>
        <button type="button" onClick={() => router.push('/')}
          className="absolute left-1 w-9 h-9 flex items-center justify-center text-[#C4B8D8] active:opacity-45"
          aria-label="返回">
          <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div className="w-full text-center text-[17px] font-bold text-[#1A0A2E]">
          儿歌故事
        </div>
        <button type="button" onClick={() => router.push('/search')}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#F0EAF8] absolute right-4">
          <svg className="w-5 h-5 text-[#7B3FD4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>

      <div className="flex px-4 pt-3 border-b border-[#F0F0F0] flex-shrink-0">
        {TABS.map(t => (
          <Link key={t.label} href={t.href}
            className={`flex-1 text-center pb-2.5 text-sm relative cursor-pointer
              ${t.label==='精选' ? 'text-[#E91E63] font-bold' : 'text-[#B0A0C8] font-medium'}`}>
            {t.label}
            {t.label==='精选' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#E91E63] rounded-full"/>}
          </Link>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">

        <div className="mx-4 mt-3 relative">
          <Link href={banner.btnHref}>
            <div className="rounded-[18px] h-[120px] relative overflow-hidden cursor-pointer flex items-center"
              style={{ background: banner.bg }}>
              <div className="absolute top-[-30px] left-[-30px] w-32 h-32 rounded-full opacity-10 bg-white"/>
              <div className="absolute bottom-[-20px] left-[40%] w-24 h-24 rounded-full opacity-[0.07] bg-white"/>

              <div className="pl-5 flex-1 z-10 pr-2">
                <div className="inline-flex items-center bg-white/20 text-yellow-200 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2">
                  {banner.tag}
                </div>
                <div className="text-white text-[15px] font-black leading-snug mb-1.5" style={{ whiteSpace: 'pre-line' }}>
                  {banner.title}
                </div>
                <div className="text-white/55 text-[10px]">{banner.sub}</div>
              </div>

              <div className="flex flex-col items-center justify-center gap-2 pr-5 flex-shrink-0 z-10">
                <div className="text-[32px] leading-none">{banner.emoji}</div>
                <button className="bg-white text-[#7B3FD4] text-[11px] font-extrabold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                  {banner.btnText} →
                </button>
              </div>
            </div>
          </Link>

          <div className="flex justify-center gap-1.5 mt-2">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === bannerIdx ? 16 : 6,
                  height: 6,
                  background: i === bannerIdx ? '#E91E63' : '#D1C4E9',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-3 flex-shrink-0 border-b border-[#F0E8FF]">
          {AGE_OPTIONS.map(opt => {
            const active = ageFilter === opt.value
            return (
              <button
                key={String(opt.value)}
                onClick={() => setAgeFilter(opt.value)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all border whitespace-nowrap"
                style={{
                  background: active ? '#FCE4EC' : '#fff',
                  color: active ? '#E91E63' : '#888',
                  borderColor: active ? '#F48FB1' : '#e0e0e0',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <SectionHeader title="🆕 最新上架" href="/stories" />
        <div className="px-4 flex flex-col gap-2.5">
          <div onClick={() => router.push(buildVoiceStoryPlayerUrl(voiceStory, 'home'))}
            className="bg-white rounded-2xl p-3 flex gap-3 border-2 border-[#7B3FD4] shadow-md cursor-pointer relative overflow-hidden active:scale-[0.98] transition-transform">
            <div className="w-16 h-16 rounded-[14px] flex-shrink-0 flex items-center justify-center text-3xl"
              style={{ background: voiceStory.bg }}>{voiceStory.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-[#1A0A2E] mb-0.5">{voiceStory.title}</div>
              <div className="text-[11px] text-[#B0A0C8] mb-2">{voiceStory.scene} · {voiceStory.duration}</div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                  style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>🎙️ 爸妈原声</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDE7F6] text-[#7B3FD4]">会员专属</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 bg-[#7B3FD4] text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg">
              用你的声音讲
            </div>
          </div>
          {filteredStories.map(s => (
            <StoryCard key={s.id} story={{ ...s, status: 'published' }} onPaywall={() => {}} listFrom="home" />
          ))}
        </div>

        {favorites.length > 0 && (
          <>
            <SectionHeader title="❤️ 我喜欢" href="#" />
            <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar pb-1">
              {favorites.map(item => (
                <div key={item.id}
                  onClick={() => router.push(item.type === 'collection' ? collectionHref(item.id.replace('col-',''), 'home') : `/player/${item.id}`)}
                  className="flex-shrink-0 w-[110px] rounded-[13px] overflow-hidden cursor-pointer border border-[#F0E8FF] active:scale-[0.96] transition-transform">
                  <div className="w-full h-[88px] flex items-center justify-center text-[34px] relative" style={{ background: item.bg }}>
                    {item.emoji}
                    {item.type === 'collection' && (
                      <span className="absolute top-1 right-1 text-[9px] bg-black/40 text-white px-1.5 py-0.5 rounded-md">合集</span>
                    )}
                  </div>
                  <div className="p-2 bg-white">
                    <div className="text-[11px] font-bold text-[#1A0A2E] truncate">{item.title}</div>
                    <div className="text-[10px] text-[#B0A0C8] truncate">{item.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <SectionHeader title="🌙 睡前故事" href="/category/sleep-story" />
        <HScroll items={SLEEP_STORIES} />

        <SectionHeader title="🎵 益智儿歌" href="/category/nursery-songs" />
        <HScroll items={NURSERY_SONGS} />

        <SectionHeader title="🎬 热门动画" href="/category/animation" />
        <HScroll items={ANIMATIONS} kind="animation" />

        <div style={{ height: 16 }} />
      </div>

      <MiniPlayer />
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex justify-between items-center px-4 pt-4 pb-2">
      <p className="text-[15px] font-extrabold text-[#1A0A2E]">{title}</p>
      <Link href={href} className="text-xs text-[#7B3FD4]">更多 ›</Link>
    </div>
  )
}

function HScroll({ items, kind }: { items: any[]; kind?: 'default' | 'animation' }) {
  const router = useRouter()
  return (
    <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar pb-1">
      {items.map(item => (
        <div key={item.id}
          onClick={() => router.push(kind === 'animation' ? '/player-video' : collectionHref(item.id, 'home'))}
          className="flex-shrink-0 w-[110px] rounded-[13px] overflow-hidden cursor-pointer border border-[#F0E8FF] active:scale-[0.96] transition-transform">
          <div className="w-full h-[88px] flex items-center justify-center text-[34px] relative" style={{ background: item.bg }}>
            {item.emoji}
            <span className="absolute bottom-1 right-1 bg-black/40 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
              共{item.eps}集
            </span>
          </div>
          <div className="p-2 bg-white">
            <div className="text-[11px] font-bold text-[#1A0A2E] truncate">{item.title}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
