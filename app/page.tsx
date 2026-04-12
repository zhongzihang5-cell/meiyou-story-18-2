'use client'
import Link from 'next/link'
import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import {
  Bath,
  BookOpen,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cloud,
  Coins,
  Home,
  Mail,
  Mic,
  Milk,
  Music,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Syringe,
  UserRound,
} from 'lucide-react'

/**
 * 孕育首页壳：布局参考美柚，图标统一用 Lucide。
 * 「儿歌故事」→ /featured；「AI亲声讲」→ /ai-stories（落地页），故事库 → /ai-stories/browse
 */

const MEIYOU_PINK = '#FF5A7A'
const MEIYOU_PINK_D = '#FF3D6B'

const GRID: { label: string; href?: string; icon: LucideIcon; bg: string; customIcon?: boolean }[] = [
  { label: '喂养记录', icon: Milk, bg: 'linear-gradient(145deg,#FBBF24,#F59E0B)' },
  { label: '在家早教', icon: BookOpen, bg: 'linear-gradient(145deg,#A78BFA,#7C3AED)' },
  { label: '儿歌故事', icon: Music, bg: 'linear-gradient(145deg,#FB923C,#EA580C)', href: '/featured' },
  { label: 'AI亲声讲', icon: Sparkles, bg: 'linear-gradient(145deg,#7B3FD4,#E91E63)', href: '/ai-stories', customIcon: true },
  { label: '收起', icon: ChevronUp, bg: 'linear-gradient(145deg,#E2E8F0,#94A3B8)' },
  { label: '洗沐护理', icon: Bath, bg: 'linear-gradient(145deg,#38BDF8,#0284C7)' },
  { label: '抖音好物', icon: ShoppingBag, bg: 'linear-gradient(145deg,#FB7185,#E11D48)' },
  { label: '问医生', icon: Stethoscope, bg: 'linear-gradient(145deg,#4ADE80,#16A34A)' },
  { label: '云相册', icon: Cloud, bg: 'linear-gradient(145deg,#C084FC,#9333EA)' },
  { label: '疫苗接种', icon: Syringe, bg: 'linear-gradient(145deg,#FCD34D,#D97706)' },
]

const FAMILY = ['爸爸', '外婆', '外公', '奶奶', '爷爷', '其他'] as const

const HERO_IMG =
  'https://images.unsplash.com/photo-1555252333-9f41e040a3df?w=900&q=85&auto=format&fit=crop'
const FEED_IMG =
  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80&auto=format&fit=crop'

function GridTile({ icon: Icon, bg }: { icon: LucideIcon; bg: string }) {
  return (
    <div
      className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      style={{ background: bg }}>
      <Icon className="w-[22px] h-[22px] text-white" strokeWidth={2.25} aria-hidden />
    </div>
  )
}

/** AI亲声讲入口：仅麦克风 + 柔和渐变；VIP 偏右减少遮挡 */
function AiQinShengGridIcon() {
  return (
    <div className="relative w-[48px] h-[48px] flex-shrink-0 overflow-visible">
      <div
        className="relative w-full h-full rounded-[12px] overflow-hidden flex items-center justify-center shadow-[0_2px_10px_rgba(56,189,248,0.22)] ring-1 ring-white/50"
        style={{
          background: 'linear-gradient(165deg,#F8FCFF 0%,#DBEAFE 32%,#93C5FD 70%,#60A5FA 100%)',
        }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 20% 15%, rgba(255,255,255,0.85) 0%, transparent 55%)',
          }}
        />
        <div className="pointer-events-none absolute -bottom-3 -right-2 h-14 w-14 rounded-full bg-sky-300/35 blur-xl" />
        <div className="relative z-[1] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-sky-500/25 ring-1 ring-white/60 shadow-inner">
          <Mic
            className="h-[20px] w-[20px] text-white drop-shadow-[0_1px_2px_rgba(15,23,42,0.2)]"
            strokeWidth={2.15}
            aria-hidden
          />
        </div>
      </div>
      <span
        className="absolute z-10 min-w-[30px] translate-x-2.5 -translate-y-0.5 rounded-full px-1.5 py-1 text-[9px] font-black leading-none tracking-wide text-white shadow-md"
        style={{
          top: 0,
          right: 0,
          background: 'linear-gradient(90deg,#FF6B35 0%,#FF4081 52%,#AB47BC 100%)',
          boxShadow: '0 2px 5px rgba(255,107,53,0.42)',
        }}>
        VIP
      </span>
    </div>
  )
}

