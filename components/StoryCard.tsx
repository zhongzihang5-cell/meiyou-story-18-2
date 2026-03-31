'use client'
import { useRouter } from 'next/navigation'
import type { Story } from '@/lib/mockData'
import type { CollectionFrom } from '@/lib/collectionNav'

interface Props {
  story: Story
  onPaywall?: () => void
  /** 从哪个 Tab 列表进入播放器，用于返回时回到对应首页 */
  listFrom?: CollectionFrom
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function fmtPlays(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n)
}

export default function StoryCard({ story, onPaywall, listFrom }: Props) {
  const router = useRouter()
  const locked = story.status === 'member_only'

  const handleClick = () => {
    if (locked) { onPaywall?.(); return }
    const q = listFrom ? `?from=${listFrom}` : ''
    router.push(`/player/${story.id}${q}`)
  }

  return (
    <div
      className={`
        story-card bg-white rounded-2xl p-3 flex gap-3
        border border-[#F0E8FF] shadow-sm cursor-pointer
        relative overflow-hidden
      `}
      onClick={handleClick}
    >
      {/* Cover */}
      <div
        className="w-16 h-16 rounded-[14px] flex-shrink-0 flex items-center justify-center text-3xl"
        style={{ background: story.cover_bg }}
      >
        {story.cover_emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-[#1A0A2E] mb-1 truncate">
          {story.title}
        </div>
        <div className="text-[11px] text-[#B0A0C8] mb-2">
          {story.sub_category} · {fmt(story.duration_sec)} · {fmtPlays(story.play_count)}次
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EDE7F6] text-[#7B3FD4]">
            {story.age_label}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FCE4EC] text-[#E91E63]">
            {story.category_label}
          </span>
          {story.is_ai && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white"
              style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
              AI生成
            </span>
          )}
          {story.status === 'published' && !story.is_ai && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2E7D32]">
              免费
            </span>
          )}
        </div>
      </div>

      {/* Play button */}
      <div className="self-center flex-shrink-0">
        {locked ? (
          <div className="w-9 h-9 rounded-full bg-[#F0E8FF] flex items-center justify-center">
            <span className="text-base">🔒</span>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg,#F06292,#9C6FD6)' }}>
            <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        )}
      </div>

      {/* Locked overlay */}
      {locked && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(248,244,255,0.88)', backdropFilter: 'blur(2px)' }}>
          <div className="text-center">
            <div className="text-xl mb-1">🔒</div>
            <div className="text-[11px] font-bold text-[#7B3FD4]">会员解锁</div>
          </div>
        </div>
      )}
    </div>
  )
}
