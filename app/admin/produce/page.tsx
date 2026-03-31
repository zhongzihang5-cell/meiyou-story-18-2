'use client'
// app/admin/produce/page.tsx — 触发生产页面

import { useState } from 'react'

interface ProduceConfig {
  ageStage: string
  scene: string
  series: string
  theme: string
  count: number
}

interface BatchRecord {
  id: string; created_at: string; config: string
  total: number; success: number; failed: number
  status: 'running' | 'done' | 'error'
}

const AGE_OPTIONS = ['L1 · 0-6月', 'L2 · 6-12月', 'L3 · 1-1.5岁', 'L4 · 1.5-2岁', 'L5 · 2-3岁']
const SCENE_OPTIONS = ['睡前故事', '晨起故事', '亲子互动', '外出听听']

const MOCK_BATCHES: BatchRecord[] = [
  { id: 'b001', created_at: '2026-03-27 14:00', config: 'L1 睡前故事 × 50条', total: 50, success: 44, failed: 6, status: 'done' },
  { id: 'b002', created_at: '2026-03-20 10:00', config: '全月龄 × 50条', total: 50, success: 46, failed: 4, status: 'done' },
]

export default function ProducePage() {
  const [config, setConfig] = useState<ProduceConfig>({ ageStage: 'L1 · 0-6月', scene: '睡前故事', series: '感官启蒙', theme: '感官唤醒', count: 10 })
  const [batches, setBatches] = useState<BatchRecord[]>(MOCK_BATCHES)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState<string[]>([])

  const handleProduce = async () => {
    setRunning(true)
    setProgress(0)
    setLog([])

    const newBatch: BatchRecord = {
      id: `b${Date.now()}`,
      created_at: new Date().toLocaleString('zh-CN'),
      config: `${config.ageStage} · ${config.scene} · ${config.series} × ${config.count}条`,
      total: config.count, success: 0, failed: 0, status: 'running',
    }
    setBatches(prev => [newBatch, ...prev])

    // 模拟生产进度
    for (let i = 0; i < config.count; i++) {
      await new Promise(r => setTimeout(r, 300))
      const pass = Math.random() > 0.15
      setProgress(Math.round(((i + 1) / config.count) * 100))
      setLog(prev => [...prev, `[${i + 1}/${config.count}] ${pass ? '✅' : '❌'} ${config.scene}故事${i + 1} ${pass ? `(AI分: ${Math.floor(90 + Math.random() * 8)})` : '(不达标，丢弃)'}`])
      setBatches(prev => prev.map(b => b.id === newBatch.id ? {
        ...b, success: b.success + (pass ? 1 : 0), failed: b.failed + (pass ? 0 : 1)
      } : b))
    }

    setBatches(prev => prev.map(b => b.id === newBatch.id ? { ...b, status: 'done' } : b))
    setRunning(false)

    // 实际调用：
    // await fetch('/api/produce/batch', { method: 'POST', body: JSON.stringify(config) })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>

      {/* 左：配置区 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>⚡ 触发生产</div>

        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>生产配置</div>

          {[
            { label: '月龄段', key: 'ageStage', opts: AGE_OPTIONS },
            { label: '场景', key: 'scene', opts: SCENE_OPTIONS },
          ].map(({ label, key, opts }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 500 }}>{label}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {opts.map(o => (
                  <button key={o} onClick={() => setConfig(c => ({ ...c, [key]: o }))}
                    style={{
                      padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      background: config[key as keyof ProduceConfig] === o ? '#1A1A2E' : '#F0F0F0',
                      color: config[key as keyof ProduceConfig] === o ? '#fff' : '#555',
                    }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {[
            { label: '故事系列名称', key: 'series', type: 'text', placeholder: '例如：感官启蒙' },
            { label: '核心主题（逗号分隔）', key: 'theme', type: 'text', placeholder: '例如：感官唤醒,依恋建立' },
          ].map(({ label, key, placeholder }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 500 }}>{label}</div>
              <input value={config[key as keyof ProduceConfig]} onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1.5px solid #E0E0E0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 500 }}>生产数量</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="range" min="5" max="50" step="5" value={config.count}
                onChange={e => setConfig(c => ({ ...c, count: Number(e.target.value) }))}
                style={{ flex: 1 }} />
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', minWidth: 40 }}>{config.count}</span>
              <span style={{ fontSize: 12, color: '#888' }}>条</span>
            </div>
          </div>

          {/* 费用估算 */}
          <div style={{ background: '#F8F9FA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#666' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>💰 预计费用估算</div>
            <div>LLM生成：≈ ¥{(config.count * 0.05).toFixed(2)}</div>
            <div>TTS合成：≈ ¥{(config.count * 0.2).toFixed(2)}</div>
            <div style={{ fontWeight: 700, color: '#1A1A2E', marginTop: 4 }}>合计：≈ ¥{(config.count * 0.25).toFixed(2)}</div>
          </div>

          <button onClick={handleProduce} disabled={running}
            style={{
              width: '100%', height: 44, borderRadius: 8, border: 'none', cursor: running ? 'not-allowed' : 'pointer',
              background: running ? '#E0E0E0' : 'linear-gradient(135deg,#1A1A2E,#6C63FF)',
              color: running ? '#999' : '#fff', fontSize: 15, fontWeight: 700,
            }}>
            {running ? `生产中… ${progress}%` : '🚀 开始生产'}
          </button>
        </div>
      </div>

      {/* 右：进度 + 历史批次 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 实时进度日志 */}
        {(running || log.length > 0) && (
          <div style={{ background: '#1A1A2E', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
              实时日志 {running && <span style={{ color: '#6C63FF' }}>· 生产中 {progress}%</span>}
            </div>
            {running && (
              <div style={{ height: 6, background: '#333', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#6C63FF,#E91E63)', borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
            )}
            <div style={{ maxHeight: 220, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8 }}>
              {log.slice(-20).map((line, i) => (
                <div key={i} style={{ color: line.includes('✅') ? '#4CAF50' : '#FF6B6B' }}>{line}</div>
              ))}
            </div>
          </div>
        )}

        {/* 历史批次 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📋 历史批次</div>
          {batches.length === 0 ? (
            <div style={{ color: '#bbb', textAlign: 'center', padding: '24px 0' }}>暂无生产记录</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {batches.map(b => (
                <div key={b.id} style={{ padding: '14px 16px', background: '#F8F9FA', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginBottom: 3 }}>{b.config}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{b.created_at}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#4CAF50' }}>{b.success}</div>
                    <div style={{ fontSize: 10, color: '#888' }}>成功</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#FF6B6B' }}>{b.failed}</div>
                    <div style={{ fontSize: 10, color: '#888' }}>丢弃</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#666' }}>
                      {b.total > 0 ? Math.round((b.success / b.total) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: 10, color: '#888' }}>通过率</div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                    background: b.status === 'done' ? '#E8F5E9' : b.status === 'running' ? '#E3F2FD' : '#FFEBEE',
                    color: b.status === 'done' ? '#4CAF50' : b.status === 'running' ? '#2196F3' : '#F44336',
                  }}>
                    {b.status === 'done' ? '完成' : b.status === 'running' ? '运行中' : '失败'}
                  </span>
                  {b.status === 'done' && (
                    <a href="/admin/review" style={{ fontSize: 12, color: '#6C63FF', textDecoration: 'none', fontWeight: 600 }}>去审核 →</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
