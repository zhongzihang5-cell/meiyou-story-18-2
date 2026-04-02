'use client'
import Link from 'next/link'

/**
 * 美柚风格外框架首页：仅「儿歌故事」进入儿歌/故事/动画/识字等业务（/featured）。
 */
const GRID_ITEMS: {
  label: string
  emoji: string
  bg: string
  href?: string
}[] = [
  { label: '喂养记录', emoji: '🍼', bg: 'linear-gradient(180deg,#FFF9C4,#FFE082)' },
  { label: '在家早教', emoji: '🧸', bg: 'linear-gradient(180deg,#E1F5FE,#81D4FA)' },
  { label: '儿歌故事', emoji: '🎵', bg: 'linear-gradient(180deg,#FFB74D,#FF9800)', href: '/featured' },
  { label: '记身高体重', emoji: '📏', bg: 'linear-gradient(180deg,#F8BBD0,#F48FB1)' },
  { label: '收起', emoji: '⌄', bg: 'linear-gradient(180deg,#ECEFF1,#CFD8DC)' },
  { label: '洗沐护理', emoji: '🛁', bg: 'linear-gradient(180deg,#B2EBF2,#4DD0E1)' },
  { label: '抖音好物', emoji: '🛍️', bg: 'linear-gradient(180deg,#FFCCBC,#FF8A65)' },
  { label: '问医生', emoji: '👩‍⚕️', bg: 'linear-gradient(180deg,#C8E6C9,#81C784)' },
  { label: '云相册', emoji: '☁️', bg: 'linear-gradient(180deg,#D1C4E9,#B39DDB)' },
  { label: '疫苗接种', emoji: '💉', bg: 'linear-gradient(180deg,#FFECB3,#FFC107)' },
]

export default function MeiyouHomePage() {
  return (
    <div className="phone-shell bg-[#EFEFF4] flex flex-col min-h-[844px] pb-[56px]">
      <div className="h-12 px-5 flex justify-between items-center pt-3 flex-shrink-0 bg-white">
        <span className="text-[15px] font-semibold text-[#1A1A1A]">14:34</span>
        <span className="text-[12px] text-[#888]">📶 🔋</span>
      </div>

      <div className="bg-white px-3 pb-2 flex items-center gap-2 flex-shrink-0 border-b border-[#F0F0F0]">
        <button type="button" className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666]">
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
        <div className="flex-1 flex justify-center">
          <div className="inline-flex rounded-full p-0.5 bg-[#F5F5F5]">
            <span className="px-4 py-1 rounded-full text-[13px] text-[#999]">妈妈</span>
            <span className="px-4 py-1 rounded-full text-[13px] font-bold text-white bg-[#FF6B9D] shadow-sm">宝宝</span>
          </div>
        </div>
        <button type="button" className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666]">
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="7" width="16" height="12" rx="2" /><circle cx="12" cy="13" r="2.5" />
          </svg>
        </button>
      </div>

      <div className="bg-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-[#FFE4EC] flex items-center justify-center text-[32px] border-2 border-white shadow-md">
          👶
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-bold text-[#1A1A1A]">宝宝</div>
          <div className="text-[12px] text-[#FF6B9D] font-medium mt-0.5">第 3 天</div>
        </div>
        <button
          type="button"
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold text-white bg-[#FF6B9D] shadow-sm active:opacity-90">
          邀请亲友 ›
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
        <div className="mx-3 mt-3 rounded-[16px] p-3.5 text-white shadow-md"
          style={{ background: 'linear-gradient(135deg,#FF9A56 0%,#FF6B35 50%,#FF8F6B 100%)' }}>
          <div className="text-[13px] font-bold opacity-95">今天（4月2日）</div>
          <div className="text-[12px] leading-relaxed mt-2 opacity-90">
            宝宝小便次数略多别紧张，注意补水与观察；如有不适建议咨询医生。
          </div>
        </div>

        <div className="mx-3 mt-3 bg-white rounded-[16px] p-3 shadow-sm border border-[#F0F0F0]">
          <div className="grid grid-cols-5 gap-y-4 gap-x-1">
            {GRID_ITEMS.map(item =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-1.5 active:opacity-85 transition-opacity">
                  <div
                    className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center text-[22px] shadow-sm"
                    style={{ background: item.bg }}>
                    {item.emoji}
                  </div>
                  <span className="text-[10px] text-center text-[#333] font-medium leading-tight px-0.5">{item.label}</span>
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className="flex flex-col items-center gap-1.5 opacity-85 active:scale-95 transition-transform">
                  <div
                    className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center text-[22px] shadow-sm"
                    style={{ background: item.bg }}>
                    {item.emoji}
                  </div>
                  <span className="text-[10px] text-center text-[#555] font-medium leading-tight px-0.5">{item.label}</span>
                </button>
              ),
            )}
          </div>
        </div>

        <div className="mx-3 mt-3 bg-white rounded-[16px] p-4 shadow-sm border border-[#F0F0F0]">
          <div className="text-[13px] font-bold text-[#1A1A1A] mb-3">全家共享娃记录，今天就去邀请</div>
          <div className="flex justify-between gap-1">
            {['爸爸', '姥姥', '姥爷', '奶奶', '爷爷', '其他'].map(role => (
              <div key={role} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#E0E0E0] flex items-center justify-center text-[#CCC] text-lg">
                  +
                </div>
                <span className="text-[9px] text-[#888] truncate w-full text-center">{role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-3 mt-3 mb-4 relative pb-16">
          <div className="flex gap-3">
            <div className="flex flex-col items-center w-5 flex-shrink-0 pt-1">
              <div className="w-2 h-2 rounded-full bg-[#FF6B9D]" />
              <div className="w-0.5 flex-1 min-h-[48px] bg-[#E8E8E8] my-1" />
              <div className="w-2 h-2 rounded-full bg-[#DDD]" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="text-[12px] font-bold text-[#FF6B9D]">今天 · 第3天</div>
                <div className="mt-2 rounded-[12px] overflow-hidden bg-[#F5F5F5] aspect-[4/3] flex items-center justify-center text-[#CCC] text-[13px]">
                  宝宝动态
                </div>
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#999]">昨天 · 第2天</div>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#FF6B9D] shadow-lg flex items-center justify-center text-white active:scale-95"
            aria-label="拍照">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="6" width="16" height="12" rx="2" /><circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-[#E8E8E8] flex justify-around items-center pt-1.5 pb-6 px-1 z-40">
        {(
          [
            { icon: '🌸', label: '美柚', active: true },
            { icon: '📅', label: '记录', active: false },
            { icon: '💰', label: '返现', active: false },
            { icon: '✉️', label: '消息', active: false, badge: 72 },
            { icon: '👤', label: '我', active: false },
          ] as const
        ).map(item => (
          <button
            key={item.label}
            type="button"
            className={`flex flex-col items-center gap-0.5 min-w-[52px] relative ${item.active ? 'text-[#FF6B9D]' : 'text-[#AAA]'}`}>
            <span className="text-[20px] leading-none">{item.icon}</span>
            <span className={`text-[10px] ${item.active ? 'font-bold' : ''}`}>{item.label}</span>
            {'badge' in item && item.badge != null && (
              <span className="absolute -top-0.5 right-0 min-w-[16px] h-4 px-1 rounded-full bg-[#FF3B30] text-white text-[9px] font-bold flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
