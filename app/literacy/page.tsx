'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LITERACY_CATEGORIES } from '@/lib/literacyThemes'

const TABS = [
  { label: '精选', href: '/featured' },
  { label: '儿歌', href: '/nursery' },
  { label: '动画', href: '/animation' },
  { label: '故事', href: '/stories' },
  { label: '识字', href: '/literacy' },
]

export default function LiteracyPage() {
  const router = useRouter()

  return (
    <div className="phone-shell bg-[#FBF7FF]">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">19:59</span>
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

      <div className="flex px-4 pt-3 border-b border-[#F0F0F0] flex-shrink-0">
        {TABS.map(t => (
          <Link key={t.label} href={t.href}
            className={`flex-1 text-center pb-2.5 text-sm relative cursor-pointer
              ${t.label === '识字' ? 'text-[#E91E63] font-bold' : 'text-[#B0A0C8] font-medium'}`}>
            {t.label}
            {t.label === '识字' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#E91E63] rounded-full"/>
            )}
          </Link>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4">
        <div className="grid grid-cols-3 gap-3 pb-8">
          {LITERACY_CATEGORIES.map(cat => (
            <div key={cat.id}
              onClick={() => router.push(`/literacy/${cat.id}?title=${encodeURIComponent(cat.title)}`)}
              className="cursor-pointer active:scale-[0.96] transition-transform">
              <div className="w-full aspect-square rounded-[16px] flex items-center justify-center text-[40px] border border-[#F0E8FF]"
                style={{ background: cat.cardBg }}>
                {cat.emoji}
              </div>
              <div className="text-[13px] font-semibold text-[#1A0A2E] text-center mt-2">{cat.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
