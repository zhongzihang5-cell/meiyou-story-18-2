'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Track {
  id: string
  title: string
  cover_emoji: string
  cover_bg: string
  duration_sec: number
  type: '故事' | '儿歌' | '动画'
}

const RECENT_TRACKS: Track[] = [
  { id: '001', title: '小星星说话了', cover_emoji: '🌟', cover_bg: 'linear-gradient(135deg,#FFF8E1,#FFE0B2)', duration_sec: 157, type: '故事' },
  { id: '026', title: '叮咚叮咚的声音', cover_emoji: '🎵', cover_bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', duration_sec: 120, type: '故事' },
  { id: '003', title: '妈妈的怀抱', cover_emoji: '🌸', cover_bg: 'linear-gradient(135deg,#FCE4EC,#F8BBD0)', duration_sec: 194, type: '故事' },
  { id: '051', title: '小皮球在哪里', cover_emoji: '🔴', cover_bg: 'linear-gradient(135deg,#E0F7FA,#B2EBF2)', duration_sec: 157, type: '故事' },
  { id: '076', title: '小熊学刷牙', cover_emoji: '🐻', cover_bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', duration_sec: 231, type: '故事' },
]

export default function MiniPlayer() {
  const [playing, setPlaying] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const router = useRouter()
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0)
  const current = RECENT_TRACKS[currentTrackIdx]

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  return (
    <>
      {/* 迷你播放条 */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 'var(--phone-shell-w)', zIndex: 100,
          background: 'rgba(26,10,46,0.96)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* 进度条 */}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.1)' }}>
          <div style={{ height: '100%', width: '35%', background: 'linear-gradient(90deg,#F06292,#9C6FD6)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 14px', gap: 12 }}>
          {/* 封面 */}
          <div
            onClick={() => router.push(`/player/${current.id}`)}
            style={{
              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, cursor: 'pointer',
              background: current.cover_bg,
              boxShadow: playing ? '0 0 0 2px rgba(240,98,146,0.5)' : 'none',
            }}>
            {current.cover_emoji}
          </div>

          {/* 标题+类型 */}
          <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => router.push(`/player/${current.id}`)}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {current.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>
              {current.type} · {fmt(current.duration_sec)}
            </div>
          </div>

          {/* 上一首 */}
          <button
            onClick={() => {
              setCurrentTrackIdx(idx => (idx > 0 ? idx - 1 : idx))
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,0.7)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="3" height="16"/>
            </svg>
          </button>

          {/* 播放/暂停 */}
          <button
            onClick={() => setPlaying(p => !p)}
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#F06292,#9C6FD6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(240,98,146,0.4)',
            }}>
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}>
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            )}
          </button>

          {/* 下一首 */}
          <button
            onClick={() => {
              setCurrentTrackIdx(idx => (idx < RECENT_TRACKS.length - 1 ? idx + 1 : idx))
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,0.7)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,4 15,12 5,20"/><rect x="16" y="4" width="3" height="16"/>
            </svg>
          </button>

          {/* 最近收听列表按钮（下一首右边）*/}
          <button
            onClick={() => setShowHistory(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'rgba(255,255,255,0.5)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <circle cx="3" cy="6" r="1" fill="currentColor"/>
              <circle cx="3" cy="12" r="1" fill="currentColor"/>
              <circle cx="3" cy="18" r="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 最近播放历史弹出层 */}
      {showHistory && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={() => setShowHistory(false)}
        >
          <div
            style={{
              width: 'var(--phone-shell-w)', background: '#1A0A2E',
              borderRadius: '24px 24px 0 0', padding: '20px 0 32px',
              maxHeight: '70vh', display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 拖动条 */}
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 4, margin: '0 auto 16px' }} />

            {/* 标题 */}
            <div style={{ padding: '0 20px 12px' }}>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>最近播放</div>
            </div>

            {/* 列表 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
              {RECENT_TRACKS.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => { setShowHistory(false); router.push(`/player/${track.id}`) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, background: track.cover_bg, position: 'relative',
                  }}>
                    {track.cover_emoji}
                    {i === 0 && (
                      <div style={{
                        position: 'absolute', bottom: -4, right: -4,
                        width: 16, height: 16, borderRadius: '50%',
                        background: '#F06292', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: i === 0 ? '#F06292' : '#fff', fontSize: 14, fontWeight: i === 0 ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {track.title}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
                      {track.type} · {fmt(track.duration_sec)}
                    </div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{fmt(track.duration_sec)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
