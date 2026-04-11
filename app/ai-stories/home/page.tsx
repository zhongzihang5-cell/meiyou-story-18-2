'use client'

import { useRouter } from 'next/navigation'
import {
  ALBUM_COVER_STYLES,
  MEMBER_HOME_ALBUM_ITEMS,
  MEMBER_HOME_BABY_LINE,
  MEMBER_HOME_BABY_NAME,
  MEMBER_HOME_FEATURED,
  MEMBER_HOME_KEYWORDS,
  MEMBER_HOME_SLEEP_COUNT,
} from '@/lib/aiQinshengMemberHome'

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AlbumSilhouette({ stroke }: { stroke: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 30 30" fill="none" aria-hidden>
      <circle cx="15" cy="10" r="6" fill="#ffffff" stroke={stroke} strokeWidth="1.2" />
      <path
        d="M6 26c0-5 4-8 9-8s9 3 9 8"
        stroke="#B0A0C8"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * 开通会员 / 完成声音克隆后的 AI 亲声讲首页（内容结构来自 qinsheng-react HomeScreen，视觉用美柚 story 紫粉体系）
 */
export default function AIQinshengMemberHomePage() {
  const router = useRouter()
  const fromQ = '?from=ai-stories-home'

  return (
    <div className="phone-shell flex flex-col bg-[#FBF7FF]">
      <div className="flex h-12 flex-shrink-0 items-center justify-between px-7 pt-3">
        <span className="text-[15px] font-bold text-[#1A0A2E]">10:37</span>
        <span className="text-sm text-[#B0A0C8]">📶🔋</span>
      </div>

      <div className="flex flex-shrink-0 items-center px-5 pb-2 pt-0">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.05] active:opacity-70"
          aria-label="返回">
          <svg className="h-5 w-5 text-[#1A0A2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 text-center text-[16px] font-bold text-[#1A0A2E]">AI亲声讲</div>
        <button
          type="button"
          onClick={() => router.push('/ai-stories/benefits')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E8FF] bg-white text-[#7B3FD4] shadow-[0_2px_8px_rgba(123,63,212,0.08)] active:opacity-80"
          aria-label="菜单">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 4h10M2 7h7M2 10h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-28">
        <div className="mb-5">
          <p className="mb-1 text-[12px] font-semibold tracking-wider text-[#7B3FD4]">AI亲声讲</p>
          <h1 className="text-[22px] font-bold text-[#1A0A2E]">今晚安睡</h1>
        </div>

        {/* 推荐大卡 */}
        <div
          className="relative mb-6 overflow-hidden rounded-[18px] p-4 shadow-[0_8px_28px_rgba(123,63,212,0.18)]"
          style={{
            background: 'linear-gradient(135deg, #7B3FD4 0%, #9B5CF0 45%, #E91E63 100%)',
          }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[13px] font-semibold leading-snug text-white/95">📖 {MEMBER_HOME_BABY_LINE}</p>
              <p className="mb-1.5 text-[18px] font-bold leading-snug text-white">{MEMBER_HOME_FEATURED.title}</p>
              <p className="text-[13px] leading-relaxed text-white/90">{MEMBER_HOME_FEATURED.voiceLine}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/80">{MEMBER_HOME_FEATURED.subLine}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/player/${MEMBER_HOME_FEATURED.playerStoryId}${fromQ}`)}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-[3px] border-white/95 bg-white/20 shadow-[0_6px_20px_rgba(0,0,0,0.12)] backdrop-blur-sm active:scale-95"
              aria-label="播放">
              <svg width="22" height="22" viewBox="0 0 18 18" fill="white" aria-hidden>
                <path d="M5 3l11 6-11 6V3z" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mb-3 text-[14px] leading-relaxed text-[#4A3F5C]">
          想要专属于{MEMBER_HOME_BABY_NAME}的故事？
        </p>

        {/* 专属故事生成 */}
        <div className="mb-5 overflow-hidden rounded-[16px] border border-[#F0E8FF] bg-white shadow-[0_2px_12px_rgba(123,63,212,0.06)]">
          <button
            type="button"
            onClick={() => router.push('/custom-story')}
            className="flex w-full items-start justify-between gap-2 border-0 bg-transparent p-4 text-left active:bg-[#FAF7FF]">
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-[16px] font-bold text-[#1A0A2E]">
                生成{MEMBER_HOME_BABY_NAME}的专属故事
              </p>
              <div className="flex flex-wrap gap-2">
                {MEMBER_HOME_KEYWORDS.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#F0E8FF] bg-[#F5F0FF] px-3.5 py-1.5 text-[13px] font-medium text-[#7B3FD4]">
                    {tag}
                  </span>
                ))}
                <span className="rounded-full border border-dashed border-[#E91E63] bg-[#FFF5F8] px-3.5 py-1.5 text-[13px] font-medium text-[#E91E63]">
                  + 添加
                </span>
              </div>
            </div>
            <ChevronRight className="mt-1 flex-shrink-0 text-[#B0A0C8]" />
          </button>
          <button
            type="button"
            onClick={() => router.push('/custom-story')}
            className="flex w-full items-center justify-center gap-2 border-0 py-3.5 text-[15px] font-semibold text-white active:opacity-90"
            style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
            <span aria-hidden>✨</span>
            AI生成专属故事
          </button>
        </div>

        {/* 故事库 */}
        <button
          type="button"
          onClick={() => router.push(`/ai-stories/browse${fromQ}`)}
          className="mb-6 flex w-full items-center justify-between rounded-[16px] border border-[#F0E8FF] bg-white px-4 py-3.5 text-left shadow-[0_2px_12px_rgba(123,63,212,0.05)] active:bg-[#FAF7FF]">
          <span className="text-[14px] text-[#4A3F5C]">或者，从故事书库里挑一个</span>
          <ChevronRight className="text-[#B0A0C8]" />
        </button>

        {/* 声音册 */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="text-[16px] font-bold text-[#1A0A2E]">声音册</h2>
            <span className="rounded-full border border-[#C8E6C9] bg-[#E8F5E9] px-3 py-1 text-[12px] font-semibold text-[#2E7D32]">
              安睡 {MEMBER_HOME_SLEEP_COUNT} 次
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push('/my-voices')}
            className="flex flex-shrink-0 items-center gap-0.5 text-[#B0A0C8] active:opacity-70"
            aria-label="查看声音册">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto pb-3 pl-1 pr-5">
          {MEMBER_HOME_ALBUM_ITEMS.map(item => {
            const cov = ALBUM_COVER_STYLES[item.tone]
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(`/player/${MEMBER_HOME_FEATURED.playerStoryId}${fromQ}`)}
                className="w-[120px] flex-shrink-0 overflow-hidden rounded-[14px] border border-[#F0E8FF] bg-white text-left shadow-[0_2px_10px_rgba(123,63,212,0.06)] active:opacity-90">
                <div className={`flex h-[72px] items-center justify-center ${cov.areaClass}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[#F0E8FF] bg-white/95 shadow-sm">
                    <AlbumSilhouette stroke={cov.stroke} />
                  </div>
                </div>
                <div className="p-3">
                  <p className="mb-1.5 text-[11px] leading-snug text-[#B0A0C8]">
                    {item.date} · {item.voice}
                  </p>
                  <p className="text-[13px] font-medium leading-snug text-[#1A0A2E]">{item.name}</p>
                </div>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => router.push('/custom-story')}
            className="flex w-[120px] flex-shrink-0 flex-col items-center justify-center gap-2.5 rounded-[14px] border-2 border-dashed border-[#E8DCFF] bg-[#FFF5F8] px-2 py-4 active:opacity-90"
            style={{ minHeight: 148 }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#F0E8FF] bg-white shadow-[0_2px_8px_rgba(233,30,99,0.08)]">
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M7 2v10M2 7h10" stroke="#E91E63" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-center text-[12px] font-medium leading-snug text-[#6B5B8C]">
              生成
              <br />
              新故事
            </p>
          </button>
        </div>

        <div className="flex justify-center pb-4 pt-2 text-[#D8C8E8]" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