export default function MeiyouHomePage() {
  return (
    <div className="phone-shell bg-[#F2F2F7] flex flex-col pb-[52px] overflow-hidden">
      <div className="relative flex-shrink-0 h-[200px]">
        <Image src={HERO_IMG} alt="" fill className="object-cover object-[center_30%]" sizes="375px" priority />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,248,250,0.75) 45%, rgba(255,252,253,0.96) 85%, #fff 100%)',
          }}
        />

        <div className="absolute top-0 left-0 right-0 h-11 px-4 flex justify-between items-end pb-1 z-10">
          <span className="text-[15px] font-semibold text-[#222] tracking-tight">14:34</span>
          <div className="flex items-center gap-1 text-[12px] text-[#333] pr-1">
            <span className="font-semibold">5G</span>
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" className="opacity-85">
              <rect x="0" y="7" width="3" height="5" rx="0.5" />
              <rect x="4" y="5" width="3" height="7" rx="0.5" />
              <rect x="8" y="3" width="3" height="9" rx="0.5" />
              <rect x="12" y="1" width="3" height="11" rx="0.5" />
            </svg>
            <span className="font-semibold ml-0.5">89</span>
            <svg width="22" height="11" viewBox="0 0 24 12" fill="none" className="ml-0.5">
              <rect x="1" y="2" width="18" height="8" rx="2" stroke="#333" strokeWidth="1.2" />
              <rect x="20" y="4.5" width="2" height="3" rx="0.5" fill="#333" />
              <rect x="3" y="4" width="12" height="4" rx="1" fill="#4CAF50" />
            </svg>
          </div>
        </div>

        <div className="absolute top-11 left-0 right-0 px-2.5 flex items-center gap-1 z-10">
          <button type="button" className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#555] shadow-sm">
            <Search className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </button>
          <div className="flex-1 flex justify-center">
            <div className="inline-flex items-center rounded-full p-[3px] bg-black/[0.06] backdrop-blur-sm">
              <span className="px-[18px] py-[5px] rounded-full text-[14px] text-[#666]">妈妈</span>
              <span
                className="px-[18px] py-[5px] rounded-full text-[14px] font-semibold text-white shadow-sm"
                style={{ background: `linear-gradient(180deg,${MEIYOU_PINK} 0%,${MEIYOU_PINK_D} 100%)` }}>
                宝宝
              </span>
            </div>
          </div>
          <button type="button" className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#555] shadow-sm relative">
            <Camera className="w-[19px] h-[19px]" strokeWidth={2} />
            <span
              className="absolute -right-0.5 -top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
              style={{ background: MEIYOU_PINK }}>
              <Plus className="w-2.5 h-2.5" strokeWidth={3} />
            </span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-2.5 flex items-center gap-2.5 z-10">
          <div
            className="w-[52px] h-[52px] rounded-full border-[3px] border-white shadow-md overflow-hidden flex-shrink-0"
            style={{ background: 'linear-gradient(180deg,#FFE0EC,#FFB6C8)' }}>
            <div className="w-full h-full flex items-center justify-center text-[28px]">👧</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[17px] font-bold text-[#1a1a1a] leading-tight">宝宝</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[13px] font-medium" style={{ color: MEIYOU_PINK }}>
                第3天
              </span>
              <button type="button" className="p-0.5 text-[#BBB]" aria-label="编辑">
                <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <button
            type="button"
            className="flex-shrink-0 pl-3 pr-2.5 py-1.5 rounded-full text-[13px] font-semibold text-white active:opacity-90 shadow-md"
            style={{ background: `linear-gradient(90deg,${MEIYOU_PINK},${MEIYOU_PINK_D})` }}>
            邀请亲友
            <span className="opacity-90 ml-0.5">›</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 bg-[#F2F2F7]">
        <div className="mx-3 -mt-1 relative z-[5] rounded-[14px] overflow-hidden shadow-[0_4px_14px_rgba(255,120,60,0.35)]">
          <div
            className="px-3.5 py-3 text-white"
            style={{ background: 'linear-gradient(135deg,#FF9A4D 0%,#FF7A3D 40%,#FF6B35 100%)' }}>
            <div className="flex items-center justify-between">
              <ChevronLeft className="w-4 h-4 text-white/90" strokeWidth={2.5} />
              <span className="text-[15px] font-bold tracking-wide">今天（4月2日）</span>
              <ChevronRight className="w-4 h-4 text-white/90" strokeWidth={2.5} />
            </div>
            <p className="text-[12px] leading-[1.65] mt-2.5 opacity-[0.96] pr-1">
              宝宝变化：我应该已经进行了一次排尿了，如果宝宝尿量、颜色异常请及时咨询医生。
            </p>
          </div>
        </div>

        <div className="mx-3 mt-2.5 bg-white rounded-[14px] px-2 pt-4 pb-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-5 gap-y-5">
            {GRID.map(item =>
              item.href ? (
                <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1.5 active:opacity-80">
                  {item.customIcon ? <AiQinShengGridIcon /> : <GridTile icon={item.icon} bg={item.bg} />}
                  <span className="text-[10px] text-[#333] text-center font-medium leading-[1.2] px-0.5">{item.label}</span>
                </Link>
              ) : (
                <button key={item.label} type="button" className="flex flex-col items-center gap-1.5 active:scale-[0.97]">
                  <GridTile icon={item.icon} bg={item.bg} />
                  <span className="text-[10px] text-[#444] text-center font-medium leading-[1.2] px-0.5">{item.label}</span>
                </button>
              ),
            )}
          </div>
        </div>

        <div className="mx-3 mt-2.5 bg-white rounded-[14px] px-3 py-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="text-[14px] font-bold text-[#222] leading-snug">全家共享娃记录，今天就去邀请</div>
          <div className="flex justify-between mt-3.5 px-0.5">
            {FAMILY.map(role => (
              <div key={role} className="flex flex-col items-center gap-1 w-[48px] flex-shrink-0">
                <div className="w-11 h-11 rounded-full border border-dashed border-[#DDD] bg-[#FAFAFA] flex items-center justify-center text-[#CCC] text-xl font-light leading-none">
                  +
                </div>
                <span className="text-[10px] text-[#888] text-center scale-90 origin-top">{role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-3 mt-3 mb-3 relative pb-20">
          <div className="flex gap-2">
            <div className="flex flex-col items-center w-[18px] flex-shrink-0 pt-0.5">
              <div className="w-2 h-2 rounded-full" style={{ background: MEIYOU_PINK }} />
              <div className="w-[2px] flex-1 min-h-[120px] bg-[#E5E5E5] my-1" />
              <div className="w-2 h-2 rounded-full bg-[#D0D0D0]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold" style={{ color: MEIYOU_PINK }}>
                今天 · 第3天
              </div>
              <div className="relative w-full mt-2 rounded-[10px] overflow-hidden bg-[#EEE] aspect-[4/3]">
                <Image src={FEED_IMG} alt="" fill className="object-cover" sizes="375px" />
              </div>
              <div className="text-[13px] font-bold text-[#AAA] mt-4">昨天 · 第2天</div>
            </div>
          </div>
          <button
            type="button"
            className="absolute bottom-10 right-1 w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 z-10"
            style={{
              background: `linear-gradient(180deg,${MEIYOU_PINK} 0%,${MEIYOU_PINK_D} 100%)`,
              boxShadow: '0 6px 16px rgba(255,70,110,0.45)',
            }}
            aria-label="发布动态">
            <Camera className="w-[26px] h-[26px]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <nav className="phone-shell-tabbar fixed bottom-0 left-0 right-0 mx-auto bg-white/95 backdrop-blur-md border-t border-[#E8E8E8] flex justify-around items-start pt-2 pb-5 px-0.5 z-40">
        <button type="button" className="flex flex-col items-center gap-0.5 w-[56px] relative" style={{ color: MEIYOU_PINK }}>
          <Home className="w-6 h-6" strokeWidth={2} style={{ color: MEIYOU_PINK }} />
          <span className="text-[10px] font-bold" style={{ color: MEIYOU_PINK }}>
            美柚
          </span>
        </button>
        <button type="button" className="flex flex-col items-center gap-0.5 w-[56px] text-[#B0B0B0]">
          <div className="relative inline-flex">
            <CalendarDays className="w-6 h-6" strokeWidth={2} />
            <span
              className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-[3px] rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: MEIYOU_PINK }}>
              2
            </span>
          </div>
          <span className="text-[10px]">记录</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-0.5 w-[56px] text-[#B0B0B0]">
          <Coins className="w-6 h-6" strokeWidth={2} />
          <span className="text-[10px]">返现</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-0.5 w-[56px] text-[#B0B0B0]">
          <div className="relative inline-flex">
            <Mail className="w-6 h-6" strokeWidth={2} />
            <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#FF3B30] text-white text-[9px] font-bold flex items-center justify-center">
              72
            </span>
          </div>
          <span className="text-[10px]">消息</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-0.5 w-[56px] text-[#B0B0B0]">
          <UserRound className="w-6 h-6" strokeWidth={2} />
          <span className="text-[10px]">我</span>
        </button>
      </nav>
    </div>
  )
}
