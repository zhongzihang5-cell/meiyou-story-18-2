'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import MiniPlayer from '@/components/MiniPlayer'
import type { MiniPlayerTrack } from '@/components/MiniPlayer'
import {
  buildMemberHomePlayerHref,
  MEMBER_HOME_INTEREST_TAGS,
  MEMBER_HOME_RECOMMEND_STORIES,
} from '@/lib/aiQinshengMemberHome'

const PAD = 16
/** 与 ai-story-final.html --page-bg 一致 */
const C_BG = '#F5F0FF'

/** 对齐 ai-story-final.html · 顶栏 */
function UnifiedTopBar({
  onBack,
  showMenu,
  onToggleMenu,
  onOpenMyVoices,
}: {
  onBack: () => void
  showMenu: boolean
  onToggleMenu: () => void
  onOpenMyVoices: () => void
}) {
  return (
    <div className="flex-shrink-0" style={{ background: C_BG }}>
      <div className="flex h-12 flex-shrink-0 items-center justify-between px-6 pt-3">
        <span className="text-[15px] font-semibold text-[rgba(0,0,0,0.85)]">21:09</span>
        <span className="text-lg leading-none">📶🔋</span>
      </div>
      <div className="relative flex flex-shrink-0 items-center px-5 pb-3 pt-2" style={{ height: 48 }}>
        <button
          type="button"
          onClick={onBack}
          className="absolute left-3 flex h-8 w-8 items-center justify-center text-[20px] text-[rgba(0,0,0,0.85)] active:opacity-60"
          aria-label="返回">
          ‹
        </button>
        <div className="w-full px-12 text-center text-[17px] font-semibold text-[rgba(0,0,0,0.85)]">AI亲声讲</div>
        <button
          type="button"
          onClick={onToggleMenu}
          className="absolute right-4 flex h-9 w-9 items-center justify-center rounded-full active:opacity-80"
          style={{ background: 'rgba(123,94,167,0.12)' }}
          aria-label="菜单">
          <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
            <rect width="16" height="2" rx="1" fill="#5A3D8A" />
            <rect y="5" width="11" height="2" rx="1" fill="#5A3D8A" />
            <rect y="10" width="7" height="2" rx="1" fill="#5A3D8A" />
          </svg>
        </button>
        {showMenu && (
          <div
            className="absolute right-2 top-11 z-20 w-[140px] overflow-hidden rounded-[14px] bg-white py-2 shadow-[0_8px_32px_rgba(90,61,138,0.18)]"
            role="menu"
            aria-label="右上角菜单">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-[11px] text-left text-[13px] text-[rgba(0,0,0,0.85)] active:bg-[#EDE8F5]"
              onClick={onOpenMyVoices}>
              <span aria-hidden>🎙️</span>
              我的声音
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

type RecommendStory = (typeof MEMBER_HOME_RECOMMEND_STORIES)[number]

const CUSTOM_TICKER_MESSAGES: Array<{ user: string; story: string; tag: string }> = [
  { user: '小鹿妈妈', story: '《柚柚大战小怪兽》', tag: '冒险成长' },
  { user: '安安妈妈', story: '《神奇小火车的旅行》', tag: '奇幻想象' },
  { user: '糖糖妈妈', story: '《海底探险记》', tag: '友情冒险' },
  { user: '小樱妈妈', story: '《恐龙王国的一天》', tag: '穿越奇遇' },
  { user: '豆豆妈妈', story: '《月亮上的小兔子》', tag: '温馨睡前' },
  { user: '朵朵妈妈', story: '《草莓王国历险记》', tag: '趣味冒险' },
  { user: '果果妈妈', story: '《公主与小狮子》', tag: '勇气友情' },
]

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
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => [MEMBER_HOME_INTEREST_TAGS[0].value])
  const [miniSyncKey, setMiniSyncKey] = useState<string>('rec-1')
  const [tickerIndex, setTickerIndex] = useState(0)
  const [tickerFading, setTickerFading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleInterest = (value: string) => {
    setSelectedInterests(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value],
    )
  }

  const homeMiniTracks: MiniPlayerTrack[] = useMemo(() => {
    return MEMBER_HOME_RECOMMEND_STORIES.map(s => ({
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
  }, [])

  useEffect(() => {
    const tick = () => {
      setTickerFading(true)
      window.setTimeout(() => {
        setTickerIndex(prev => (prev + 1) % CUSTOM_TICKER_MESSAGES.length)
        setTickerFading(false)
      }, 300)
    }
    const id = window.setInterval(tick, 3000)
    return () => {
      window.clearInterval(id)
    }
  }, [])

  const tickerMessage = CUSTOM_TICKER_MESSAGES[tickerIndex]

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

  return (
    <div className="phone-shell relative flex flex-col overflow-hidden" style={{ background: C_BG }}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <UnifiedTopBar
          onBack={() => router.push('/')}
          showMenu={menuOpen}
          onToggleMenu={() => setMenuOpen(v => !v)}
          onOpenMyVoices={() => {
            setMenuOpen(false)
            router.push('/my-voices')
          }}
        />

        <div
          className="no-scrollbar min-h-0 flex-1 overflow-y-auto"
          style={{ padding: `${PAD}px`, paddingBottom: 88 }}>
          <>
          {/* ZONE 1 · 定制专属故事（ai-story-final.html） */}
          <div
            className="aiq-final-hero aiq-fade-in-up overflow-hidden"
            style={{
              marginLeft: -PAD,
              marginRight: -PAD,
              background: 'linear-gradient(155deg, #3D2470 0%, #6637C2 45%, #8B5CF6 100%)',
              padding: `20px ${PAD}px 0`,
              position: 'relative',
            }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 65%)',
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                bottom: 40,
                left: -40,
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 65%)',
              }}
            />
            <div className="relative z-[1]">
              <div className="flex justify-between gap-2" style={{ alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div className="aiq-final-hero-label mb-[6px]">✨ AI 量身定制</div>
                  <div className="aiq-final-hero-title">定制专属故事</div>
                  <div className="aiq-final-hero-sub">为柚柚量身创作 · 更具体更贴合</div>
                </div>
                <div className="aiq-final-hero-count shrink-0">🔥 今日 2,847 条</div>
              </div>

              <div className="aiq-final-ticker flex items-center gap-2" style={{ marginBottom: 14 }}>
                <span aria-hidden className="aiq-live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4CD964' }} />
                <div
                  className="min-w-0 flex-1 text-[12px]"
                  style={{
                    color: 'rgba(255,255,255,0.88)',
                    opacity: tickerFading ? 0 : 1,
                    transition: 'opacity 0.3s',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}>
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{tickerMessage.user}</span>
                  <span>
                    {' '}
                    刚生成了 {tickerMessage.story} · {tickerMessage.tag}
                  </span>
                </div>
                <span className="shrink-0" style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                  实时
                </span>
              </div>

              <div className="hero-card">
                <div className="aiq-final-pref-hint">柚柚最近喜欢…</div>
                <div className="aiq-final-tags flex flex-wrap">
                  {MEMBER_HOME_INTEREST_TAGS.map(tag => {
                    const on = selectedInterests.includes(tag.value)
                    return (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => toggleInterest(tag.value)}
                        className={`aiq-final-tag border-0 ${on ? 'on' : ''}`}>
                        {tag.emoji} {tag.label}
                      </button>
                    )
                  })}
                </div>
                <div className="aiq-final-sel-hint flex items-center gap-[6px]">
                  <span aria-hidden>📌</span>
                  <span>
                    已选 <span className="aiq-final-sel-n">{selectedInterests.length}</span> 个故事元素，下一步补充主题与对宝宝的寄语
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(buildCustomStoryHref(selectedInterests))}
                  className="aiq-final-cta aiq-cta-btn w-full border-0 text-white active:opacity-95">
                  ✦ 立即定制专属故事
                </button>
              </div>
            </div>
          </div>

          {/* ZONE 2 · 今晚安睡推荐 */}
          <div className="aiq-rec-zone">
            <div className="aiq-rec-header">
              <div className="aiq-rec-title">🌙 今晚安睡推荐</div>
              <button
                type="button"
                onClick={() => router.push('/ai-stories/browse?from=ai-stories-home')}
                className="aiq-rec-more border-0 bg-transparent p-0">
                全部故事 ›
              </button>
            </div>

            <div className="aiq-rec-scroll">
              <div className="aiq-rec-card featured">
                <div className="aiq-rec-cover">🐛</div>
                <div className="aiq-rec-info">
                  <div className="aiq-rec-name">好饿的毛毛虫</div>
                  <div className="aiq-rec-meta">3分20秒 · 情绪安抚</div>
                  <div className="aiq-rec-bottom">
                    <button
                      type="button"
                      onClick={() => router.push('/my-voices')}
                      className="aiq-voice-active border-0">
                      ♪ 妈妈声音 <span style={{ opacity: 0.6 }}>换</span>
                    </button>
                    <button
                      type="button"
                      className="aiq-play-btn border-0 p-0"
                      onClick={() => playRecommend(MEMBER_HOME_RECOMMEND_STORIES[0])}
                      aria-label="播放 好饿的毛毛虫">
                      <svg viewBox="0 0 11 12" width="11" height="12" aria-hidden>
                        <path d="M0 0l11 6-11 6z" fill="#7B5EA7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="aiq-rec-card">
                <div className="aiq-rec-cover" style={{ background: '#FFF5F5' }}>🐷</div>
                <div className="aiq-rec-info">
                  <div className="aiq-rec-name">三只小猪</div>
                  <div className="aiq-rec-meta">4分05秒 · 专注培养</div>
                  <div className="aiq-rec-bottom">
                    <button type="button" onClick={() => router.push('/my-voices')} className="aiq-voice-switcher border-0">
                      🎙 换声音
                    </button>
                    <button
                      type="button"
                      className="aiq-play-btn border-0 p-0"
                      onClick={() => playRecommend(MEMBER_HOME_RECOMMEND_STORIES[1])}
                      aria-label="播放 三只小猪">
                      <svg viewBox="0 0 11 12" width="11" height="12" aria-hidden>
                        <path d="M0 0l11 6-11 6z" fill="white" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="aiq-rec-card">
                <div className="aiq-rec-cover" style={{ background: '#F0FFF4' }}>🐸</div>
                <div className="aiq-rec-info">
                  <div className="aiq-rec-name">小青蛙找妈妈</div>
                  <div className="aiq-rec-meta">3分48秒 · 亲情陪伴</div>
                  <div className="aiq-rec-bottom">
                    <button type="button" onClick={() => router.push('/my-voices')} className="aiq-voice-switcher border-0">
                      🎙 换声音
                    </button>
                    <button
                      type="button"
                      className="aiq-play-btn border-0 p-0"
                      onClick={() => router.push('/player/003?from=ai-stories')}
                      aria-label="播放 小青蛙找妈妈">
                      <svg viewBox="0 0 11 12" width="11" height="12" aria-hidden>
                        <path d="M0 0l11 6-11 6z" fill="white" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="aiq-rec-card">
                <div className="aiq-rec-cover" style={{ background: '#FFF8E8' }}>🦁</div>
                <div className="aiq-rec-info">
                  <div className="aiq-rec-name">勇敢的小狮子</div>
                  <div className="aiq-rec-meta">5分10秒 · 勇气培养</div>
                  <div className="aiq-rec-bottom">
                    <button type="button" onClick={() => router.push('/my-voices')} className="aiq-voice-switcher border-0">
                      🎙 换声音
                    </button>
                    <button
                      type="button"
                      className="aiq-play-btn border-0 p-0"
                      onClick={() => router.push('/player/004?from=ai-stories')}
                      aria-label="播放 勇敢的小狮子">
                      <svg viewBox="0 0 11 12" width="11" height="12" aria-hidden>
                        <path d="M0 0l11 6-11 6z" fill="white" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ZONE 3 · 声音册 */}
          <div className="aiq-voicebook-zone">
            <div className="aiq-rec-header">
              <div className="aiq-rec-title">📚 声音册</div>
              <button
                type="button"
                onClick={() => router.push('/my-voices')}
                className="aiq-rec-more border-0 bg-transparent p-0">
                查看全部 ›
              </button>
            </div>
            <div className="aiq-voicebook-card">
              <div className="aiq-voicebook-cover">🎙️</div>
              <div className="aiq-voicebook-content">
                <div className="aiq-voicebook-title">妈妈原声故事集</div>
                <div className="aiq-voicebook-desc">已收录 8 篇故事 · 总时长 41 分钟</div>
                <button
                  type="button"
                  className="aiq-voicebook-btn border-0"
                  onClick={() => router.push('/my-voices')}>
                  进入声音册
                </button>
              </div>
            </div>
          </div>
          </>
        </div>
      </div>

      <MiniPlayer tracks={homeMiniTracks} syncKey={miniSyncKey} />
      <style jsx global>{`
        @keyframes aiq-pulse-green {
          0%,
          100% {
            box-shadow: 0 0 0 3px rgba(76, 217, 100, 0.28);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(76, 217, 100, 0.1);
          }
        }

        .aiq-live-dot {
          animation: aiq-pulse-green 2s infinite;
          box-shadow: 0 0 0 3px rgba(76, 217, 100, 0.28);
        }

        @keyframes aiq-shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 220%;
          }
        }

        .aiq-cta-btn {
          position: relative;
          overflow: hidden;
        }

        .aiq-cta-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.18),
            transparent
          );
          animation: aiq-shimmer 2.5s infinite;
        }

        .aiq-final-cta::after {
          width: 55%;
          animation: aiq-shimmer 2.8s infinite;
        }

        @keyframes aiq-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aiq-fade-in-up {
          animation: aiq-fade-in-up 0.4s ease both;
        }

        .hero-card {
          background: #ffffff;
          border-radius: 24px 24px 0 0;
          padding: 18px 16px 16px;
          position: relative;
          z-index: 1;
        }

        .aiq-final-hero-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 500;
          backdrop-filter: blur(6px);
        }

        .aiq-final-hero-title {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .aiq-final-hero-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 4px;
        }

        .aiq-final-hero-count {
          background: rgba(236, 72, 153, 0.25);
          border: 1px solid rgba(236, 72, 153, 0.45);
          border-radius: 20px;
          padding: 5px 11px;
          font-size: 11px;
          font-weight: 600;
          color: #f9a8d4;
          white-space: nowrap;
        }

        .aiq-final-ticker {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 22px;
          padding: 8px 13px;
          backdrop-filter: blur(8px);
        }

        .aiq-final-pref-hint {
          font-size: 13px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.38);
          margin-bottom: 12px;
        }

        .aiq-final-tags {
          gap: 7px;
          margin-bottom: 13px;
        }

        .aiq-final-tag {
          padding: 6px 13px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          background: #ede9ff;
          color: rgba(0, 0, 0, 0.85);
          cursor: pointer;
          transition: all 0.18s;
          user-select: none;
          border: 1.5px solid transparent;
        }

        .aiq-final-tag.on {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: #fff;
          border-color: transparent;
        }

        .aiq-final-tag:active {
          transform: scale(0.93);
        }

        .aiq-final-sel-hint {
          background: #f0e8ff;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 11px;
          color: rgba(0, 0, 0, 0.55);
          margin-bottom: 13px;
        }

        .aiq-final-sel-n {
          color: #7b5ea7;
          font-weight: 700;
        }

        .aiq-final-cta {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
          color: #fff;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.5px;
          box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
          transition: transform 0.12s;
        }

        .aiq-final-cta:active {
          transform: scale(0.975);
        }

        .ugc-zone-final {
          margin-left: -${PAD}px;
          margin-right: -${PAD}px;
          padding: 16px 0 20px;
          background: #f5f0ff;
          border-top: 1px solid rgba(124, 58, 237, 0.06);
          border-bottom: 6px solid #f5f0ff;
          box-shadow: none;
        }

        .ugc-zone-title-final {
          font-size: 13px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.55);
        }

        .ugc-scroll-final::-webkit-scrollbar {
          display: none;
        }

        .ugc-card {
          flex-shrink: 0;
          width: 186px;
          background: #ffffff;
          border-radius: 16px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 7px;
          border: none;
          box-shadow: none;
          position: relative;
        }

        .ugc-card-link {
          cursor: pointer;
        }

        .ugc-card-go {
          position: absolute;
          right: 10px;
          top: 8px;
          font-size: 16px;
          line-height: 1;
          color: rgba(124, 58, 237, 0.45);
        }

        .ugc-card-header {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .ugc-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .ugc-user-info {
          min-width: 0;
          flex: 1;
        }

        .ugc-username {
          font-size: 11px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.85);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ugc-time {
          font-size: 10px;
          color: rgba(0, 0, 0, 0.35);
        }

        .ugc-story-title {
          font-size: 12px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.85);
          line-height: 1.4;
        }

        .ugc-story-desc {
          font-size: 10px;
          color: rgba(0, 0, 0, 0.55);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ugc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .ugc-tag {
          background: rgba(124, 58, 237, 0.1);
          color: #7c3aed;
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 8px;
          font-weight: 500;
        }

        .ugc-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          border-top: 0.5px solid rgba(123, 94, 167, 0.12);
          padding-top: 7px;
          margin-top: 1px;
        }

        .ugc-duration {
          font-size: 11px;
          color: rgba(0, 0, 0, 0.35);
        }

        .ugc-play {
          width: 26px;
          height: 26px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .ugc-play:active {
          transform: scale(0.88);
        }

        .aiq-rec-zone {
          margin-left: -16px;
          margin-right: -16px;
          padding: 12px 16px 0;
        }

        .aiq-rec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .aiq-rec-title {
          font-size: 16px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.85);
        }

        .aiq-rec-more {
          font-size: 12px;
          color: #9b7bc8;
        }

        .aiq-rec-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none;
          margin: 0 -16px;
          padding: 2px 16px 6px;
        }

        .aiq-rec-scroll::-webkit-scrollbar {
          display: none;
        }

        .aiq-rec-card {
          flex-shrink: 0;
          width: 168px;
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 12px rgba(90, 61, 138, 0.08);
        }

        .aiq-rec-card.featured {
          width: 178px;
          background: linear-gradient(155deg, #7c3aed, #5b21b6);
        }

        .aiq-rec-cover {
          width: 100%;
          height: 100px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 46px;
          background: rgba(124, 58, 237, 0.07);
        }

        .aiq-rec-card.featured .aiq-rec-cover {
          background: rgba(255, 255, 255, 0.08);
        }

        .aiq-rec-info {
          padding: 10px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .aiq-rec-name {
          font-size: 14px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.85);
          margin-bottom: 3px;
        }

        .aiq-rec-card.featured .aiq-rec-name {
          color: #fff;
        }

        .aiq-rec-meta {
          font-size: 11px;
          color: rgba(0, 0, 0, 0.35);
          margin-bottom: 0;
        }

        .aiq-rec-card.featured .aiq-rec-meta {
          color: rgba(255, 255, 255, 0.55);
        }

        .aiq-rec-bottom {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          gap: 6px;
        }

        .aiq-voice-switcher {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.2);
          border-radius: 20px;
          padding: 4px 9px;
          font-size: 10px;
          font-weight: 600;
          color: #7c3aed;
          white-space: nowrap;
        }

        .aiq-voice-active {
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.15);
          border-radius: 20px;
          padding: 4px 9px;
          font-size: 10px;
          color: #7c3aed;
          display: flex;
          align-items: center;
          gap: 3px;
          white-space: nowrap;
        }

        .aiq-rec-card.featured .aiq-voice-active {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.85);
        }

        .aiq-play-btn {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(124, 58, 237, 0.35);
          flex-shrink: 0;
          transition: transform 0.12s;
        }

        .aiq-play-btn:active {
          transform: scale(0.9);
        }

        .aiq-rec-card.featured .aiq-play-btn {
          background: #fff;
        }

        .aiq-rec-card.featured .aiq-play-btn path {
          fill: #7c3aed;
        }

        .aiq-voicebook-zone {
          margin: 12px -16px 0;
          padding: 0 16px 4px;
        }

        .aiq-voicebook-card {
          border-radius: 18px;
          background: #fff;
          border: 1px solid rgba(124, 58, 237, 0.1);
          display: flex;
          gap: 12px;
          padding: 14px;
          align-items: center;
        }

        .aiq-voicebook-cover {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          flex-shrink: 0;
        }

        .aiq-voicebook-content {
          min-width: 0;
          flex: 1;
        }

        .aiq-voicebook-title {
          font-size: 15px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.84);
        }

        .aiq-voicebook-desc {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.5);
          margin-top: 3px;
          margin-bottom: 10px;
        }

        .aiq-voicebook-btn {
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #7c3aed;
          background: rgba(124, 58, 237, 0.1);
        }
      `}</style>
    </div>
  )
}
