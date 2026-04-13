'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import MiniPlayer from '@/components/MiniPlayer'
import type { MiniPlayerTrack } from '@/components/MiniPlayer'
import {
  buildMemberHomePlayerHref,
  MEMBER_HOME_INTEREST_TAGS,
  MEMBER_HOME_RECOMMEND_STORIES,
  MEMBER_HOME_SLEEP_COUNT,
  MEMBER_HOME_VOICE_ALBUM_CARDS,
  MEMBER_HOME_VOICE_STATS,
  type MemberHomeVoiceAlbumStoryCard,
} from '@/lib/aiQinshengMemberHome'

const PAD = 16
const C_BG = '#F8F5FF'
const PURPLE = '#7C3AED'
const PURPLE_DARK = '#6D28D9'

function Divider() {
  return (
    <div
      className="w-full shrink-0"
      style={{ height: 0.5, background: '#EDE8F8', marginTop: 14, marginBottom: 14 }}
    />
  )
}

/** 与 ai-stories/browse 等页统一：状态栏 + 标题行 + 返回 SVG */
function UnifiedTopBar({ onBack, onMenu }: { onBack: () => void; onMenu: () => void }) {
  return (
    <div className="flex-shrink-0">
      <div className="flex h-12 flex-shrink-0 items-center justify-between px-7 pt-3">
        <span className="text-[15px] font-bold text-[#1A0A2E]">21:09</span>
        <span className="text-sm">📶🔋</span>
      </div>
      <div className="relative flex flex-shrink-0 items-center px-4 py-2" style={{ height: 48 }}>
        <button
          type="button"
          onClick={onBack}
          className="absolute left-1 flex h-9 w-9 items-center justify-center text-[#C4B8D8] active:opacity-60"
          aria-label="返回">
          <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="w-full px-14 text-center text-[17px] font-bold text-[#1A0A2E]">AI亲声讲</div>
        <button
          type="button"
          onClick={onMenu}
          className="absolute right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E8FF] bg-white text-[#7B3FD4] shadow-[0_2px_8px_rgba(123,63,212,0.08)] active:opacity-80"
          aria-label="菜单">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 4h10M2 7h7M2 10h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{title}</span>
      {right}
    </div>
  )
}

function StoryWave({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 148 20"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-0 left-0 right-0"
      style={{ height: 20, opacity: 0.25 }}
      aria-hidden>
      <path
        d="M0 12 Q18 4 36 12 Q54 20 72 12 Q90 4 108 12 Q126 20 148 12 L148 20 L0 20Z"
        fill={color}
      />
    </svg>
  )
}

type RecommendStory = (typeof MEMBER_HOME_RECOMMEND_STORIES)[number]

