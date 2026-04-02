'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collectionHref } from '@/lib/collectionNav'
import { setLastAgeLevel } from '@/lib/searchAgeContext'

// 儿歌内容数据，按月龄分组
const CONTENT_BY_AGE: Record<string, {
  light: Array<{ id: string, title: string, emoji: string, bg: string, eps: number }>
  selected: Array<{ id: string, title: string, emoji: string, bg: string, eps: number }>
  smart: Array<{ id: string, title: string, emoji: string, bg: string, eps: number }>
  character: Array<{ id: string, title: string, emoji: string, bg: string, eps: number }>
}> = {
  'L1': {
    light: [
      { id:'l1', title:'常爸摇篮曲', emoji:'🦉', bg:'linear-gradient(135deg,#1a237e,#283593)', eps:12 },
      { id:'l2', title:'莫扎特音乐', emoji:'🎻', bg:'linear-gradient(135deg,#880e4f,#ad1457)', eps:13 },
      { id:'l3', title:'巴赫音乐', emoji:'🎶', bg:'linear-gradient(135deg,#33691e,#558b2f)', eps:16 },
      { id:'l4', title:'摇篮曲天地', emoji:'👶', bg:'linear-gradient(135deg,#263238,#37474f)', eps:14 },
    ],
    selected: [
      { id:'s1', title:'亲子运动歌', emoji:'🦁', bg:'linear-gradient(135deg,#7B2D8B,#E91E8C)', eps:62 },
      { id:'s2', title:'儿歌欢乐谷', emoji:'🎵', bg:'linear-gradient(135deg,#dcedc8,#558b2f)', eps:40 },
      { id:'s3', title:'学礼仪儿歌', emoji:'👧', bg:'linear-gradient(135deg,#f8bbd0,#f48fb1)', eps:13 },
      { id:'s4', title:'身体律动歌', emoji:'🦁', bg:'linear-gradient(135deg,#f8bbd0,#e91e8c)', eps:40 },
    ],
    smart: [
      { id:'y1', title:'火火兔儿歌', emoji:'🐰', bg:'linear-gradient(135deg,#fff9c4,#f9a825)', eps:34 },
      { id:'y2', title:'认知学习儿歌', emoji:'🦁', bg:'linear-gradient(135deg,#fff9c4,#e65100)', eps:66 },
      { id:'y3', title:'火火兔趣味百科', emoji:'🐰', bg:'linear-gradient(135deg,#c8e6c9,#4caf50)', eps:39 },
      { id:'y4', title:'听出宝宝好性格', emoji:'👶', bg:'linear-gradient(135deg,#f8bbd0,#e91e63)', eps:14 },
    ],
    character: [
      { id:'h1', title:'火火兔习惯养成', emoji:'🐰', bg:'linear-gradient(135deg,#fff3e0,#ff9800)', eps:35 },
      { id:'h2', title:'学习好习惯', emoji:'🛏️', bg:'linear-gradient(135deg,#bbdefb,#1565c0)', eps:14 },
      { id:'h3', title:'火火兔社交情商', emoji:'🐰', bg:'linear-gradient(135deg,#c8e6c9,#2e7d32)', eps:23 },
      { id:'h4', title:'安全教育儿歌', emoji:'👶', bg:'linear-gradient(135deg,#e0e0e0,#757575)', eps:10 },
    ],
  },
  'L2': {
    light: [
      { id:'l5', title:'贝多芬音乐', emoji:'🎹', bg:'linear-gradient(135deg,#4a148c,#6a1b9a)', eps:10 },
      { id:'l6', title:'舒伯特音乐', emoji:'🎼', bg:'linear-gradient(135deg,#e65100,#ef6c00)', eps:13 },
      { id:'l7', title:'古典音乐欣赏', emoji:'🎵', bg:'linear-gradient(135deg,#1a237e,#1565c0)', eps:22 },
      { id:'l8', title:'钢琴名曲特选窗', emoji:'🎹', bg:'linear-gradient(135deg,#212121,#424242)', eps:29 },
    ],
    selected: [
      // 与首页精选页「益智儿歌」区保持封面一致
      { id:'s1', title:'亲子运动歌', emoji:'🦁', bg:'linear-gradient(135deg,#7B2D8B,#E91E8C)', eps:62 },
      { id:'s2', title:'认知学习儿歌', emoji:'🐰', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:66 },
      { id:'s3', title:'身体律动歌', emoji:'🎵', bg:'linear-gradient(135deg,#E91E63,#FF9800)', eps:40 },
      { id:'s4', title:'习惯养成儿歌', emoji:'🌟', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:35 },
    ],
    smart: [
      { id:'y5', title:'火火兔儿歌', emoji:'🐰', bg:'linear-gradient(135deg,#fff9c4,#f9a825)', eps:34 },
      { id:'y6', title:'认知学习儿歌', emoji:'🦁', bg:'linear-gradient(135deg,#fff9c4,#e65100)', eps:66 },
      { id:'y7', title:'亲子运动歌', emoji:'🦁', bg:'linear-gradient(135deg,#7B2D8B,#E91E8C)', eps:62 },
      { id:'y8', title:'火火兔趣味百科', emoji:'🐰', bg:'linear-gradient(135deg,#c8e6c9,#4caf50)', eps:39 },
    ],
    character: [
      { id:'h5', title:'学习好习惯', emoji:'🛏️', bg:'linear-gradient(135deg,#bbdefb,#1565c0)', eps:14 },
      { id:'h6', title:'火火兔习惯养成', emoji:'🐰', bg:'linear-gradient(135deg,#fff3e0,#ff9800)', eps:35 },
      { id:'h7', title:'安全教育儿歌', emoji:'👶', bg:'linear-gradient(135deg,#e0e0e0,#757575)', eps:10 },
      { id:'h8', title:'火火兔社交情商', emoji:'🐰', bg:'linear-gradient(135deg,#c8e6c9,#2e7d32)', eps:23 },
    ],
  },
  'L3': {
    light: [
      { id:'l9', title:'钢琴安眠曲', emoji:'🎹', bg:'linear-gradient(135deg,#1a237e,#3949ab)', eps:15 },
      { id:'l10', title:'自然环境声', emoji:'🌿', bg:'linear-gradient(135deg,#33691e,#689f38)', eps:18 },
      { id:'l11', title:'轻柔纯音乐', emoji:'🎶', bg:'linear-gradient(135deg,#004d40,#00796b)', eps:20 },
      { id:'l12', title:'咖啡馆白噪音', emoji:'☕', bg:'linear-gradient(135deg,#3e2723,#6d4c41)', eps:12 },
    ],
    selected: [
      { id:'s9', title:'亲子律动儿歌', emoji:'🦁', bg:'linear-gradient(135deg,#7B2D8B,#E91E8C)', eps:36 },
      { id:'s10', title:'数数儿歌', emoji:'🔢', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:24 },
      { id:'s11', title:'形状颜色歌', emoji:'🔺', bg:'linear-gradient(135deg,#E91E63,#FF9800)', eps:20 },
      { id:'s12', title:'生活小常识歌', emoji:'🏡', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:18 },
    ],
    smart: [
      { id:'y9', title:'形状颜色儿歌', emoji:'🔺', bg:'linear-gradient(135deg,#e53935,#ffb300)', eps:28 },
      { id:'y10', title:'数字节奏歌', emoji:'🔢', bg:'linear-gradient(135deg,#1e88e5,#42a5f5)', eps:24 },
      { id:'y11', title:'情绪认知儿歌', emoji:'😊', bg:'linear-gradient(135deg,#8e24aa,#ce93d8)', eps:20 },
      { id:'y12', title:'交通安全儿歌', emoji:'🚗', bg:'linear-gradient(135deg,#00695c,#26a69a)', eps:16 },
    ],
    character: [
      { id:'h9', title:'自己收玩具', emoji:'🧸', bg:'linear-gradient(135deg,#ffcc80,#fb8c00)', eps:18 },
      { id:'h10', title:'礼貌用语歌', emoji:'🙋', bg:'linear-gradient(135deg,#7986cb,#5c6bc0)', eps:16 },
      { id:'h11', title:'作息好习惯', emoji:'🛏️', bg:'linear-gradient(135deg,#80cbc4,#26a69a)', eps:14 },
      { id:'h12', title:'爱护牙齿歌', emoji:'🪥', bg:'linear-gradient(135deg,#f48fb1,#ec407a)', eps:12 },
    ],
  },
  'L4': {
    light: [
      { id:'l13', title:'午后轻音乐', emoji:'🎼', bg:'linear-gradient(135deg,#512DA8,#9575CD)', eps:14 },
      { id:'l14', title:'森林白噪音', emoji:'🌲', bg:'linear-gradient(135deg,#1B5E20,#4CAF50)', eps:18 },
      { id:'l15', title:'夏日海浪声', emoji:'🌊', bg:'linear-gradient(135deg,#0277BD,#4FC3F7)', eps:16 },
      { id:'l16', title:'雨滴敲玻璃', emoji:'🌧️', bg:'linear-gradient(135deg,#37474F,#607D8B)', eps:12 },
    ],
    selected: [
      { id:'s13', title:'运动游戏儿歌', emoji:'🤾', bg:'linear-gradient(135deg,#7B2D8B,#E91E8C)', eps:30 },
      { id:'s14', title:'生活技能儿歌', emoji:'🧦', bg:'linear-gradient(135deg,#F9A825,#FFB74D)', eps:22 },
      { id:'s15', title:'数学启蒙儿歌', emoji:'➕', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:20 },
      { id:'s16', title:'自然探索儿歌', emoji:'🦋', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:18 },
    ],
    smart: [
      { id:'y13', title:'英文字母歌', emoji:'🔤', bg:'linear-gradient(135deg,#8E24AA,#CE93D8)', eps:26 },
      { id:'y14', title:'交通工具儿歌', emoji:'🚗', bg:'linear-gradient(135deg,#00695C,#26A69A)', eps:20 },
      { id:'y15', title:'职业认知儿歌', emoji:'👩‍🚒', bg:'linear-gradient(135deg,#EF6C00,#FFB74D)', eps:18 },
      { id:'y16', title:'节日习俗儿歌', emoji:'🎉', bg:'linear-gradient(135deg,#C62828,#FF8A80)', eps:16 },
    ],
    character: [
      { id:'h13', title:'分享与轮流', emoji:'🤲', bg:'linear-gradient(135deg,#FFCC80,#FFB300)', eps:18 },
      { id:'h14', title:'情绪小怪兽', emoji:'👾', bg:'linear-gradient(135deg,#5C6BC0,#3949AB)', eps:16 },
      { id:'h15', title:'守规则儿歌', emoji:'📏', bg:'linear-gradient(135deg,#80CBC4,#26A69A)', eps:14 },
      { id:'h16', title:'爱护环境歌', emoji:'🌍', bg:'linear-gradient(135deg,#AED581,#7CB342)', eps:12 },
    ],
  },
  'L5': {
    light: [
      { id:'l17', title:'钢琴童话曲', emoji:'🎹', bg:'linear-gradient(135deg,#283593,#5C6BC0)', eps:18 },
      { id:'l18', title:'星空冥想声', emoji:'🌌', bg:'linear-gradient(135deg,#311B92,#673AB7)', eps:16 },
      { id:'l19', title:'河流潺潺声', emoji:'🏞️', bg:'linear-gradient(135deg,#00695C,#26A69A)', eps:14 },
      { id:'l20', title:'轻爵士白噪音', emoji:'🎷', bg:'linear-gradient(135deg,#4E342E,#8D6E63)', eps:12 },
    ],
    selected: [
      { id:'s17', title:'故事接龙儿歌', emoji:'📚', bg:'linear-gradient(135deg,#7B1FA2,#E91E63)', eps:24 },
      { id:'s18', title:'逻辑思维儿歌', emoji:'🧩', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:20 },
      { id:'s19', title:'生活自理儿歌', emoji:'🪥', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:18 },
      { id:'s20', title:'科普小知识', emoji:'🔭', bg:'linear-gradient(135deg,#F9A825,#FFB74D)', eps:16 },
    ],
    smart: [
      { id:'y17', title:'拼音启蒙儿歌', emoji:'🔠', bg:'linear-gradient(135deg,#8E24AA,#CE93D8)', eps:26 },
      { id:'y18', title:'时间认知儿歌', emoji:'⏰', bg:'linear-gradient(135deg,#00695C,#26A69A)', eps:18 },
      { id:'y19', title:'地理认知儿歌', emoji:'🗺️', bg:'linear-gradient(135deg,#1976D2,#64B5F6)', eps:16 },
      { id:'y20', title:'科学实验儿歌', emoji:'⚗️', bg:'linear-gradient(135deg,#C62828,#EF5350)', eps:14 },
    ],
    character: [
      { id:'h17', title:'同理心儿歌', emoji:'💞', bg:'linear-gradient(135deg,#FFCCBC,#FF8A65)', eps:16 },
      { id:'h18', title:'团队合作歌', emoji:'🤝', bg:'linear-gradient(135deg,#5C6BC0,#3949AB)', eps:14 },
      { id:'h19', title:'安全意识歌', emoji:'🚧', bg:'linear-gradient(135deg,#90A4AE,#607D8B)', eps:12 },
      { id:'h20', title:'礼貌小绅士', emoji:'🎩', bg:'linear-gradient(135deg,#B39DDB,#7E57C2)', eps:10 },
    ],
  },
  'L6': {
    light: [
      { id:'l21', title:'专注学习乐', emoji:'🎧', bg:'linear-gradient(135deg,#1A237E,#3949AB)', eps:20 },
      { id:'l22', title:'晨起唤醒曲', emoji:'🌅', bg:'linear-gradient(135deg,#F57C00,#FFB74D)', eps:16 },
      { id:'l23', title:'午休放松曲', emoji:'😴', bg:'linear-gradient(135deg,#455A64,#90A4AE)', eps:14 },
      { id:'l24', title:'晚安收心曲', emoji:'🌙', bg:'linear-gradient(135deg,#311B92,#673AB7)', eps:12 },
    ],
    selected: [
      { id:'s21', title:'小学衔接儿歌', emoji:'🏫', bg:'linear-gradient(135deg,#1976D2,#64B5F6)', eps:22 },
      { id:'s22', title:'情境角色儿歌', emoji:'🎭', bg:'linear-gradient(135deg,#8E24AA,#CE93D8)', eps:20 },
      { id:'s23', title:'探索世界儿歌', emoji:'🌍', bg:'linear-gradient(135deg,#2E7D32,#81C784)', eps:18 },
      { id:'s24', title:'数学挑战儿歌', emoji:'➗', bg:'linear-gradient(135deg,#C62828,#EF5350)', eps:16 },
    ],
    smart: [
      { id:'y21', title:'英文单词儿歌', emoji:'📘', bg:'linear-gradient(135deg,#1565C0,#42A5F5)', eps:30 },
      { id:'y22', title:'科学现象儿歌', emoji:'🌈', bg:'linear-gradient(135deg,#43A047,#A5D6A7)', eps:18 },
      { id:'y23', title:'历史故事儿歌', emoji:'🏺', bg:'linear-gradient(135deg,#6D4C41,#A1887F)', eps:16 },
      { id:'y24', title:'逻辑推理儿歌', emoji:'🧠', bg:'linear-gradient(135deg,#5C6BC0,#3949AB)', eps:14 },
    ],
    character: [
      { id:'h21', title:'自信表达歌', emoji:'🎤', bg:'linear-gradient(135deg,#FFB74D,#FB8C00)', eps:14 },
      { id:'h22', title:'时间管理歌', emoji:'📅', bg:'linear-gradient(135deg,#26A69A,#80CBC4)', eps:12 },
      { id:'h23', title:'责任担当歌', emoji:'🧱', bg:'linear-gradient(135deg,#8D6E63,#BCAAA4)', eps:10 },
      { id:'h24', title:'抗挫折儿歌', emoji:'💪', bg:'linear-gradient(135deg,#EC407A,#F48FB1)', eps:10 },
    ],
  },
}


