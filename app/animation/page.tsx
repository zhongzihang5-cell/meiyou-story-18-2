'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { setLastAgeLevel } from '@/lib/searchAgeContext'

const AGE_TABS = [
  { value: 'L1', label: '0-6月' },
  { value: 'L2', label: '6-12月' },
  { value: 'L3', label: '1-1.5岁' },
  { value: 'L4', label: '1.5-2岁' },
  { value: 'L5', label: '2-3岁' },
  { value: 'L6', label: '3岁+' },
]

const CONTENT_BY_AGE: Record<string, {
  nursery: Array<{ id: string, title: string, emoji: string, bg: string, eps: number }>
  story: Array<{ id: string, title: string, emoji: string, bg: string, eps: number }>
  smart: Array<{ id: string, title: string, emoji: string, bg: string, eps: number }>
  classic: Array<{ id: string, title: string, emoji: string, bg: string, eps: number }>
}> = {
  'L1': {
    nursery: [
      { id:'an1', title:'贝瓦经典儿歌', emoji:'🐿️', bg:'linear-gradient(135deg,#F57F17,#FFC107)', eps:10 },
      { id:'an2', title:'亲宝儿歌之运动', emoji:'🐕', bg:'linear-gradient(135deg,#81D4FA,#0288D1)', eps:20 },
      { id:'an3', title:'潮流新儿歌', emoji:'🎤', bg:'linear-gradient(135deg,#6A1B9A,#BA68C8)', eps:10 },
      { id:'an4', title:'火火兔儿歌', emoji:'🐰', bg:'linear-gradient(135deg,#FF8F00,#FFC107)', eps:25 },
    ],
    story: [
      { id:'an5', title:'小猫汤米', emoji:'🐱', bg:'linear-gradient(135deg,#FF6B6B,#FF8E53)', eps:24 },
      { id:'an6', title:'豆小鸭迷你冒险', emoji:'🐥', bg:'linear-gradient(135deg,#F7DC6F,#F39C12)', eps:18 },
      { id:'an7', title:'超级飞侠', emoji:'✈️', bg:'linear-gradient(135deg,#5DADE2,#2E86C1)', eps:32 },
      { id:'an8', title:'小猪佩奇', emoji:'🐷', bg:'linear-gradient(135deg,#F1948A,#E74C3C)', eps:26 },
    ],
    smart: [
      { id:'an9', title:'宝宝巴士认知', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:12 },
      { id:'an10', title:'小小探索家', emoji:'🔭', bg:'linear-gradient(135deg,#6A1B9A,#AB47BC)', eps:18 },
      { id:'an11', title:'哼哼哼超人气早教', emoji:'🐩', bg:'linear-gradient(135deg,#FF8F00,#FFA726)', eps:30 },
      { id:'an12', title:'宝宝律动舞蹈', emoji:'🐼', bg:'linear-gradient(135deg,#E91E63,#F48FB1)', eps:14 },
    ],
    classic: [
      { id:'an13', title:'古诗里的小百科', emoji:'🦜', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:20 },
      { id:'an14', title:'宝宝巴士古诗国学', emoji:'🐼', bg:'linear-gradient(135deg,#E91E63,#F48FB1)', eps:10 },
      { id:'an15', title:'宝宝巴士儿歌', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:53 },
      { id:'an16', title:'宝宝巴士上学歌', emoji:'🚌', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:14 },
    ],
  },
  'L2': {
    nursery: [
      { id:'b1', title:'我想长大', emoji:'🐻', bg:'linear-gradient(135deg,#1A237E,#3949AB)', eps:10 },
      { id:'b2', title:'宝宝最爱动物儿歌', emoji:'🐷', bg:'linear-gradient(135deg,#E8F5E9,#388E3C)', eps:19 },
      { id:'b3', title:'亲宝儿歌运动歌', emoji:'🐕', bg:'linear-gradient(135deg,#81D4FA,#0288D1)', eps:20 },
      { id:'b4', title:'贝瓦经典儿歌', emoji:'🐿️', bg:'linear-gradient(135deg,#F57F17,#FFC107)', eps:10 },
    ],
    story: [
      { id:'b5', title:'小猪佩奇', emoji:'🐷', bg:'linear-gradient(135deg,#F1948A,#E74C3C)', eps:26 },
      { id:'b6', title:'超级飞侠', emoji:'✈️', bg:'linear-gradient(135deg,#5DADE2,#2E86C1)', eps:32 },
      { id:'b7', title:'小猫汤米', emoji:'🐱', bg:'linear-gradient(135deg,#FF6B6B,#FF8E53)', eps:24 },
      { id:'b8', title:'豆小鸭冒险', emoji:'🐥', bg:'linear-gradient(135deg,#F7DC6F,#F39C12)', eps:18 },
    ],
    smart: [
      { id:'b9', title:'哼哼哼超人气早教', emoji:'🐩', bg:'linear-gradient(135deg,#FF8F00,#FFA726)', eps:30 },
      { id:'b10', title:'祖蓝亲子健康操', emoji:'🤸', bg:'linear-gradient(135deg,#81D4FA,#0288D1)', eps:7 },
      { id:'b11', title:'宝宝巴士认知', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:12 },
      { id:'b12', title:'小小探索家', emoji:'🔭', bg:'linear-gradient(135deg,#6A1B9A,#AB47BC)', eps:18 },
    ],
    classic: [
      { id:'b13', title:'宝宝巴士古诗国学', emoji:'🐼', bg:'linear-gradient(135deg,#E91E63,#F48FB1)', eps:10 },
      { id:'b14', title:'古诗里的小百科', emoji:'🦜', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:20 },
      { id:'b15', title:'宝宝巴士儿歌', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:53 },
      { id:'b16', title:'宝宝上学歌', emoji:'🚌', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:14 },
    ],
  },
  'L3': {
    nursery: [
      { id:'c1', title:'火火兔儿歌', emoji:'🐰', bg:'linear-gradient(135deg,#FF8F00,#FFC107)', eps:25 },
      { id:'c2', title:'潮流新儿歌', emoji:'🎤', bg:'linear-gradient(135deg,#6A1B9A,#BA68C8)', eps:10 },
      { id:'c3', title:'宝宝巴士儿歌', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:53 },
      { id:'c4', title:'我想长大', emoji:'🐻', bg:'linear-gradient(135deg,#1A237E,#3949AB)', eps:10 },
    ],
    story: [
      { id:'c5', title:'超级飞侠', emoji:'✈️', bg:'linear-gradient(135deg,#5DADE2,#2E86C1)', eps:32 },
      { id:'c6', title:'小猪佩奇', emoji:'🐷', bg:'linear-gradient(135deg,#F1948A,#E74C3C)', eps:26 },
      { id:'c7', title:'豆小鸭冒险', emoji:'🐥', bg:'linear-gradient(135deg,#F7DC6F,#F39C12)', eps:18 },
      { id:'c8', title:'小猫汤米', emoji:'🐱', bg:'linear-gradient(135deg,#FF6B6B,#FF8E53)', eps:24 },
    ],
    smart: [
      { id:'c9', title:'祖蓝亲子健康操', emoji:'🤸', bg:'linear-gradient(135deg,#81D4FA,#0288D1)', eps:7 },
      { id:'c10', title:'哼哼哼超人气早教', emoji:'🐩', bg:'linear-gradient(135deg,#FF8F00,#FFA726)', eps:30 },
      { id:'c11', title:'小小探索家', emoji:'🔭', bg:'linear-gradient(135deg,#6A1B9A,#AB47BC)', eps:18 },
      { id:'c12', title:'宝宝巴士认知', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:12 },
    ],
    classic: [
      { id:'c13', title:'古诗里的小百科', emoji:'🦜', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:20 },
      { id:'c14', title:'宝宝巴士古诗国学', emoji:'🐼', bg:'linear-gradient(135deg,#E91E63,#F48FB1)', eps:10 },
      { id:'c15', title:'宝宝上学歌', emoji:'🚌', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:14 },
      { id:'c16', title:'宝宝巴士儿歌', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:53 },
    ],
  },
  'L4': {
    nursery: [
      { id:'d1', title:'宝宝最爱动物儿歌', emoji:'🐷', bg:'linear-gradient(135deg,#E8F5E9,#388E3C)', eps:19 },
      { id:'d2', title:'贝瓦经典儿歌', emoji:'🐿️', bg:'linear-gradient(135deg,#F57F17,#FFC107)', eps:10 },
      { id:'d3', title:'火火兔儿歌', emoji:'🐰', bg:'linear-gradient(135deg,#FF8F00,#FFC107)', eps:25 },
      { id:'d4', title:'潮流新儿歌', emoji:'🎤', bg:'linear-gradient(135deg,#6A1B9A,#BA68C8)', eps:10 },
    ],
    story: [
      { id:'d5', title:'小猫汤米', emoji:'🐱', bg:'linear-gradient(135deg,#FF6B6B,#FF8E53)', eps:24 },
      { id:'d6', title:'超级飞侠', emoji:'✈️', bg:'linear-gradient(135deg,#5DADE2,#2E86C1)', eps:32 },
      { id:'d7', title:'小猪佩奇', emoji:'🐷', bg:'linear-gradient(135deg,#F1948A,#E74C3C)', eps:26 },
      { id:'d8', title:'豆小鸭冒险', emoji:'🐥', bg:'linear-gradient(135deg,#F7DC6F,#F39C12)', eps:18 },
    ],
    smart: [
      { id:'d9', title:'宝宝巴士认知', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:12 },
      { id:'d10', title:'祖蓝亲子健康操', emoji:'🤸', bg:'linear-gradient(135deg,#81D4FA,#0288D1)', eps:7 },
      { id:'d11', title:'哼哼哼超人气早教', emoji:'🐩', bg:'linear-gradient(135deg,#FF8F00,#FFA726)', eps:30 },
      { id:'d12', title:'小小探索家', emoji:'🔭', bg:'linear-gradient(135deg,#6A1B9A,#AB47BC)', eps:18 },
    ],
    classic: [
      { id:'d13', title:'宝宝巴士古诗国学', emoji:'🐼', bg:'linear-gradient(135deg,#E91E63,#F48FB1)', eps:10 },
      { id:'d14', title:'古诗里的小百科', emoji:'🦜', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:20 },
      { id:'d15', title:'宝宝律动舞蹈', emoji:'🐼', bg:'linear-gradient(135deg,#E91E63,#F48FB1)', eps:14 },
      { id:'d16', title:'宝宝上学歌', emoji:'🚌', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:14 },
    ],
  },
  'L5': {
    nursery: [
      { id:'e1', title:'我想长大', emoji:'🐻', bg:'linear-gradient(135deg,#1A237E,#3949AB)', eps:10 },
      { id:'e2', title:'宝宝巴士儿歌', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:53 },
      { id:'e3', title:'贝瓦经典儿歌', emoji:'🐿️', bg:'linear-gradient(135deg,#F57F17,#FFC107)', eps:10 },
      { id:'e4', title:'火火兔儿歌', emoji:'🐰', bg:'linear-gradient(135deg,#FF8F00,#FFC107)', eps:25 },
    ],
    story: [
      { id:'e5', title:'豆小鸭冒险', emoji:'🐥', bg:'linear-gradient(135deg,#F7DC6F,#F39C12)', eps:18 },
      { id:'e6', title:'小猪佩奇', emoji:'🐷', bg:'linear-gradient(135deg,#F1948A,#E74C3C)', eps:26 },
      { id:'e7', title:'超级飞侠', emoji:'✈️', bg:'linear-gradient(135deg,#5DADE2,#2E86C1)', eps:32 },
      { id:'e8', title:'小猫汤米', emoji:'🐱', bg:'linear-gradient(135deg,#FF6B6B,#FF8E53)', eps:24 },
    ],
    smart: [
      { id:'e9', title:'小小探索家', emoji:'🔭', bg:'linear-gradient(135deg,#6A1B9A,#AB47BC)', eps:18 },
      { id:'e10', title:'哼哼哼超人气早教', emoji:'🐩', bg:'linear-gradient(135deg,#FF8F00,#FFA726)', eps:30 },
      { id:'e11', title:'宝宝律动舞蹈', emoji:'🐼', bg:'linear-gradient(135deg,#E91E63,#F48FB1)', eps:14 },
      { id:'e12', title:'祖蓝亲子健康操', emoji:'🤸', bg:'linear-gradient(135deg,#81D4FA,#0288D1)', eps:7 },
    ],
    classic: [
      { id:'e13', title:'古诗里的小百科', emoji:'🦜', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:20 },
      { id:'e14', title:'宝宝巴士古诗国学', emoji:'🐼', bg:'linear-gradient(135deg,#E91E63,#F48FB1)', eps:10 },
      { id:'e15', title:'宝宝上学歌', emoji:'🚌', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:14 },
      { id:'e16', title:'宝宝巴士认知', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:12 },
    ],
  },
  'L6': {
    nursery: [
      { id:'f1', title:'潮流新儿歌', emoji:'🎤', bg:'linear-gradient(135deg,#6A1B9A,#BA68C8)', eps:10 },
      { id:'f2', title:'我想长大', emoji:'🐻', bg:'linear-gradient(135deg,#1A237E,#3949AB)', eps:10 },
      { id:'f3', title:'宝宝最爱动物儿歌', emoji:'🐷', bg:'linear-gradient(135deg,#E8F5E9,#388E3C)', eps:19 },
      { id:'f4', title:'贝瓦经典儿歌', emoji:'🐿️', bg:'linear-gradient(135deg,#F57F17,#FFC107)', eps:10 },
    ],
    story: [
      { id:'f5', title:'超级飞侠', emoji:'✈️', bg:'linear-gradient(135deg,#5DADE2,#2E86C1)', eps:32 },
      { id:'f6', title:'小猫汤米', emoji:'🐱', bg:'linear-gradient(135deg,#FF6B6B,#FF8E53)', eps:24 },
      { id:'f7', title:'豆小鸭冒险', emoji:'🐥', bg:'linear-gradient(135deg,#F7DC6F,#F39C12)', eps:18 },
      { id:'f8', title:'小猪佩奇', emoji:'🐷', bg:'linear-gradient(135deg,#F1948A,#E74C3C)', eps:26 },
    ],
    smart: [
      { id:'f9', title:'哼哼哼超人气早教', emoji:'🐩', bg:'linear-gradient(135deg,#FF8F00,#FFA726)', eps:30 },
      { id:'f10', title:'小小探索家', emoji:'🔭', bg:'linear-gradient(135deg,#6A1B9A,#AB47BC)', eps:18 },
      { id:'f11', title:'祖蓝亲子健康操', emoji:'🤸', bg:'linear-gradient(135deg,#81D4FA,#0288D1)', eps:7 },
      { id:'f12', title:'宝宝律动舞蹈', emoji:'🐼', bg:'linear-gradient(135deg,#E91E63,#F48FB1)', eps:14 },
    ],
    classic: [
      { id:'f13', title:'古诗里的小百科', emoji:'🦜', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:20 },
      { id:'f14', title:'宝宝巴士古诗国学', emoji:'🐼', bg:'linear-gradient(135deg,#E91E63,#F48FB1)', eps:10 },
      { id:'f15', title:'宝宝上学歌', emoji:'🚌', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:14 },
      { id:'f16', title:'宝宝巴士儿歌', emoji:'🐼', bg:'linear-gradient(135deg,#F9A825,#FFD54F)', eps:53 },
    ],
  },
}

