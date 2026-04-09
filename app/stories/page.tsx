'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MOCK_STORIES, AGE_OPTIONS } from '@/lib/mockData'
import type { AgeGroup } from '@/lib/mockData'
import StoryCard from '@/components/StoryCard'
import { collectionHref } from '@/lib/collectionNav'
import { buildVoiceStoryPlayerUrl } from '@/lib/voicePlayerLink'
import { setLastAgeLevel } from '@/lib/searchAgeContext'

// 与精选页一致：每个月龄对应的爸妈原声引导故事
const VOICE_STORIES: Record<string, {
  id: string; title: string; emoji: string; bg: string; scene: string; duration: string
}> = {
  'L1': { id:'v-l1', title:'月光摇篮曲',   emoji:'🌙', bg:'linear-gradient(135deg,#1a1a3e,#4a1a6e)', scene:'睡前故事', duration:'2:22' },
  'L2': { id:'v-l2', title:'躲猫猫真好玩', emoji:'🙈', bg:'linear-gradient(135deg,#0d2137,#1a4a6e)', scene:'亲子互动', duration:'2:08' },
  'L3': { id:'v-l3', title:'小熊爱刷牙',   emoji:'🐻', bg:'linear-gradient(135deg,#2d1b4e,#6e1a4a)', scene:'生活习惯', duration:'3:12' },
  'L4': { id:'v-l4', title:'我的好朋友',   emoji:'🤝', bg:'linear-gradient(135deg,#3e2010,#8B4513)', scene:'爱与情感', duration:'3:45' },
  'L5': { id:'v-l5', title:'天为什么会下雨',emoji:'🌧️',bg:'linear-gradient(135deg,#0d3720,#1a6e4a)', scene:'认知探索', duration:'4:30' },
}

const TABS = [
  { label: '精选', href: '/featured' },
  { label: '儿歌', href: '/nursery' },
  { label: '动画', href: '/animation' },
  { label: '故事', href: '/stories' },
  { label: '识字', href: '/literacy' },
]

const SECTION_MORE_HREF: Record<string, string> = {
  '🌙 睡前故事': '/category/sleep-story',
  '🌅 晨起故事': '/category/morning-story',
  '🧠 认知启蒙': '/category/cognitive',
  '🌱 成长日常': '/category/life',
  '💛 爱与情感': '/category/emotion',
}

const SECTIONS: Record<string, Array<{ id: string, title: string, emoji: string, bg: string, eps: number }>> = {
  '🌙 睡前故事': [
    { id:'001', title:'睡吧，我的宝贝', emoji:'🌙', bg:'linear-gradient(135deg,#1a1a3e,#4a1a6e)', eps:23 },
    { id:'003', title:'和宝贝说晚安', emoji:'⭐', bg:'linear-gradient(135deg,#0d2137,#1a4a6e)', eps:23 },
    { id:'002', title:'睡前故事爸爸篇', emoji:'👨', bg:'linear-gradient(135deg,#2d1b4e,#6e1a4a)', eps:20 },
    { id:'004', title:'睡前十分钟', emoji:'🐻', bg:'linear-gradient(135deg,#3e2010,#8B4513)', eps:24 },
  ],
  '🌅 晨起故事': [
    { id:'m1', title:'早安宝宝', emoji:'☀️', bg:'linear-gradient(135deg,#FF8F00,#FFC107)', eps:15 },
    { id:'m2', title:'新的一天开始了', emoji:'🌈', bg:'linear-gradient(135deg,#E91E63,#FF9800)', eps:12 },
    { id:'m3', title:'早起的小鸟', emoji:'🐦', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:18 },
    { id:'m4', title:'晨间好习惯', emoji:'🪥', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:10 },
  ],
  '🧠 认知启蒙': [
    { id:'c1', title:'小皮球在哪里', emoji:'🔴', bg:'linear-gradient(135deg,#E0F7FA,#0097A7)', eps:16 },
    { id:'c2', title:'颜色王国', emoji:'🎨', bg:'linear-gradient(135deg,#F3E5F5,#9C27B0)', eps:12 },
    { id:'c3', title:'数字宝宝', emoji:'🔢', bg:'linear-gradient(135deg,#E8F5E9,#388E3C)', eps:20 },
    { id:'c4', title:'形状大探索', emoji:'🔷', bg:'linear-gradient(135deg,#FFF8E1,#F9A825)', eps:14 },
  ],
  '🌱 成长日常': [
    { id:'l1', title:'小熊学刷牙', emoji:'🐻', bg:'linear-gradient(135deg,#E8F5E9,#4CAF50)', eps:8 },
    { id:'l2', title:'我会自己吃饭', emoji:'🍚', bg:'linear-gradient(135deg,#FFF3E0,#FF9800)', eps:10 },
    { id:'l3', title:'穿衣服真有趣', emoji:'👕', bg:'linear-gradient(135deg,#FCE4EC,#E91E63)', eps:6 },
    { id:'l4', title:'宝宝爱整理', emoji:'🧸', bg:'linear-gradient(135deg,#E3F2FD,#1565C0)', eps:8 },
  ],
  '💛 爱与情感': [
    { id:'e1', title:'小兔子交朋友', emoji:'🐰', bg:'linear-gradient(135deg,#EDE7F6,#7B3FD4)', eps:12 },
    { id:'e2', title:'我有点害怕', emoji:'🌟', bg:'linear-gradient(135deg,#FFF8E1,#FF8F00)', eps:10 },
    { id:'e3', title:'分享真快乐', emoji:'🎁', bg:'linear-gradient(135deg,#FCE4EC,#E91E63)', eps:8 },
    { id:'e4', title:'我爱我的家', emoji:'🏠', bg:'linear-gradient(135deg,#E8F5E9,#2E7D32)', eps:14 },
  ],
}

