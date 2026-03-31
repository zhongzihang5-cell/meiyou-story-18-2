'use client'
// app/admin/review/page.tsx — 故事审核工作台（核心页面）

import { useState } from 'react'

type ReviewStatus = 'pending' | 'approved' | 'rejected'

interface StoryItem {
  id: string
  title: string
  age_label: string
  scene: string
  series: string
  duration_sec: number
  word_count: number
  ai_score: number
  ai_issues: string[]
  script: string
  audio_url: string | null
  status: ReviewStatus
  created_at: string
  editor_comment?: string
}

const MOCK_STORIES: StoryItem[] = [
  {
    id: 's001', title: '小星星说话了', age_label: '0-6月', scene: '睡前故事',
    series: '感官启蒙', duration_sec: 142, word_count: 156, ai_score: 93,
    ai_issues: [],
    script: `【音效:轻柔叮咚声】\n【旁白】嗨，小朋友们，今天的故事开始啦～\n【停顿1秒】\n【旁白】夜空里，有一颗小星星，一闪一闪亮晶晶。\n【停顿1秒】\n【旁白】小星星眨眨眼睛，好像在说：宝宝，我在这里呢！\n【停顿2秒】\n【旁白】宝宝，你也看到小星星了吗？\n【停顿1秒】\n【旁白】故事讲完啦，宝宝要乖乖睡觉～\n【音效:轻柔叮咚声】`,
    audio_url: null, status: 'pending', created_at: '2026-03-27 14:23',
  },
  {
    id: 's002', title: '叮咚叮咚的声音', age_label: '0-6月', scene: '亲子互动',
    series: '感官启蒙', duration_sec: 98, word_count: 112, ai_score: 88,
    ai_issues: ['互动句数量偏少，建议增加1句'],
    script: `【音效:轻柔叮咚声】\n【旁白】嗨，小朋友们，今天的故事开始啦～\n【旁白】叮咚叮咚，是什么声音呀？\n【停顿1秒】\n【旁白】是小铃铛在唱歌！叮咚叮咚～\n【停顿2秒】\n【旁白】宝宝，你听到了吗？\n【停顿1秒】\n【旁白】故事讲完啦，宝宝要乖乖睡觉～\n【音效:轻柔叮咚声】`,
    audio_url: null, status: 'pending', created_at: '2026-03-27 14:24',
  },
  {
    id: 's003', title: '妈妈的怀抱', age_label: '0-6月', scene: '睡前故事',
    series: '亲子温情', duration_sec: 165, word_count: 178, ai_score: 95,
    ai_issues: [],
    script: `【音效:轻柔叮咚声】\n【旁白】嗨，小朋友们，今天的故事开始啦～\n【旁白】妈妈的怀抱，软软的，暖暖的。\n【停顿1秒】\n【旁白】宝宝躺在妈妈怀里，好舒服呀～\n【停顿2秒】\n【旁白】妈妈轻轻拍拍宝宝，说：宝贝，妈妈爱你。\n【停顿1秒】\n【旁白】宝宝，妈妈的怀抱温暖吗？\n【停顿1秒】\n【旁白】故事讲完啦，宝宝要乖乖睡觉～\n【音效:轻柔叮咚声】`,
    audio_url: null, status: 'approved', created_at: '2026-03-27 14:25',
    editor_comment: '质量很好，语言温柔贴切',
  },
]

