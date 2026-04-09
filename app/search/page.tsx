'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { isValidAgeLevel, resolveHotSearchTitle, setLastAgeLevel } from '@/lib/searchAgeContext'

const HOT_SEARCHES = [
  { label: '睡前故事', hot: true },
  { label: '童谣', hot: true },
  { label: '宝宝爱听的儿歌', hot: true },
  { label: '两只老虎', hot: false },
  { label: '小兔子乖乖', hot: false },
]

const RANKINGS = [
  '下雨', '舒缓钢琴曲 作者:注意…', '虫儿飞', 'The Wings Of Ikarus',
  '午后休闲时光', '春天在哪里', '拔萝卜', 'All Night，All Day',
  '夜晚', '白龙马', '风声', '葫芦娃', '两只老虎', '茉莉花',
  '别看我只是一只羊', '大头儿子和小头爸爸', '爱的纪念', '今天我请客',
  'Tim S Lullaby', '采蘑菇的小姑娘',
]

const STORY_RESULTS = [
  { id: '001', title: '小星星说话了', scene: '睡前故事', age: '0-6月', emoji: '🌟', bg: 'linear-gradient(135deg,#FFF8E1,#FFE0B2)' },
  { id: '003', title: '妈妈的怀抱', scene: '睡前故事', age: '0-6月', emoji: '🌸', bg: 'linear-gradient(135deg,#FCE4EC,#F8BBD0)' },
  { id: '026', title: '叮咚叮咚的声音', scene: '亲子互动', age: '0-6月', emoji: '🎵', bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)' },
  { id: '051', title: '小皮球在哪里', scene: '认知探索', age: '6-12月', emoji: '🔴', bg: 'linear-gradient(135deg,#E0F7FA,#B2EBF2)' },
]

/** 与各 Tab 搜索条文案一致；直接打开 /search 时用默认 */
const PLACEHOLDER_BY_FROM: Record<string, string> = {
  featured: '白噪音',
  nursery: '搜索儿歌',
  animation: '搜索动画',
  stories: '搜索故事',
  literacy: '搜索识字',
  'ai-stories': '搜索故事',
}

const DEFAULT_PLACEHOLDER = '睡前故事'

function SearchPageBody({
  inputPlaceholder,
  ageQuery,
}: {
  inputPlaceholder: string
  /** ?age=L1…L6，与主 Tab 月龄一致 */
  ageQuery: string | null
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (isValidAgeLevel(ageQuery)) setLastAgeLevel(ageQuery)
  }, [ageQuery])

  const hotSectionTitle = useMemo(() => resolveHotSearchTitle(ageQuery), [ageQuery])

  const filtered = query
    ? STORY_RESULTS.filter(s => s.title.includes(query) || s.scene.includes(query))
    : []

  return (
    <div className="phone-shell bg-[#FBF7FF]">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">10:04</span>
        <span className="text-sm">📶🔋</span>
      </div>

      {/* 搜索栏 — 与主 Tab 药丸样式一致 */}
      <div className="px-4 flex items-center gap-3 pb-3 flex-shrink-0">
        <div className="flex-1 h-10 bg-[#F0EAF8] rounded-full flex items-center gap-2 px-4">
          <svg className="w-4 h-4 text-[#B0A0C8] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={inputPlaceholder}
            className="flex-1 bg-transparent text-[14px] text-[#1A0A2E] outline-none placeholder:text-[#B0A0C8]"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-[#999]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" opacity="0.3"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2"/>
              </svg>
            </button>
          )}
        </div>
        <button type="button" onClick={() => router.back()} className="text-[14px] text-[#666] flex-shrink-0">
          取消
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        {query && filtered.length > 0 && (
          <div className="mb-6">
            {filtered.map(s => (
              <div key={s.id}
                onClick={() => router.push(`/player/${s.id}`)}
                className="flex items-center gap-3 py-3 border-b border-[#F0F0F0] cursor-pointer active:bg-[#F5F0FF]">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl"
                  style={{ background: s.bg }}>{s.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-[#1A0A2E] truncate">{s.title}</div>
                  <div className="text-[12px] text-[#999] mt-0.5">{s.scene} · {s.age}</div>
                </div>
                <svg className="w-4 h-4 text-[#CCC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>
        )}

        {query && filtered.length === 0 && (
          <div className="text-center py-12 text-[#999] text-[14px]">没有找到「{query}」相关内容</div>
        )}

        {!query && (
          <>
            <div className="mb-6">
              <div className="text-[15px] font-bold text-[#1A0A2E] mb-3">
                {hotSectionTitle}
              </div>
              <div className="flex flex-wrap gap-2">
                {HOT_SEARCHES.map((item) => (
                  <button key={item.label} type="button"
                    onClick={() => setQuery(item.label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-semibold"
                    style={{
                      background: item.hot ? '#FFF0F5' : '#F5F5F5',
                      borderColor: item.hot ? '#F48FB1' : '#E0E0E0',
                      color: item.hot ? '#E91E63' : '#666',
                    }}>
                    {item.hot && <span className="text-[#E91E63]">🔥</span>}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[15px] font-bold text-[#1A0A2E] mb-3">排行榜</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {RANKINGS.map((name, i) => (
                  <button key={`${name}-${i}`} type="button"
                    onClick={() => setQuery(name)}
                    className="flex items-center gap-3 text-left">
                    <span className="text-[14px] font-bold w-5 flex-shrink-0"
                      style={{ color: i < 3 ? '#E91E63' : '#999' }}>
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-[#1A0A2E] truncate">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SearchPageWithParams() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? ''
  const inputPlaceholder = PLACEHOLDER_BY_FROM[from] ?? DEFAULT_PLACEHOLDER
  const ageQuery = searchParams.get('age')
  return <SearchPageBody inputPlaceholder={inputPlaceholder} ageQuery={ageQuery} />
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageBody inputPlaceholder={DEFAULT_PLACEHOLDER} ageQuery={null} />}>
      <SearchPageWithParams />
    </Suspense>
  )
}