const AGE_TABS = [
  { value: 'L1', label: '0-6月' },
  { value: 'L2', label: '6-12月' },
  { value: 'L3', label: '1-1.5岁' },
  { value: 'L4', label: '1.5-2岁' },
  { value: 'L5', label: '2-3岁' },
  { value: 'L6', label: '3岁+' },
]

const SECTION_TITLES: Record<string, string> = {
  light: '🎵 轻音乐',
  selected: '🎤 精选儿歌',
  smart: '🧠 益智儿歌',
  character: '💛 好性格儿歌',
}

const TABS = [
  { label: '精选', href: '/' },
  { label: '儿歌', href: '/nursery' },
  { label: '动画', href: '/animation' },
  { label: '故事', href: '/stories' },
  { label: '识字', href: '/literacy' },
]

export default function NurseryPage() {
  const [ageFilter, setAgeFilter] = useState('L1')
  const router = useRouter()
  const content = CONTENT_BY_AGE[ageFilter] ?? CONTENT_BY_AGE['L1']

  useEffect(() => {
    setLastAgeLevel(ageFilter)
  }, [ageFilter])

  return (
    <div className="phone-shell bg-[#FBF7FF]">
      {/* Status */}
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">16:36</span>
        <span className="text-sm">📶🔋</span>
      </div>

      {/* Search */}
      <div className="px-4 pb-0 flex-shrink-0 select-none touch-manipulation active:bg-[#FBF7FF]" onClick={() => router.push(`/search?from=nursery&age=${encodeURIComponent(ageFilter)}`)} style={{ cursor: 'pointer' }}>
        <div className="flex-1 h-10 bg-[#F0EAF8] rounded-full flex items-center gap-2 px-4 text-[#B0A0C8] text-sm pointer-events-none">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          搜索儿歌
        </div>
      </div>

      {/* Top tabs */}
      <div className="flex px-4 pt-3 border-b border-[#F0F0F0] flex-shrink-0">
        {TABS.map(t => (
          <Link key={t.label} href={t.href}
            className={`flex-1 text-center pb-2.5 text-sm relative cursor-pointer
              ${t.label==='儿歌' ? 'text-[#E91E63] font-bold' : 'text-[#B0A0C8] font-medium'}`}>
            {t.label}
            {t.label === '儿歌' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#E91E63] rounded-full"/>
            )}
          </Link>
        ))}
      </div>

      {/* 月龄 Tab - 圆角胶囊样式 */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-3 flex-shrink-0">
        {AGE_TABS.map(opt => (
          <button key={opt.value} onClick={() => setAgeFilter(opt.value)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all border"
            style={{
              background: ageFilter === opt.value ? '#FCE4EC' : '#fff',
              color: ageFilter === opt.value ? '#E91E63' : '#888',
              borderColor: ageFilter === opt.value ? '#F48FB1' : '#e0e0e0',
            }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto no-scrollbar">

        {Object.entries(content).map(([key, items]) => (
          <div key={key}>
            {/* 分区标题 */}
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
              <p className="text-[15px] font-extrabold text-[#1A0A2E]">{SECTION_TITLES[key]}</p>
              {key === 'smart' ? (
                <Link href="/category/nursery-songs" className="text-xs text-[#7B3FD4]">
                  更多 ›
                </Link>
              ) : (
                <span className="text-xs text-[#B0A0C8]">更多 ›</span>
              )}
            </div>

            {/* 横向滚动卡片（4个）*/}
            <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar pb-1">
              {items.map(item => (
                <div key={item.id}
                  onClick={() => router.push(collectionHref(item.id, 'nursery'))}
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
          </div>
        ))}

        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