function LockBadge({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"
      />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default function StoriesPage() {
  const router = useRouter()
  const [ageFilter, setAgeFilter] = useState<AgeGroup | undefined>('L1' as AgeGroup)
  const [showPaywall, setShowPaywall] = useState(false)
  const ageKey = ageFilter ?? 'L1'

  useEffect(() => {
    setLastAgeLevel(ageKey)
  }, [ageKey])

  const filteredStories = ageFilter
    ? MOCK_STORIES.filter(s => s.age_group === ageFilter).slice(0, 2)
    : MOCK_STORIES.slice(0, 2)

  return (
    <div className="phone-shell bg-[#FBF7FF] relative">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">21:01</span>
        <span className="text-sm">📶🔋</span>
      </div>

      {/* 顶部导航栏 */}
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

      <div className="flex px-4 pt-3 border-b border-[#F0E8FF] flex-shrink-0">
        {TABS.map(t => (
          <Link key={t.label} href={t.href}
            className={`flex-1 text-center pb-2.5 text-sm relative cursor-pointer
              ${t.label === '故事' ? 'text-[#E91E63] font-bold' : 'text-[#B0A0C8] font-medium'}`}>
            {t.label}
            {t.label === '故事' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#E91E63] rounded-full"/>
            )}
          </Link>
        ))}
      </div>

      {/* 月龄胶囊Tab */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-3 flex-shrink-0">
        {AGE_OPTIONS.map(opt => {
          const active = ageFilter === opt.value
          return (
            <button key={String(opt.value)} onClick={() => setAgeFilter(opt.value)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all border whitespace-nowrap"
              style={{
                background: active ? '#FCE4EC' : '#fff',
                color: active ? '#E91E63' : '#888',
                borderColor: active ? '#F48FB1' : '#e0e0e0',
              }}>
              {opt.label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">

        {/* 最新上架 */}
        <div className="flex justify-between items-center px-4 pt-2 pb-2">
          <p className="text-[15px] font-extrabold text-[#1A0A2E]">🆕 最新上架</p>
          <Link href="/stories" className="text-xs text-[#7B3FD4]">更多 ›</Link>
        </div>
        <div className="px-4 flex flex-col gap-2.5">
          {/* 爸妈原声推荐卡（第一个，随月龄联动）*/}
          <div onClick={() => router.push(buildVoiceStoryPlayerUrl(VOICE_STORIES[ageFilter ?? 'L1'] ?? VOICE_STORIES['L1'], 'stories'))}
            className="bg-white rounded-2xl p-3 flex gap-3 border-2 border-[#7B3FD4] shadow-md cursor-pointer relative overflow-hidden active:scale-[0.98] transition-transform">
            <div className="w-16 h-16 rounded-[14px] flex-shrink-0 flex items-center justify-center text-3xl"
              style={{ background: VOICE_STORIES[ageFilter ?? 'L1']?.bg ?? 'linear-gradient(135deg,#FCE4EC,#F8BBD0)' }}>
              {VOICE_STORIES[ageFilter ?? 'L1']?.emoji ?? '🌸'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-[#1A0A2E] mb-0.5">{VOICE_STORIES[ageFilter ?? 'L1']?.title ?? '妈妈的怀抱'}</div>
              <div className="text-[11px] text-[#B0A0C8] mb-2">{VOICE_STORIES[ageFilter ?? 'L1']?.scene ?? '睡前故事'} · {AGE_OPTIONS.find(a => a.value === ageFilter)?.label ?? '0-6月'}</div>
              <div className="flex gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                  style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>🎙️ 爸妈原声</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDE7F6] text-[#7B3FD4]">会员专属</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 bg-[#7B3FD4] text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg">
              用你的声音讲
            </div>
          </div>
          {/* 普通故事 */}
          {filteredStories.map(s => (
            <StoryCard key={s.id} story={{ ...s, status: 'published' }} onPaywall={() => {}} listFrom="stories" />
          ))}
        </div>

        {/* 各故事分区 */}
        {Object.entries(SECTIONS).map(([title, items]) => (
          <div key={title}>
            <div className="flex justify-between items-center px-4 pt-5 pb-2">
              <p className="text-[15px] font-extrabold text-[#1A0A2E]">{title}</p>
              <Link href={SECTION_MORE_HREF[title] ?? '/stories'} className="text-xs text-[#7B3FD4]">
                更多 ›
              </Link>
            </div>
            <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar pb-1">
              {items.map((item, idx) => {
                const unlocked = idx === 0
                return (
                  <div
                    key={item.id}
                    onClick={() => (unlocked ? router.push(collectionHref(item.id, 'stories')) : setShowPaywall(true))}
                    className="flex-shrink-0 w-[110px] rounded-[13px] overflow-hidden cursor-pointer border border-[#F0E8FF] active:scale-[0.96] transition-transform">
                    <div
                      className="w-full h-[88px] flex items-center justify-center text-[34px] relative overflow-hidden"
                      style={{ background: item.bg }}>
                      <span className="select-none relative z-0">{item.emoji}</span>
                      <span className="absolute bottom-1 right-1 z-[3] bg-black/40 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md pointer-events-none">
                        共{item.eps}集
                      </span>
                      {unlocked && (
                        <span className="absolute top-1.5 right-1.5 z-[3] bg-[#22C55E] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md leading-none shadow-sm pointer-events-none">
                          可试听
                        </span>
                      )}
                      {!unlocked && (
                        <>
                          <div
                            className="absolute inset-0 z-[1] pointer-events-none"
                            style={{ background: 'rgba(26,10,46,0.45)' }}
                          />
                          <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none text-white drop-shadow-md">
                            <LockBadge />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="p-2 bg-white">
                      <div
                        className={`text-[11px] font-bold truncate ${unlocked ? 'text-[#1A0A2E]' : 'text-[#B0A0C8]'}`}>
                        {item.title}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div style={{ height: 24 }} />
      </div>

      {showPaywall && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowPaywall(false)}>
          <div
            className="w-full max-w-md bg-white rounded-t-[28px] px-5 pt-6 pb-10"
            onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-[#E0D8F0] rounded-full mx-auto mb-5" />
            <div className="text-center mb-5">
              <div className="text-[32px] mb-2">🔓</div>
              <div className="text-[17px] font-black text-[#1A0A2E] mb-1">开通会员解锁全部合集</div>
              <div className="text-[12px] text-[#6B5B8C]">科学分级故事 · 声音克隆 · AI定制</div>
            </div>
            <button
              type="button"
              onClick={() => setShowPaywall(false)}
              className="w-full h-[52px] rounded-full text-white font-extrabold text-[15px] mb-3"
              style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
              立即开通会员
            </button>
            <button type="button" onClick={() => setShowPaywall(false)} className="w-full h-10 text-[#B0A0C8] text-[13px]">
              暂不开通
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
