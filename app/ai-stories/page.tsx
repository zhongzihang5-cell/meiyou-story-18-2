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
import { getFavorites, subscribe } from '@/lib/favorites'
import type { FavoriteItem } from '@/lib/favorites'

/** 与 app/stories/page.tsx 一致：每个月龄对应的爸妈原声引导故事 */
const VOICE_STORIES: Record<
  string,
  { id: string; title: string; emoji: string; bg: string; scene: string; duration: string }
> = {
  L1: { id: 'v-l1', title: '月光摇篮曲', emoji: '🌙', bg: 'linear-gradient(135deg,#1a1a3e,#4a1a6e)', scene: '睡前故事', duration: '2:22' },
  L2: { id: 'v-l2', title: '躲猫猫真好玩', emoji: '🙈', bg: 'linear-gradient(135deg,#0d2137,#1a4a6e)', scene: '亲子互动', duration: '2:08' },
  L3: { id: 'v-l3', title: '小熊爱刷牙', emoji: '🐻', bg: 'linear-gradient(135deg,#2d1b4e,#6e1a4a)', scene: '生活习惯', duration: '3:12' },
  L4: { id: 'v-l4', title: '我的好朋友', emoji: '🤝', bg: 'linear-gradient(135deg,#3e2010,#8B4513)', scene: '爱与情感', duration: '3:45' },
  L5: { id: 'v-l5', title: '天为什么会下雨', emoji: '🌧️', bg: 'linear-gradient(135deg,#0d3720,#1a6e4a)', scene: '认知探索', duration: '4:30' },
}

const SECTION_MORE_HREF: Record<string, string> = {
  '🌙 睡前故事': '/category/sleep-story',
  '🌅 晨起故事': '/category/morning-story',
  '🧠 认知启蒙': '/category/cognitive',
  '🌱 成长日常': '/category/life',
  '💛 爱与情感': '/category/emotion',
}

const SECTIONS: Record<string, Array<{ id: string; title: string; emoji: string; bg: string; eps: number }>> = {
  '🌙 睡前故事': [
    { id: '001', title: '睡吧，我的宝贝', emoji: '🌙', bg: 'linear-gradient(135deg,#1a1a3e,#4a1a6e)', eps: 23 },
    { id: '003', title: '和宝贝说晚安', emoji: '⭐', bg: 'linear-gradient(135deg,#0d2137,#1a4a6e)', eps: 23 },
    { id: '002', title: '睡前故事爸爸篇', emoji: '👨', bg: 'linear-gradient(135deg,#2d1b4e,#6e1a4a)', eps: 20 },
    { id: '004', title: '睡前十分钟', emoji: '🐻', bg: 'linear-gradient(135deg,#3e2010,#8B4513)', eps: 24 },
  ],
  '🌅 晨起故事': [
    { id: 'm1', title: '早安宝宝', emoji: '☀️', bg: 'linear-gradient(135deg,#FF8F00,#FFC107)', eps: 15 },
    { id: 'm2', title: '新的一天开始了', emoji: '🌈', bg: 'linear-gradient(135deg,#E91E63,#FF9800)', eps: 12 },
    { id: 'm3', title: '早起的小鸟', emoji: '🐦', bg: 'linear-gradient(135deg,#1565C0,#42A5F5)', eps: 18 },
    { id: 'm4', title: '晨间好习惯', emoji: '🪥', bg: 'linear-gradient(135deg,#2E7D32,#81C784)', eps: 10 },
  ],
  '🧠 认知启蒙': [
    { id: 'c1', title: '小皮球在哪里', emoji: '🔴', bg: 'linear-gradient(135deg,#E0F7FA,#0097A7)', eps: 16 },
    { id: 'c2', title: '颜色王国', emoji: '🎨', bg: 'linear-gradient(135deg,#F3E5F5,#9C27B0)', eps: 12 },
    { id: 'c3', title: '数字宝宝', emoji: '🔢', bg: 'linear-gradient(135deg,#E8F5E9,#388E3C)', eps: 20 },
    { id: 'c4', title: '形状大探索', emoji: '🔷', bg: 'linear-gradient(135deg,#FFF8E1,#F9A825)', eps: 14 },
  ],
  '🌱 成长日常': [
    { id: 'l1', title: '小熊学刷牙', emoji: '🐻', bg: 'linear-gradient(135deg,#E8F5E9,#4CAF50)', eps: 8 },
    { id: 'l2', title: '我会自己吃饭', emoji: '🍚', bg: 'linear-gradient(135deg,#FFF3E0,#FF9800)', eps: 10 },
    { id: 'l3', title: '穿衣服真有趣', emoji: '👕', bg: 'linear-gradient(135deg,#FCE4EC,#E91E63)', eps: 6 },
    { id: 'l4', title: '宝宝爱整理', emoji: '🧸', bg: 'linear-gradient(135deg,#E3F2FD,#1565C0)', eps: 8 },
  ],
  '💛 爱与情感': [
    { id: 'e1', title: '小兔子交朋友', emoji: '🐰', bg: 'linear-gradient(135deg,#EDE7F6,#7B3FD4)', eps: 12 },
    { id: 'e2', title: '我有点害怕', emoji: '🌟', bg: 'linear-gradient(135deg,#FFF8E1,#FF8F00)', eps: 10 },
    { id: 'e3', title: '分享真快乐', emoji: '🎁', bg: 'linear-gradient(135deg,#FCE4EC,#E91E63)', eps: 8 },
    { id: 'e4', title: '我爱我的家', emoji: '🏠', bg: 'linear-gradient(135deg,#E8F5E9,#2E7D32)', eps: 14 },
  ],
}