const SECTION_TITLES: Record<string, string> = {
  nursery: '🎬 儿歌动画',
  story: '📖 故事动画',
  smart: '🧠 益智动画',
  classic: '🏮 国学动画',
}

const TABS = [
  { label: '精选', href: '/featured' },
  { label: '儿歌', href: '/nursery' },
  { label: '动画', href: '/animation' },
  { label: '故事', href: '/stories' },
  { label: '识字', href: '/literacy' },
]

export default function AnimationPage() {
  const [ageFilter, setAgeFilter] = useState('L1')
  const router = useRouter()
  const content = CONTENT_BY_AGE[ageFilter] ?? CONTENT_BY_AGE['L1']

  useEffect(() => {
    setLastAgeLevel(ageFilter)
  }, [ageFilter])

  return (
    <div className="phone-shell bg-[#FBF7FF]">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">17:55</span>
        <span className="text-sm">📶🔋</span>
      </div>
      <div className="px-4 pb-0 flex-shrink-0 select-none touch-manipulation active:bg-[#FBF7FF]" onClick={() => router.push(`/search?from=animation&age=${encodeURIComponent(ageFilter)}`)} style={{ cursor: 'pointer' }}>
        <div className="flex-1 h-10 bg-[#F0EAF8] rounded-full flex items-center gap-2 px-4 text-[#B0A0C8] text-sm pointer-events-none">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          搜索动画
        </div>
      </div>
      <div className="flex px-4 pt-3 border-b border-[#F0F0F0] flex-shrink-0">
        {TABS.map(t => (
          <Link key={t.label} href={t.href}
            className={`flex-1 text-center pb-2.5 text-sm relative cursor-pointer
              ${t.label === '动画' ? 'text-[#E91E63] font-bold' : 'text-[#B0A0C8] font-medium'}`}>
            {t.label}
            {t.label === '动画' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#E91E63] rounded-full" />
            )}
          </Link>
        ))}
      </div>

      {/* 月龄胶囊Tab */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-3 flex-shrink-0">
        {AGE_TABS.map(opt => (
          <button key={opt.value+opt.label} onClick={() => setAgeFilter(opt.value)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all border whitespace-nowrap"
            style={{
              background: ageFilter===opt.value ? '#FCE4EC' : '#fff',
              color: ageFilter===opt.value ? '#E91E63' : '#888',
              borderColor: ageFilter===opt.value ? '#F48FB1' : '#e0e0e0',
            }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* 内容分区，每区16:9横向4个卡片 */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {Object.entries(content).map(([key, items]) => (
          <div key={key}>
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
              <p className="text-[15px] font-extrabold text-[#1A0A2E]">{SECTION_TITLES[key]}</p>
              {key === 'story' ? (
                <Link href="/category/animation" className="text-xs text-[#7B3FD4]">
                  更多 ›
                </Link>
              ) : (
                <span className="text-xs text-[#B0A0C8]">更多 ›</span>
              )}
            </div>
            <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar pb-1">
              {items.map(item => (
                <div key={item.id}
                  onClick={() => router.push(`/player-video?title=${encodeURIComponent(item.title)}`)}
                  className="flex-shrink-0 w-[150px] rounded-[10px] overflow-hidden cursor-pointer border border-[#F0E8FF] active:scale-[0.96] transition-transform">
                  <div className="w-full relative flex items-center justify-center text-[28px]"
                    style={{ aspectRatio:'16/9', background: item.bg }}>
                    {item.emoji}
                    <span className="absolute bottom-1 right-1 bg-black/40 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">共{item.eps}集</span>
                  </div>
                  <div className="p-2 bg-white">
                    <div className="text-[11px] font-bold text-[#1A0A2E] truncate">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
