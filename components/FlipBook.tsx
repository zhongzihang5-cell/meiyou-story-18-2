'use client'

import { useState, useRef, useEffect } from 'react'

export interface StoryPage {
  id: string
  date: string
  dateLabel: string
  emoji: string
  title: string
  preview: string
  color: string
  accent: string
  hasStory: boolean
}

interface FlipBookProps {
  pages: StoryPage[]
  initialPage?: number
  onCustomizeStory?: () => void
}

export default function FlipBook({ pages, initialPage = 0, onCustomizeStory }: FlipBookProps) {
  const [current, setCurrent] = useState(initialPage)
  const [flipping, setFlipping] = useState(false)
  const [flipDir, setFlipDir] = useState<'next' | 'prev'>('next')
  const [isLandscape, setIsLandscape] = useState(false)
  const touchStart = useRef<number | null>(null)

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth > 600)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => { window.removeEventListener('resize', check); window.removeEventListener('orientationchange', check) }
  }, [])

  const goNext = () => {
    if (flipping || current >= pages.length - 1) return
    setFlipDir('next')
    setFlipping(true)
    setTimeout(() => { setCurrent(c => c + 1); setFlipping(false) }, 600)
  }

  const goPrev = () => {
    if (flipping || current <= 0) return
    setFlipDir('prev')
    setFlipping(true)
    setTimeout(() => { setCurrent(c => c - 1); setFlipping(false) }, 600)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) (diff > 0 ? goNext() : goPrev())
    touchStart.current = null
  }

  const page = pages[current]
  const prevPage = current > 0 ? pages[current - 1] : null
  const nextPage = current < pages.length - 1 ? pages[current + 1] : null

  return (
    <div className="relative flex flex-col items-center w-full h-full select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>

      <div className="relative flex items-center justify-center w-full flex-1"
        style={{ perspective: '1200px' }}>

        {current > 0 && (
          <button onClick={goPrev}
            type="button"
            className="absolute left-3 z-20 flex items-center justify-center rounded-full transition-all active:scale-95"
            style={{
              width: 40, height: 40,
              background: 'rgba(255,255,255,0.96)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              color: '#666',
              fontSize: 20,
            }}>
            ‹
          </button>
        )}

        {current < pages.length - 1 && (
          <button onClick={goNext}
            type="button"
            className="absolute right-3 z-20 flex items-center justify-center rounded-full transition-all active:scale-95"
            style={{
              width: 40, height: 40,
              background: 'rgba(255,255,255,0.96)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              color: '#666',
              fontSize: 20,
            }}>
            ›
          </button>
        )}

        <div className="relative"
          style={{
            width: isLandscape ? 560 : 300,
            height: isLandscape ? 380 : 420,
            transformStyle: 'preserve-3d',
          }}>

          {isLandscape ? (
            <div
              className="flex h-full overflow-hidden rounded-[14px] border border-[#f0e8ff] shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <div className="flex-1 h-full" style={{ background: prevPage?.color || '#f5ede0', borderRight: '2px solid rgba(0,0,0,0.08)' }}>
                {prevPage ? <PageContent page={prevPage} compact onCustomizeStory={onCustomizeStory} /> : <BlankPage />}
              </div>
              <div style={{ width: 12, background: 'linear-gradient(to right, #d4b896, #e8cba8, #d4b896)', flexShrink: 0 }} />
              <div className="flex-1 h-full" style={{ background: page.color }}>
                <PageContent page={page} compact onCustomizeStory={onCustomizeStory} />
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>

              <div className="absolute inset-0 overflow-hidden rounded-[14px] border border-[#f0e8ff] shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                style={{
                  background: page.color,
                  boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
                  transformOrigin: flipDir === 'next' ? 'left center' : 'right center',
                  transform: flipping
                    ? flipDir === 'next' ? 'rotateY(-180deg)' : 'rotateY(180deg)'
                    : 'rotateY(0deg)',
                  transition: flipping ? 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1.000)' : 'none',
                  backfaceVisibility: 'hidden',
                  zIndex: 2,
                }}>
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.03) 28px)',
                  }} />
                {flipping && (
                  <div className="absolute inset-y-0 right-0 w-16 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.08))',
                    }} />
                )}
                <PageContent page={page} onCustomizeStory={onCustomizeStory} />
              </div>

              {(nextPage || prevPage) && (
                <div className="absolute inset-0 overflow-hidden rounded-[14px] border border-[#f0e8ff]/60"
                  style={{
                    background: flipDir === 'next' ? (nextPage?.color || '#fdf8f2') : (prevPage?.color || '#fdf8f2'),
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    zIndex: 1,
                  }}>
                  {flipDir === 'next'
                    ? (nextPage ? <PageContent page={nextPage} onCustomizeStory={onCustomizeStory} /> : <BlankPage />)
                    : (prevPage ? <PageContent page={prevPage} onCustomizeStory={onCustomizeStory} /> : <BlankPage />)
                  }
                </div>
              )}

              {!flipping && current < pages.length - 1 && (
                <div className="absolute bottom-4 right-4 pointer-events-none"
                  style={{
                    width: 32, height: 32,
                    background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.08) 50%)',
                    borderRadius: '0 0 8px 0',
                    animation: 'cornerHint 3s ease-in-out infinite',
                  }} />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 mb-2">
        {pages.map((_, i) => (
          <div key={i}
            onClick={() => {
              if (!flipping) {
                setFlipDir(i > current ? 'next' : 'prev')
                setFlipping(true)
                setTimeout(() => { setCurrent(i); setFlipping(false) }, 600)
              }
            }}
            className="cursor-pointer transition-all duration-300 rounded-full"
            style={{
              width: current === i ? 20 : 7,
              height: 7,
              background: current === i ? '#ff4d88' : '#ddd',
            }} />
        ))}
      </div>

      <p className="mb-4 text-[12px] text-[#888]">
        {current + 1} / {pages.length}
      </p>

      <style>{`
        @keyframes cornerHint {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.15); }
        }
        @keyframes flipbookTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.85); }
          50% { opacity: 0.45; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

function PageContent({
  page,
  compact,
  onCustomizeStory,
}: {
  page: StoryPage
  compact?: boolean
  onCustomizeStory?: () => void
}) {
  const isToday = page.id === 'today'
  const [opening, setOpening] = useState(false)

  const handleCustomize = () => {
    if (!isToday) return
    setOpening(true)
    window.setTimeout(() => onCustomizeStory?.(), 900)
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ padding: compact ? '16px 14px' : '20px 18px' }}>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[12px] font-medium tracking-wide" style={{ color: page.accent }}>
            {page.dateLabel}
          </p>
          <p className="text-[12px] text-[#888]">{page.date}</p>
        </div>
        {isToday && (
          <div
            className="rounded-[4px] px-2 py-0.5 text-[10px] tracking-wide text-white"
            style={{ background: '#ff4d88' }}
          >
            今天
          </div>
        )}
      </div>

      <div className="mb-3 flex flex-shrink-0 items-center justify-center rounded-[14px]"
        style={{
          height: compact ? 100 : 130,
          background: `${page.accent}18`,
        }}>
        {isToday ? (
          <div
            className="relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-[14px]"
            onClick={handleCustomize}
            style={{
              transform: opening ? 'scale(1.15) rotateY(15deg)' : 'scale(1) rotateY(0deg)',
              opacity: opening ? 0 : 1,
              transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)',
              transformStyle: 'preserve-3d',
              perspective: 1000,
            }}>
            <span className="absolute left-[12%] top-[10%] h-[5px] w-[5px] rounded-full bg-[#f06292]/30 animate-[flipbookTwinkle_2.5s_ease-in-out_infinite]" />
            <span className="absolute right-[18%] top-[16%] h-[4px] w-[4px] rounded-full bg-[#f06292]/30 animate-[flipbookTwinkle_2.5s_ease-in-out_.8s_infinite]" />
            <span className="absolute left-[20%] bottom-[14%] h-[4px] w-[4px] rounded-full bg-[#f06292]/30 animate-[flipbookTwinkle_2.5s_ease-in-out_1.2s_infinite]" />
            <span style={{ fontSize: compact ? 48 : 58, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}>📖</span>
          </div>
        ) : (
          <div style={{ fontSize: compact ? 48 : 60, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}>
            {page.emoji}
          </div>
        )}
      </div>

      {page.hasStory ? (
        <>
          <h3 className={`mb-2 leading-snug text-[#1a1a1a] ${compact ? 'text-[15px]' : 'text-[17px]'} font-bold`}>
            {page.title}
          </h3>
          <p
            className="flex-1 overflow-hidden text-[12px] leading-relaxed text-[#666]"
            style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
          >
            {page.preview}
          </p>
          <button
            type="button"
            onClick={isToday ? handleCustomize : undefined}
            className="mt-3 w-full rounded-full py-2.5 text-[13px] font-medium tracking-wide text-white transition-all active:scale-[0.98]"
            style={{ background: page.accent }}
          >
            {isToday ? '✨ 定制故事' : '▶ 播放故事'}
          </button>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-[14px] leading-relaxed text-[#666]">
            今晚还没有故事<br />为小布定制一个吧
          </p>
          <button
            type="button"
            className="rounded-full px-6 py-2.5 text-[13px] font-medium tracking-wide text-white transition-all active:scale-95"
            style={{
              background: '#ff4d88',
              boxShadow: '0 4px 14px rgba(255,77,136,0.32)',
            }}
          >
            ✨ 开始定制
          </button>
          <p className="text-[12px] text-[#888]">免费体验 3 次</p>
        </div>
      )}
    </div>
  )
}

function BlankPage() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: 'transparent' }}
    >
      <p className="text-[13px] text-[#bbb]">封底</p>
    </div>
  )
}