const LIST_FROM = 'ai-stories' as const

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

/** 与 app/featured/page.tsx 精选轮播一致 */
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

export default function AIStoriesPage() {
  const router = useRouter()
  const [ageFilter, setAgeFilter] = useState<AgeGroup | undefined>('L1' as AgeGroup)
  const [bannerIdx, setBannerIdx] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const ageKey = ageFilter ?? 'L1'
  const banner = BANNERS[bannerIdx]

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setFavorites(getFavorites())
    const unsub = subscribe(() => setFavorites(getFavorites()))
    return unsub
  }, [])

  useEffect(() => {
    setLastAgeLevel(ageKey)
  }, [ageKey])

  const filteredStories = ageFilter
    ? MOCK_STORIES.filter(s => s.age_group === ageFilter).slice(0, 2)
    : MOCK_STORIES.slice(0, 2)

  return (
    <div className="phone-shell bg-[#FBF7FF] flex flex-col min-h-[844px] max-h-[min(844px,calc(100vh-48px))] relative">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">21:09</span>
        <span className="text-sm">📶🔋</span>
      </div>

      <div className="relative flex items-center px-4 py-2 flex-shrink-0" style={{ height: 48 }}>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="absolute left-1 w-9 h-9 flex items-center justify-center text-[#C4B8D8] active:opacity-45"
          aria-label="返回">
          <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="w-full text-center text-[17px] font-bold text-[#1A0A2E]">AI讲故事</div>
        <button
          type="button"
          onClick={() => router.push('/search?from=ai-stories')}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#F0EAF8] absolute right-4"
          aria-label="搜索">
          <svg className="w-5 h-5 text-[#7B3FD4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      {/* 月龄 Tab · 置顶（与精选页样式一致） */}
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
              }}>
              {opt.label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
        {/* 轮播 Banner · 与 app/featured/page.tsx 一致 */}
        <div className="mx-4 mt-3 relative">
          <Link href={banner.btnHref}>
            <div
              className="rounded-[18px] h-[120px] relative overflow-hidden cursor-pointer flex items-center"
              style={{ background: banner.bg }}>
              <div className="absolute top-[-30px] left-[-30px] w-32 h-32 rounded-full opacity-10 bg-white" />
              <div className="absolute bottom-[-20px] left-[40%] w-24 h-24 rounded-full opacity-[0.07] bg-white" />

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
                <span className="bg-white text-[#7B3FD4] text-[11px] font-extrabold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                  {banner.btnText} →
                </span>
              </div>
            </div>
          </Link>

          <div className="flex justify-center gap-1.5 mt-2">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBannerIdx(i)}
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

        <div className="flex justify-between items-center px-4 pt-2 pb-2">
          <p className="text-[15px] font-extrabold text-[#1A0A2E]">🆕 最新上架</p>
          <Link href="/ai-stories" className="text-xs text-[#7B3FD4]">
            更多 ›
          </Link>
        </div>
        <div className="px-4 flex flex-col gap-2.5">
          <div
            onClick={() => router.push(buildVoiceStoryPlayerUrl(VOICE_STORIES[ageFilter ?? 'L1'] ?? VOICE_STORIES.L1, LIST_FROM))}
            className="bg-white rounded-2xl p-3 flex gap-3 border-2 border-[#7B3FD4] shadow-md cursor-pointer relative overflow-hidden active:scale-[0.98] transition-transform">
            <div
              className="w-16 h-16 rounded-[14px] flex-shrink-0 flex items-center justify-center text-3xl"
              style={{ background: VOICE_STORIES[ageFilter ?? 'L1']?.bg ?? 'linear-gradient(135deg,#FCE4EC,#F8BBD0)' }}>
              {VOICE_STORIES[ageFilter ?? 'L1']?.emoji ?? '🌸'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-[#1A0A2E] mb-0.5">
                {VOICE_STORIES[ageFilter ?? 'L1']?.title ?? '妈妈的怀抱'}
              </div>
              <div className="text-[11px] text-[#B0A0C8] mb-2">
                {VOICE_STORIES[ageFilter ?? 'L1']?.scene ?? '睡前故事'} · {AGE_OPTIONS.find(a => a.value === ageFilter)?.label ?? '0-6月'}
              </div>
              <div className="flex gap-1.5">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                  style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
                  🎙️ 爸妈原声
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDE7F6] text-[#7B3FD4]">会员专属</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 bg-[#7B3FD4] text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg">用你的声音讲</div>
          </div>
          {filteredStories.map(s => (
            <StoryCard key={s.id} story={{ ...s, status: 'published' }} onPaywall={() => {}} listFrom={LIST_FROM} />
          ))}
        </div>

        {favorites.length > 0 && (
          <>
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
              <p className="text-[15px] font-extrabold text-[#1A0A2E]">❤️ 我喜欢</p>
              <Link href="#" className="text-xs text-[#7B3FD4]">
                更多 ›
              </Link>
            </div>
            <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar pb-1">
              {favorites.map(item => (
                <div
                  key={item.id}
                  onClick={() =>
                    item.type === 'collection'
                      ? router.push(collectionHref(item.id.replace('col-', ''), LIST_FROM))
                      : router.push(`/player/${item.id}?from=ai-stories`)
                  }
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

        {Object.entries(SECTIONS).map(([title, items]) => (
          <div key={title}>
            <div className="flex justify-between items-center px-4 pt-5 pb-2">
              <p className="text-[15px] font-extrabold text-[#1A0A2E]">{title}</p>
              <Link href={SECTION_MORE_HREF[title] ?? '/ai-stories'} className="text-xs text-[#7B3FD4]">
                更多 ›
              </Link>
            </div>
            <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar pb-1">
              {items.map((item, idx) => {
                const unlocked = idx === 0
                return (
                  <div
                    key={item.id}
                    onClick={() => (unlocked ? router.push(collectionHref(item.id, LIST_FROM)) : setShowPaywall(true))}
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
