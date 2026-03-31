'use client'
// app/admin/library/page.tsx — 内容库管理（上下架、标签修改）

import { useState } from 'react'

interface LibraryStory {
  id: string; title: string; age_label: string; scene: string
  series: string; status: 'published' | 'offline'; play_count: number
  ai_score: number; published_at: string
}

const MOCK_LIBRARY: LibraryStory[] = [
  { id: 'l001', title: '小星星说话了', age_label: '0-6月', scene: '睡前故事', series: '感官启蒙', status: 'published', play_count: 12840, ai_score: 93, published_at: '2026-03-20' },
  { id: 'l002', title: '叮咚叮咚的声音', age_label: '0-6月', scene: '亲子互动', series: '感官启蒙', status: 'published', play_count: 9320, ai_score: 91, published_at: '2026-03-20' },
  { id: 'l003', title: '妈妈的怀抱', age_label: '0-6月', scene: '睡前故事', series: '亲子温情', status: 'published', play_count: 18560, ai_score: 95, published_at: '2026-03-20' },
  { id: 'l004', title: '早安太阳公公', age_label: '0-6月', scene: '晨起故事', series: '晨间唤醒', status: 'offline', play_count: 4210, ai_score: 88, published_at: '2026-03-15' },
  { id: 'l005', title: '小皮球在哪里', age_label: '6-12月', scene: '亲子互动', series: '探索玩具', status: 'published', play_count: 7680, ai_score: 92, published_at: '2026-03-20' },
]

export default function LibraryPage() {
  const [stories, setStories] = useState<LibraryStory[]>(MOCK_LIBRARY)
  const [ageFilter, setAgeFilter] = useState('全部')
  const [sceneFilter, setSceneFilter] = useState('全部')
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  const filtered = stories.filter(s =>
    (ageFilter === '全部' || s.age_label === ageFilter) &&
    (sceneFilter === '全部' || s.scene === sceneFilter) &&
    (search === '' || s.title.includes(search))
  )

  const toggle = (id: string) => {
    setStories(prev => prev.map(s => s.id === id
      ? { ...s, status: s.status === 'published' ? 'offline' : 'published' } : s))
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', marginBottom: 20 }}>📚 内容库管理</div>

      {/* 筛选栏 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索故事名称..."
          style={{ height: 36, padding: '0 14px', borderRadius: 8, border: '1.5px solid #E0E0E0', fontSize: 13, outline: 'none', width: 200 }} />

        {[['月龄', ageFilter, setAgeFilter, ['全部', '0-6月', '6-12月', '1-1.5岁', '1.5-2岁', '2-3岁']],
          ['场景', sceneFilter, setSceneFilter, ['全部', '睡前故事', '晨起故事', '亲子互动', '外出听听']]
        ].map(([label, val, setter, opts]: any) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#888' }}>{label}</span>
            <select value={val} onChange={e => setter(e.target.value)}
              style={{ height: 36, padding: '0 10px', borderRadius: 8, border: '1.5px solid #E0E0E0', fontSize: 13, outline: 'none' }}>
              {opts.map((o: string) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#888' }}>
          共 {filtered.length} 条 · 上线 {filtered.filter(s => s.status === 'published').length} · 下线 {filtered.filter(s => s.status === 'offline').length}
        </div>
      </div>

      {/* 故事表格 */}
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #F0F0F0' }}>
              {['故事标题', '月龄', '场景', '系列', 'AI评分', '播放量', '上线时间', '状态', '操作'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#666', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1A1A2E' }}>{s.title}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>
                  <span style={{ background: '#EDE7F6', color: '#7B3FD4', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{s.age_label}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{s.scene}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{s.series}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: s.ai_score >= 90 ? '#4CAF50' : '#FF9800', fontWeight: 700 }}>{s.ai_score}分</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{s.play_count.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', color: '#999', fontSize: 12 }}>{s.published_at}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                    background: s.status === 'published' ? '#E8F5E9' : '#F5F5F5',
                    color: s.status === 'published' ? '#4CAF50' : '#999',
                  }}>
                    {s.status === 'published' ? '已上线' : '已下线'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => toggle(s.id)} style={{
                      padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      background: s.status === 'published' ? '#FFEBEE' : '#E8F5E9',
                      color: s.status === 'published' ? '#F44336' : '#4CAF50',
                    }}>
                      {s.status === 'published' ? '下线' : '上线'}
                    </button>
                    <button style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #E0E0E0', cursor: 'pointer', fontSize: 12, background: '#fff', color: '#666' }}>
                      编辑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
