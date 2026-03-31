'use client'
// app/admin/page.tsx — 数据看板

import { useEffect, useState } from 'react'

interface Stats {
  total: number
  pending_review: number
  approved: number
  rejected: number
  published: number
  avg_score: number
  by_age: Record<string, number>
  by_scene: Record<string, number>
  recent_batches: Array<{ date: string; count: number; pass_rate: number }>
}

const MOCK_STATS: Stats = {
  total: 156, pending_review: 23, approved: 98, rejected: 12, published: 87,
  avg_score: 91.4,
  by_age: { '0-6月': 40, '6-12月': 40, '1-1.5岁': 28, '1.5-2岁': 30, '2-3岁': 18 },
  by_scene: { '睡前故事': 62, '晨起故事': 38, '亲子互动': 34, '外出听听': 22 },
  recent_batches: [
    { date: '2026-03-27', count: 50, pass_rate: 88 },
    { date: '2026-03-20', count: 50, pass_rate: 92 },
    { date: '2026-03-13', count: 56, pass_rate: 85 },
  ],
}

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ margin: '6px 0 0', color: '#888', fontSize: 14 }}>{subtitle}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>(MOCK_STATS)

  const cards = [
    { label: '全部故事', value: stats.total, color: '#6C63FF', icon: '📚' },
    { label: '待人工审核', value: stats.pending_review, color: '#FF6B6B', icon: '🎧', urgent: true },
    { label: 'AI审核通过', value: stats.approved, color: '#4CAF50', icon: '✅' },
    { label: '已上线', value: stats.published, color: '#2196F3', icon: '🌟' },
    { label: 'AI退回', value: stats.rejected, color: '#FF9800', icon: '↩️' },
    { label: 'AI平均分', value: `${stats.avg_score}分`, color: '#9C27B0', icon: '📊' },
  ]

  return (
    <div>
      <PageHeader title="数据看板" subtitle="AI讲故事内容生产总览" />

      {/* 核心指标 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: 12, padding: '20px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: card.urgent ? '1.5px solid #FF6B6B' : '1.5px solid #F0F0F0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{card.icon}</span>
              <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{card.label}</span>
              {card.urgent && <span style={{ marginLeft: 'auto', background: '#FF6B6B', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 8, fontWeight: 700 }}>需处理</span>}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* 月龄分布 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📊 月龄段分布</div>
          {Object.entries(stats.by_age).map(([age, count]) => (
            <div key={age} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span>{age}</span><span style={{ color: '#888' }}>{count}条</span>
              </div>
              <div style={{ height: 8, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(count / stats.total) * 100}%`, background: 'linear-gradient(90deg,#6C63FF,#E91E63)', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* 最近批次 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>⚡ 最近生产批次</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: '#888' }}>
                <th style={{ textAlign: 'left', paddingBottom: 8, fontWeight: 500 }}>日期</th>
                <th style={{ textAlign: 'center', paddingBottom: 8, fontWeight: 500 }}>生产数量</th>
                <th style={{ textAlign: 'center', paddingBottom: 8, fontWeight: 500 }}>AI通过率</th>
                <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>状态</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_batches.map(b => (
                <tr key={b.date} style={{ borderTop: '1px solid #F5F5F5' }}>
                  <td style={{ padding: '10px 0', color: '#333' }}>{b.date}</td>
                  <td style={{ textAlign: 'center', color: '#333' }}>{b.count}条</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: b.pass_rate >= 90 ? '#4CAF50' : '#FF9800', fontWeight: 600 }}>{b.pass_rate}%</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <a href="/admin/review" style={{ color: '#6C63FF', fontSize: 12, textDecoration: 'none' }}>去审核 →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