function StoryCard({
  story,
  onPlay,
  onChangeVoice,
}: {
  story: RecommendStory
  onPlay: (story: RecommendStory) => void
  onChangeVoice: (title: string) => void
}) {
  const emojiBg = story.isCloned ? 'rgba(255,255,255,0.15)' : (story.emojiBg ?? '#F3F0F9')
  const metaText = `${story.duration} · ${story.scene}`

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        flex: '0 0 178px',
        width: 178,
        borderRadius: 16,
        padding: '13px 13px 12px',
        border: '0.5px solid rgba(0,0,0,0.07)',
        background: story.isCloned ? PURPLE_DARK : '#FFFFFF',
      }}>
      <div
        className="mx-auto mb-[9px] flex items-center justify-center"
        style={{ width: 44, height: 44, borderRadius: 12, background: emojiBg, fontSize: 22 }}>
        {story.emoji}
      </div>
      <p
        className="mb-[3px] line-clamp-2"
        style={{
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.35,
          color: story.isCloned ? '#FFFFFF' : '#1A1A1A',
        }}>
        {story.title}
      </p>
      <p
        style={{
          fontSize: 10,
          lineHeight: 1.4,
          opacity: 0.55,
          color: story.isCloned ? '#FFFFFF' : '#888888',
        }}>
        {metaText}
      </p>
      {story.isCloned ? (
        <span
          className="inline-block"
          style={{
            marginTop: 8,
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 8,
            padding: '2px 8px',
            fontSize: 9,
            color: '#FFFFFF',
          }}>
          ♪ 妈妈声音
        </span>
      ) : (
        <button
          type="button"
          className="inline-block border-0 bg-transparent p-0"
          style={{
            marginTop: 8,
            fontSize: 9,
            color: PURPLE,
            border: `0.5px dashed #C4A8F5`,
            borderRadius: 6,
            padding: '2px 8px',
          }}
          onClick={e => {
            e.stopPropagation()
            onChangeVoice(story.title)
          }}>
          换声音
        </button>
      )}
      <button
        type="button"
        className="absolute flex items-center justify-center border-0 leading-none active:scale-95"
        style={{
          right: 12,
          bottom: 12,
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: story.isCloned ? 'rgba(255,255,255,0.9)' : PURPLE,
          color: story.isCloned ? PURPLE_DARK : '#FFFFFF',
          fontSize: 10,
        }}
        aria-label={`播放 ${story.title}`}
        onClick={() => onPlay(story)}>
        ▶
      </button>
    </div>
  )
}

function VoiceAlbumCardStory({
  card,
  onPlay,
}: {
  card: MemberHomeVoiceAlbumStoryCard
  onPlay: (card: MemberHomeVoiceAlbumStoryCard) => void
}) {
  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        flex: '0 0 148px',
        width: 148,
        borderRadius: 16,
        padding: '12px 12px 10px',
        background: card.cardBg,
        border: `0.5px solid ${card.borderColor}`,
      }}>
      <div
        className="relative mb-[9px] overflow-hidden"
        style={{ height: 72, borderRadius: 10, background: card.illBg }}>
        <span
          className="pointer-events-none absolute font-medium"
          style={{ top: 6, right: 8, fontSize: 9, letterSpacing: -1, opacity: 0.7, color: '#1A1A1A' }}>
          ✦ ✦ ✦
        </span>
        <div className="flex h-full items-center justify-center" style={{ fontSize: 30 }}>
          {card.emoji}
        </div>
        <StoryWave color={card.waveColor} />
      </div>
      <p className="mb-[3px]" style={{ fontSize: 9, color: '#AAAAAA' }}>
        {card.date}
      </p>
      <p className="mb-[2px] line-clamp-2" style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: '#1A1A1A' }}>
        {card.title}
      </p>
      <p style={{ fontSize: 9, color: '#8B5CF6' }}>♪ 妈妈声音</p>
      <button
        type="button"
        className="absolute flex items-center justify-center border-0 leading-none active:opacity-80"
        style={{
          right: 10,
          bottom: 10,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: PURPLE,
          color: '#FFFFFF',
          fontSize: 8,
        }}
        aria-label={`播放 ${card.title}`}
        onClick={() => onPlay(card)}>
        ▶
      </button>
    </div>
  )
}

function VoiceAlbumCardCta({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-shrink-0 flex-col items-center justify-center border-0 active:opacity-90"
      style={{
        flex: '0 0 148px',
        width: 148,
        minHeight: 140,
        borderRadius: 16,
        background: '#F5F3FF',
        border: '1px dashed #C4B5FD',
      }}>
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 32, height: 32, background: '#EDE9FE', fontSize: 16, color: PURPLE }}>
        ✦
      </div>
      <p
        className="mt-[7px] text-center"
        style={{ fontSize: 11, color: PURPLE, lineHeight: 1.4 }}>
        生成新故事
        <br />
        加入声音册
      </p>
    </button>
  )
}

function buildCustomStoryHref(selectedInterestValues: string[]) {
  const q = new URLSearchParams()
  q.set('from', 'ai-stories-home')
  if (selectedInterestValues.length > 0) {
    q.set('interests', selectedInterestValues.join(','))
  }
  return `/custom-story?${q.toString()}`
}

