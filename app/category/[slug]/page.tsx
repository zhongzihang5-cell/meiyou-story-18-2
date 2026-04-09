'use client'
import { useRouter, notFound } from 'next/navigation'

const CATEGORY_DATA: Record<
  string,
  {
    title: string
    emoji: string
    backTab: string
    backHref: string
    collections: Array<{ id: string; title: string; emoji: string; bg: string; eps: number }>
  }
> = {
  'sleep-story': {
    title: '睡前故事',
    emoji: '🌙',
    backTab: '故事',
    backHref: '/stories',
    collections: [
      { id: '001', title: '睡吧，我的宝贝', emoji: '🌙', bg: 'linear-gradient(135deg,#1a1a3e,#4a1a6e)', eps: 23 },
      { id: '003', title: '和宝贝说晚安', emoji: '⭐', bg: 'linear-gradient(135deg,#0d2137,#1a4a6e)', eps: 23 },
      { id: '002', title: '睡前故事爸爸篇', emoji: '👨', bg: 'linear-gradient(135deg,#2d1b4e,#6e1a4a)', eps: 20 },
      { id: '004', title: '睡前十分钟', emoji: '🐻', bg: 'linear-gradient(135deg,#3e2010,#8B4513)', eps: 24 },
      { id: 'm1', title: '早安宝宝', emoji: '☀️', bg: 'linear-gradient(135deg,#FF8F00,#FFC107)', eps: 15 },
      { id: 'm2', title: '新的一天开始了', emoji: '🌈', bg: 'linear-gradient(135deg,#E91E63,#FF9800)', eps: 12 },
    ],
  },
  'nursery-songs': {
    title: '益智儿歌',
    emoji: '🎵',
    backTab: '儿歌',
    backHref: '/nursery',
    collections: [
      { id: 's1', title: '亲子运动歌', emoji: '🦁', bg: 'linear-gradient(135deg,#7B2D8B,#E91E8C)', eps: 62 },
      { id: 's2', title: '认知学习儿歌', emoji: '🐰', bg: 'linear-gradient(135deg,#1565C0,#42A5F5)', eps: 66 },
      { id: 's3', title: '身体律动歌', emoji: '🎵', bg: 'linear-gradient(135deg,#E91E63,#FF9800)', eps: 40 },
      { id: 's4', title: '习惯养成儿歌', emoji: '🌟', bg: 'linear-gradient(135deg,#2E7D32,#81C784)', eps: 35 },
      { id: 'p1', title: '学礼仪儿歌', emoji: '👧', bg: 'linear-gradient(135deg,#f8bbd0,#f48fb1)', eps: 13 },
      { id: 'p2', title: '学习好习惯', emoji: '🛏️', bg: 'linear-gradient(135deg,#bbdefb,#90caf9)', eps: 14 },
    ],
  },
  animation: {
    title: '热门动画',
    emoji: '🎬',
    backTab: '动画',
    backHref: '/animation',
    collections: [
      { id: 'an1', title: '小猫汤米', emoji: '🐱', bg: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', eps: 24 },
      { id: 'an2', title: '豆小鸭迷你冒险', emoji: '🐥', bg: 'linear-gradient(135deg,#F7DC6F,#F39C12)', eps: 18 },
      { id: 'an3', title: '超级飞侠', emoji: '✈️', bg: 'linear-gradient(135deg,#5DADE2,#2E86C1)', eps: 32 },
      { id: 'an4', title: '小猪佩奇', emoji: '🐷', bg: 'linear-gradient(135deg,#F1948A,#E74C3C)', eps: 26 },
      { id: 'an5', title: '贝瓦经典儿歌', emoji: '🐿️', bg: 'linear-gradient(135deg,#F57F17,#FFC107)', eps: 10 },
      { id: 'an6', title: '宝宝巴士儿歌', emoji: '🐼', bg: 'linear-gradient(135deg,#F9A825,#FFD54F)', eps: 53 },
    ],
  },
  'morning-story': {
    title: '晨起故事',
    emoji: '🌅',
    backTab: '故事',
    backHref: '/stories',
    collections: [
      { id: 'm1', title: '早安宝宝', emoji: '☀️', bg: 'linear-gradient(135deg,#FF8F00,#FFC107)', eps: 15 },
      { id: 'm2', title: '新的一天开始了', emoji: '🌈', bg: 'linear-gradient(135deg,#E91E63,#FF9800)', eps: 12 },
      { id: 'm3', title: '早起的小鸟', emoji: '🐦', bg: 'linear-gradient(135deg,#1565C0,#42A5F5)', eps: 18 },
      { id: 'm4', title: '晨间好习惯', emoji: '🪥', bg: 'linear-gradient(135deg,#2E7D32,#81C784)', eps: 10 },
    ],
  },
  cognitive: {
    title: '认知启蒙',
    emoji: '🧠',
    backTab: '故事',
    backHref: '/stories',
    collections: [
      { id: 'c1', title: '小皮球在哪里', emoji: '🔴', bg: 'linear-gradient(135deg,#E0F7FA,#0097A7)', eps: 16 },
      { id: 'c2', title: '颜色王国', emoji: '🎨', bg: 'linear-gradient(135deg,#F3E5F5,#9C27B0)', eps: 12 },
      { id: 'c3', title: '数字宝宝', emoji: '🔢', bg: 'linear-gradient(135deg,#E8F5E9,#388E3C)', eps: 20 },
      { id: 'c4', title: '形状大探索', emoji: '🔷', bg: 'linear-gradient(135deg,#FFF8E1,#F9A825)', eps: 14 },
    ],
  },
  life: {
    title: '成长日常',
    emoji: '🌱',
    backTab: '故事',
    backHref: '/stories',
    collections: [
      { id: 'l1', title: '小熊学刷牙', emoji: '🐻', bg: 'linear-gradient(135deg,#E8F5E9,#4CAF50)', eps: 8 },
      { id: 'l2', title: '我会自己吃饭', emoji: '🍚', bg: 'linear-gradient(135deg,#FFF3E0,#FF9800)', eps: 10 },
      { id: 'l3', title: '穿衣服真有趣', emoji: '👕', bg: 'linear-gradient(135deg,#FCE4EC,#E91E63)', eps: 6 },
      { id: 'l4', title: '宝宝爱整理', emoji: '🧸', bg: 'linear-gradient(135deg,#E3F2FD,#1565C0)', eps: 8 },
    ],
  },
  emotion: {
    title: '爱与情感',
    emoji: '💛',
    backTab: '故事',
    backHref: '/stories',
    collections: [
      { id: 'e1', title: '小兔子交朋友', emoji: '🐰', bg: 'linear-gradient(135deg,#EDE7F6,#7B3FD4)', eps: 12 },
      { id: 'e2', title: '我有点害怕', emoji: '🌟', bg: 'linear-gradient(135deg,#FFF8E1,#FF8F00)', eps: 10 },
      { id: 'e3', title: '分享真快乐', emoji: '🎁', bg: 'linear-gradient(135deg,#FCE4EC,#E91E63)', eps: 8 },
      { id: 'e4', title: '我爱我的家', emoji: '🏠', bg: 'linear-gradient(135deg,#E8F5E9,#2E7D32)', eps: 14 },
    ],
  },
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const cat = CATEGORY_DATA[params.slug]

  if (!cat) {
    notFound()
  }

  return (
    <div className="phone-shell bg-[#FBF7FF] flex flex-col min-h-[844px]">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">21:09</span>
        <span className="text-sm">📶🔋</span>
      </div>

      <div className="relative flex items-center px-4 pb-3 flex-shrink-0" style={{ height: 48 }}>
        <button
          type="button"
          onClick={() => router.push(cat.backHref)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#EDE7F6] absolute left-4">
          <svg className="w-5 h-5 text-[#7B3FD4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="w-full text-center">
          <div className="text-[16px] font-bold text-[#1A0A2E]">
            {cat.emoji} {cat.title}
          </div>
          <div className="text-[11px] text-[#B0A0C8] mt-0.5">共{cat.collections.length}个合集</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8 min-h-0">
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 pt-2">
          {cat.collections.map(col => (
            <div
              key={col.id}
              onClick={() => router.push(`/collection/${col.id}`)}
              className="cursor-pointer active:scale-[0.96] transition-transform">
              <div
                className="w-full aspect-square rounded-[14px] flex items-center justify-center text-[32px] relative overflow-hidden mb-2"
                style={{ background: col.bg }}>
                {col.emoji}
                <span className="absolute bottom-1 right-1 bg-black/40 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                  共{col.eps}集
                </span>
              </div>
              <div className="text-[12px] font-semibold text-[#1A0A2E] leading-tight">{col.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