export default function ReviewPage() {
  const [stories, setStories] = useState<StoryItem[]>(MOCK_STORIES)
  const [selected, setSelected] = useState<StoryItem | null>(null)
  const [filter, setFilter] = useState<ReviewStatus | 'all'>('pending')
  const [comment, setComment] = useState('')
  const [playing, setPlaying] = useState(false)

  const filtered = filter === 'all' ? stories : stories.filter(s => s.status === filter)
  const counts = {
    pending: stories.filter(s => s.status === 'pending').length,
    approved: stories.filter(s => s.status === 'approved').length,
    rejected: stories.filter(s => s.status === 'rejected').length,
  }

  const handleSelect = (s: StoryItem) => {
    setSelected(s)
    setComment(s.editor_comment || '')
    setPlaying(false)
  }

  const handleApprove = () => {
    if (!selected) return
    setStories(prev => prev.map(s => s.id === selected.id
      ? { ...s, status: 'approved', editor_comment: comment } : s))
    setSelected(prev => prev ? { ...prev, status: 'approved', editor_comment: comment } : null)
  }

  const handleReject = () => {
    if (!selected || !comment.trim()) {
      alert('退回时请填写修改意见')
      return
    }
    setStories(prev => prev.map(s => s.id === selected.id
      ? { ...s, status: 'rejected', editor_comment: comment } : s))
    setSelected(prev => prev ? { ...prev, status: 'rejected', editor_comment: comment } : null)
  }

  const statusColor = { pending: '#FF9800', approved: '#4CAF50', rejected: '#FF6B6B' }
  const statusLabel = { pending: '待审核', approved: '已通过', rejected: '已退回' }

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 64px)' }}>

      {/* 左侧：故事列表 */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>🎧 故事审核</div>

        {/* 筛选 tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {([['all', '全部'], ['pending', `待审核 ${counts.pending}`], ['approved', `已通过 ${counts.approved}`], ['rejected', `已退回 ${counts.rejected}`]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
                background: filter === val ? '#1A1A2E' : '#F0F0F0',
                color: filter === val ? '#fff' : '#666',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* 故事列表 */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => (
            <div key={s.id} onClick={() => handleSelect(s)}
              style={{
                background: '#fff', borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                border: selected?.id === s.id ? '2px solid #6C63FF' : '2px solid transparent',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>{s.title}</div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                  background: `${statusColor[s.status]}20`, color: statusColor[s.status],
                }}>
                  {statusLabel[s.status]}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
                {s.age_label} · {s.scene} · {s.series}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                  background: s.ai_score >= 90 ? '#E8F5E9' : '#FFF3E0',
                  color: s.ai_score >= 90 ? '#2E7D32' : '#E65100',
                }}>
                  AI {s.ai_score}分
                </span>
                <span style={{ fontSize: 11, color: '#aaa' }}>{s.duration_sec}秒 · {s.word_count}字</span>
              </div>
              {s.ai_issues.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#FF9800' }}>
                  ⚠ {s.ai_issues[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：详情+审核操作 */}
      {selected ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

          {/* 故事信息头 */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1A1A2E' }}>{selected.title}</h2>
                <div style={{ marginTop: 4, fontSize: 13, color: '#888' }}>
                  {selected.age_label} · {selected.scene} · {selected.series} · {selected.created_at}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 28, fontWeight: 700,
                  color: selected.ai_score >= 90 ? '#4CAF50' : '#FF9800',
                }}>
                  {selected.ai_score}分
                </div>
                <div style={{ fontSize: 11, color: '#aaa' }}>AI审核评分</div>
              </div>
            </div>

            {/* AI问题提示 */}
            {selected.ai_issues.length > 0 && (
              <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#F57F17', marginBottom: 4 }}>⚠ AI 审核意见</div>
                {selected.ai_issues.map((issue, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#795548' }}>· {issue}</div>
                ))}
              </div>
            )}
          </div>

          {/* 音频播放器 */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🎵 音频审听</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* 在线播放 */}
              <button
                onClick={() => setPlaying(!playing)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 24, border: 'none', cursor: 'pointer',
                  background: playing ? '#FF6B6B' : 'linear-gradient(135deg,#6C63FF,#E91E63)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                }}>
                {playing ? '⏸ 暂停' : '▶ 在线播放'}
              </button>

              {/* 下载 */}
              <a
                href={selected.audio_url || '#'}
                download={`${selected.title}.mp3`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 24,
                  border: '1.5px solid #6C63FF', color: '#6C63FF',
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  background: '#fff',
                }}>
                ⬇ 下载音频
              </a>

              {selected.audio_url ? (
                <span style={{ fontSize: 12, color: '#888' }}>时长 {Math.floor(selected.duration_sec / 60)}:{String(selected.duration_sec % 60).padStart(2, '0')}</span>
              ) : (
                <span style={{ fontSize: 12, color: '#FF9800' }}>⚠ 音频未生成（Mock模式）</span>
              )}
            </div>

            {/* Mock 模式进度条占位 */}
            {playing && (
              <div style={{ marginTop: 14 }}>
                <div style={{ height: 6, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: '35%',
                    background: 'linear-gradient(90deg,#6C63FF,#E91E63)',
                    borderRadius: 4, transition: 'width 0.3s',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#aaa' }}>
                  <span>00:52</span><span>{Math.floor(selected.duration_sec / 60)}:{String(selected.duration_sec % 60).padStart(2, '0')}</span>
                </div>
              </div>
            )}
          </div>

          {/* 脚本查看 */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📄 故事脚本</div>
            <pre style={{
              background: '#F8F9FA', borderRadius: 8, padding: '14px 16px',
              fontSize: 13, lineHeight: 1.8, color: '#444',
              whiteSpace: 'pre-wrap', fontFamily: "'Noto Sans SC', sans-serif",
              margin: 0, maxHeight: 260, overflowY: 'auto',
            }}>
              {selected.script}
            </pre>
          </div>

          {/* 审核操作区 */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>✍️ 审核操作</div>

            {/* 编辑意见输入 */}
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="填写审核意见或修改建议（退回时必填）"
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: '1.5px solid #E0E0E0', fontSize: 13, resize: 'vertical',
                fontFamily: "'Noto Sans SC', sans-serif", outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={handleApprove}
                disabled={selected.status === 'approved'}
                style={{
                  flex: 1, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: selected.status === 'approved' ? '#E8F5E9' : '#4CAF50',
                  color: selected.status === 'approved' ? '#4CAF50' : '#fff',
                  fontSize: 15, fontWeight: 700,
                }}>
                {selected.status === 'approved' ? '✅ 已通过' : '✅ 通过'}
              </button>
              <button onClick={handleReject}
                disabled={selected.status === 'rejected'}
                style={{
                  flex: 1, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: selected.status === 'rejected' ? '#FFEBEE' : '#FF6B6B',
                  color: selected.status === 'rejected' ? '#FF6B6B' : '#fff',
                  fontSize: 15, fontWeight: 700,
                }}>
                {selected.status === 'rejected' ? '↩ 已退回' : '↩ 退回修改'}
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 48 }}>🎧</div>
          <div style={{ fontSize: 15 }}>从左侧选择一个故事开始审核</div>
        </div>
      )}
    </div>
  )
}