/**
 * AI亲声讲首页（严格对齐 cursor_prompt_ai_story.md）
 */
export default function AiQinshengHomeView() {
  const router = useRouter()
  const fromQ = '?from=ai-stories-home'
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => [MEMBER_HOME_INTEREST_TAGS[0].value])
  const [miniSyncKey, setMiniSyncKey] = useState<string>('rec-1')

  const toggleInterest = (value: string) => {
    setSelectedInterests(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value],
    )
  }

  const homeMiniTracks: MiniPlayerTrack[] = useMemo(() => {
    const rec: MiniPlayerTrack[] = MEMBER_HOME_RECOMMEND_STORIES.map(s => ({
      key: `rec-${s.id}`,
      href: buildMemberHomePlayerHref({
        playerStoryId: s.playerStoryId,
        title: s.title,
        emoji: s.emoji,
        coverBg: s.playerCoverBg,
      }),
      title: s.title,
      cover_emoji: s.emoji,
      cover_bg: s.playerCoverBg,
      duration_sec: s.durationSec,
      type: '故事',
    }))
    const alb: MiniPlayerTrack[] = MEMBER_HOME_VOICE_ALBUM_CARDS.filter(
      (c): c is MemberHomeVoiceAlbumStoryCard => c.kind === 'story'
    ).map(c => {
      const coverBg = `linear-gradient(135deg,${c.illBg},${c.illBg})`
      return {
        key: `alb-${c.id}`,
        href: buildMemberHomePlayerHref({
          playerStoryId: c.playerStoryId,
          title: c.title,
          emoji: c.emoji,
          coverBg,
        }),
        title: c.title,
        cover_emoji: c.emoji,
        cover_bg: coverBg,
        duration_sec: c.durationSec,
        type: '故事',
      }
    })
    return [...rec, ...alb]
  }, [])

  const playRecommend = (story: RecommendStory) => {
    setMiniSyncKey(`rec-${story.id}`)
    router.push(
      buildMemberHomePlayerHref({
        playerStoryId: story.playerStoryId,
        title: story.title,
        emoji: story.emoji,
        coverBg: story.playerCoverBg,
      })
    )
  }

  const playAlbumStory = (card: MemberHomeVoiceAlbumStoryCard) => {
    setMiniSyncKey(`alb-${card.id}`)
    const coverBg = `linear-gradient(135deg,${card.illBg},${card.illBg})`
    router.push(
      buildMemberHomePlayerHref({
        playerStoryId: card.playerStoryId,
        title: card.title,
        emoji: card.emoji,
        coverBg,
      })
    )
  }

  return (
    <div className="phone-shell relative flex flex-col overflow-hidden" style={{ background: C_BG }}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <UnifiedTopBar onBack={() => router.push('/')} onMenu={() => router.push('/ai-stories/benefits')} />

        <div
          className="no-scrollbar min-h-0 flex-1 overflow-y-auto"
          style={{ padding: `${PAD}px`, paddingBottom: 88 }}>
          {/* 今晚安睡推荐 */}
          <SectionHeader
            title="今晚安睡推荐"
            right={
              <button
                type="button"
                onClick={() => router.push(`/ai-stories/browse${fromQ}`)}
                className="border-0 bg-transparent p-0"
                style={{ fontSize: 12, color: '#8B5CF6' }}>
                全部故事 ›
              </button>
            }
          />
          <div className="-mx-4">
            <div
              className="no-scrollbar flex gap-[9px] overflow-x-auto pb-2.5"
              style={{ paddingLeft: PAD, paddingRight: PAD, paddingBottom: 10 }}>
              {MEMBER_HOME_RECOMMEND_STORIES.map(story => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onPlay={playRecommend}
                  onChangeVoice={() => router.push('/my-voices')}
                />
              ))}
            </div>
          </div>
          <div className="mb-4 flex justify-center gap-1" style={{ marginTop: 6, marginBottom: 16 }}>
            {MEMBER_HOME_RECOMMEND_STORIES.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === 0 ? 14 : 5,
                  height: 3,
                  borderRadius: 2,
                  background: i === 0 ? PURPLE : '#D8C8F5',
                }}
              />
            ))}
          </div>

          <Divider />

          {/* 2.4 定制专属故事 */}
          <SectionHeader title="定制专属故事" />
          <div
            className="mb-2.5"
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              border: '0.5px solid #EDE8F8',
              padding: 13,
              marginBottom: 10,
            }}>
            <p className="mb-[9px]" style={{ fontSize: 11, color: '#BBBBBB' }}>
              柚柚喜欢…
            </p>
            <div className="mb-2.5 flex flex-wrap gap-1.5" style={{ gap: 6, marginBottom: 10 }}>
              {MEMBER_HOME_INTEREST_TAGS.map(tag => {
                const on = selectedInterests.includes(tag.value)
                return (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleInterest(tag.value)}
                    className="border-0"
                    style={{
                      borderRadius: 20,
                      padding: '4px 12px',
                      fontSize: 11,
                      background: on ? PURPLE : '#F3F0F9',
                      color: on ? '#FFFFFF' : PURPLE,
                    }}>
                    {tag.label}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => router.push(buildCustomStoryHref(selectedInterests))}
                className="border-0 bg-transparent"
                style={{
                  border: '1px dashed #DB2777',
                  color: '#DB2777',
                  borderRadius: 20,
                  padding: '4px 11px',
                  fontSize: 11,
                }}>
                + 添加
              </button>
            </div>
            <button
              type="button"
              onClick={() => router.push(buildCustomStoryHref(selectedInterests))}
              className="w-full border-0 font-medium text-white active:opacity-90"
              style={{
                background: PURPLE,
                borderRadius: 12,
                padding: 11,
                fontSize: 13,
                fontWeight: 500,
              }}>
              ✦ AI生成专属故事
            </button>
          </div>

          <Divider />

          {/* 2.6 声音册 */}
          <SectionHeader
            title="声音册"
            right={
              <button
                type="button"
                onClick={() => router.push('/my-voices')}
                className="border-0 bg-transparent p-0"
                style={{ fontSize: 12, color: '#8B5CF6' }}>
                声音管理 ›
              </button>
            }
          />
          <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 14 }}>
            {(
              [
                <>
                  安睡
                  <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{MEMBER_HOME_SLEEP_COUNT}次</span>
                </>,
                <>
                  <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{MEMBER_HOME_VOICE_STATS.storyCount}</span>个故事
                </>,
                <>
                  <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{MEMBER_HOME_VOICE_STATS.voiceKinds}</span>种声音
                </>,
                <>
                  总时长
                  <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{MEMBER_HOME_VOICE_STATS.totalMinutes}</span>分
                </>,
              ] as const
            ).map((content, idx) => (
              <div
                key={idx}
                className="flex items-baseline rounded-full bg-white"
                style={{
                  border: '0.5px solid #EDE8F8',
                  borderRadius: 20,
                  padding: '5px 12px',
                  fontSize: 10,
                  color: PURPLE_DARK,
                }}>
                {content}
              </div>
            ))}
          </div>
          <div className="-mx-4 mb-6">
            <div
              className="no-scrollbar flex gap-2 overflow-x-auto"
              style={{ gap: 8, paddingLeft: PAD, paddingRight: PAD }}>
              {MEMBER_HOME_VOICE_ALBUM_CARDS.map((card, idx) =>
                card.kind === 'story' ? (
                  <VoiceAlbumCardStory key={card.id} card={card} onPlay={playAlbumStory} />
                ) : (
                  <VoiceAlbumCardCta key={`cta-${idx}`} onClick={() => router.push(buildCustomStoryHref([]))} />
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <MiniPlayer tracks={homeMiniTracks} syncKey={miniSyncKey} />
    </div>
  )
}
