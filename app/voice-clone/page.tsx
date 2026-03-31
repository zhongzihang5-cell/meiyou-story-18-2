'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import VoiceRecorder from '@/components/VoiceRecorder'
import { READING_SENTENCES } from '@/lib/volcengine'

type Step = 'identity' | 'tips' | 'record' | 'processing' | 'done'
type Identity = 'mom' | 'dad' | 'grandma' | 'grandpa'

const IDENTITY_OPTIONS = [
  { value: 'mom' as Identity, emoji: '👩', label: '妈妈的声音' },
  { value: 'dad' as Identity, emoji: '👨', label: '爸爸的声音' },
  { value: 'grandma' as Identity, emoji: '👵', label: '奶奶/外婆' },
  { value: 'grandpa' as Identity, emoji: '👴', label: '爷爷/外公' },
]

export default function VoiceClonePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('identity')
  const [identity, setIdentity] = useState<Identity>('mom')
  const [currentSentence, setCurrentSentence] = useState(0)
  const [recordings, setRecordings] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  // ── Step: identity ──
  if (step === 'identity') return (
    <PageShell onBack={() => router.back()} title="🎙️ 克隆你的声音">
      <div className="px-4 pt-2 pb-6 flex-1 overflow-y-auto no-scrollbar">
        <SectionTitle>我是</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {IDENTITY_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setIdentity(opt.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
                ${identity===opt.value
                  ? 'border-[#7B3FD4] bg-[#EDE7F6]'
                  : 'border-[#F0E8FF] bg-white'}`}>
              <span className="text-4xl">{opt.emoji}</span>
              <span className={`text-sm font-bold ${identity===opt.value?'text-[#7B3FD4]':'text-[#1A0A2E]'}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-[#F8F4FF] rounded-2xl p-4 mb-6 border border-[#F0E8FF]">
          <p className="text-xs font-bold text-[#6B5B8C] mb-3">录制前请了解</p>
          {[
            ['每个音色约 50元成本', '会员权益覆盖，永久使用'],
            ['录制约 10 句话', '每句朗读后确认录制'],
            ['声音相似度', '平均达 97% 以上'],
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between items-center mb-2 last:mb-0">
              <span className="text-xs text-[#B0A0C8]">{k}</span>
              <span className="text-xs font-semibold text-[#6B5B8C]">{v}</span>
            </div>
          ))}
        </div>

        <PrimaryBtn onClick={() => setStep('tips')}>开始录制</PrimaryBtn>
      </div>
    </PageShell>
  )

  // ── Step: tips ──
  if (step === 'tips') return (
    <PageShell onBack={() => setStep('identity')} title="🎙️ 录制准备">
      <div className="px-4 pt-2 pb-6 flex-1 overflow-y-auto no-scrollbar">
        <div className="bg-gradient-to-br from-[#EDE7F6] to-[#FCE4EC] rounded-2xl p-5 mb-6">
          <p className="text-sm font-bold text-[#1A0A2E] mb-4">📋 录制小贴士</p>
          {[
            { icon:'🤫', tip:'找一个安静的房间，关闭电视和音乐' },
            { icon:'📱', tip:'手机距离嘴巴 15-20 厘米' },
            { icon:'📖', tip:'用平时给宝宝讲故事的语气朗读' },
            { icon:'🎙️', tip:'朗读时语速放慢，发音清晰' },
          ].map(({icon,tip}) => (
            <div key={tip} className="flex items-start gap-3 mb-3 last:mb-0">
              <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
              <span className="text-sm text-[#6B5B8C] leading-snug">{tip}</span>
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2 animate-float">🎤</div>
          <p className="text-[13px] text-[#6B5B8C]">准备好了吗？共需朗读 10 句话</p>
          <p className="text-[12px] text-[#B0A0C8] mt-1">约需 2-3 分钟</p>
        </div>

        <PrimaryBtn onClick={() => setStep('record')}>我准备好了</PrimaryBtn>
      </div>
    </PageShell>
  )

  // ── Step: record ──
  if (step === 'record') {
    const allDone = recordings.length >= READING_SENTENCES.length

    const handleRecorded = (base64: string, dur: number) => {
      setRecordings(prev => {
        const next = [...prev]
        next[currentSentence] = base64
        return next
      })
    }

    const next = () => {
      if (currentSentence < READING_SENTENCES.length - 1) {
        setCurrentSentence(s => s + 1)
      }
    }

    const submit = async () => {
      setStep('processing')
      try {
        const res = await fetch('/api/voice/clone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordings,
            identity,
            userId: 'user_demo_001',
          }),
        })
        if (!res.ok) throw new Error(await res.text())
        setProgress(100)
        setStep('done')
      } catch (e: any) {
        setError(e.message || '克隆失败，请稍后重试')
        setStep('record')
      }
    }

    return (
      <PageShell onBack={() => setStep('tips')} title="🎙️ 克隆你的声音">
        <div className="px-4 pt-2 pb-6 flex-1 overflow-y-auto no-scrollbar">

          {/* Progress */}
          <div className="bg-white rounded-2xl p-4 border border-[#F0E8FF] mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-[#1A0A2E]">录制进度</span>
              <span className="font-bold text-[#7B3FD4]">{recordings.filter(Boolean).length} / {READING_SENTENCES.length} 句</span>
            </div>
            <div className="h-2 bg-[#F0E8FF] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(recordings.filter(Boolean).length / READING_SENTENCES.length) * 100}%`,
                  background: 'linear-gradient(90deg,#7B3FD4,#E91E63)'
                }}/>
            </div>
            <div className="flex justify-between mt-2">
              {READING_SENTENCES.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${recordings[i] ? 'bg-[#7B3FD4]' : i===currentSentence ? 'bg-[#B0A0C8]' : 'bg-[#F0E8FF]'}`}/>
              ))}
            </div>
          </div>

          {/* Current sentence */}
          <div className="bg-white rounded-2xl p-5 border-2 border-[#7B3FD4] mb-4 shadow-md">
            <div className="inline-flex items-center gap-1.5 bg-[#7B3FD4] text-white text-[11px] font-bold px-2.5 py-1 rounded-full mb-3">
              第 {currentSentence + 1} 句 · 当前
            </div>
            <p className="text-[15px] font-semibold text-[#1A0A2E] leading-relaxed mb-4">
              {READING_SENTENCES[currentSentence]}
            </p>
            <VoiceRecorder
              onComplete={handleRecorded}
              disabled={false}
            />
            {recordings[currentSentence] && currentSentence < READING_SENTENCES.length - 1 && (
              <button onClick={next}
                className="w-full mt-3 h-10 rounded-full border-2 border-[#7B3FD4] text-[#7B3FD4] text-sm font-bold">
                下一句 →
              </button>
            )}
          </div>

          {/* Upcoming sentences */}
          {READING_SENTENCES.slice(currentSentence + 1, currentSentence + 3).map((sent, i) => (
            <div key={i} className="bg-[#FBF7FF] rounded-2xl p-4 border border-[#F0E8FF] mb-3 opacity-60">
              <div className="text-[11px] font-bold text-[#B0A0C8] mb-1">第 {currentSentence + i + 2} 句</div>
              <p className="text-[13px] text-[#6B5B8C] leading-relaxed">{sent}</p>
            </div>
          ))}

          {error && <div className="text-xs text-red-500 text-center mb-3">{error}</div>}

          {allDone && (
            <PrimaryBtn onClick={submit}>完成录制 · 生成我的声音</PrimaryBtn>
          )}
          {!allDone && (
            <p className="text-center text-xs text-[#B0A0C8]">
              还需录制 {READING_SENTENCES.length - recordings.filter(Boolean).length} 句
            </p>
          )}
        </div>
      </PageShell>
    )
  }

  // ── Step: processing ──
  if (step === 'processing') return (
    <PageShell onBack={() => {}} title="🎙️ 生成声音中">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-6xl mb-6 animate-float">🎤</div>
        <div className="text-lg font-black text-[#1A0A2E] mb-2">声音克隆进行中</div>
        <div className="text-sm text-[#6B5B8C] mb-8">AI正在学习你的声音特征，请稍候…</div>
        <div className="w-full h-2 bg-[#F0E8FF] rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full animate-pulse"
            style={{width:'70%',background:'linear-gradient(90deg,#7B3FD4,#E91E63)'}}/>
        </div>
        <p className="text-xs text-[#B0A0C8]">预计需要 10-30 秒</p>
      </div>
    </PageShell>
  )

  // ── Step: done ──
  return (
    <PageShell onBack={() => {}} title="🎙️ 完成">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <div className="text-xl font-black text-[#1A0A2E] mb-2">声音克隆成功！</div>
        <div className="text-sm text-[#6B5B8C] mb-2 leading-relaxed">
          {IDENTITY_OPTIONS.find(o=>o.value===identity)?.label} 的专属声音已生成<br/>
          现在可以用你的声音讲故事了
        </div>

        <div className="w-full bg-[#F8F4FF] rounded-2xl p-4 border border-[#F0E8FF] mb-8 text-left">
          <div className="text-xs font-bold text-[#7B3FD4] mb-3">🎧 可以用你的声音讲</div>
          {['小星星说话了','叮咚叮咚的声音','妈妈的怀抱'].map(t => (
            <div key={t} className="flex items-center gap-3 py-2 border-b border-[#F0E8FF] last:border-0">
              <span className="text-lg">📖</span>
              <span className="text-sm text-[#1A0A2E] font-medium flex-1">{t}</span>
              <span className="text-[10px] text-white bg-gradient-to-r from-[#7B3FD4] to-[#E91E63] px-2 py-0.5 rounded-full font-bold">换声</span>
            </div>
          ))}
        </div>

        <PrimaryBtn onClick={() => router.push('/stories')}>去听故事 🎧</PrimaryBtn>
        <button onClick={() => router.back()} className="mt-3 text-xs text-[#B0A0C8]">稍后再说</button>
      </div>
    </PageShell>
  )
}

// ── Shared components ──
function PageShell({ children, onBack, title }: { children: React.ReactNode, onBack: () => void, title: string }) {
  return (
    <div className="phone-shell">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">14:58</span>
        <span className="text-sm">📶🔋</span>
      </div>
      <div className="h-13 px-4 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack}
          className="w-9 h-9 rounded-full bg-[#EDE7F6] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#7B3FD4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="text-[17px] font-black text-[#1A0A2E]">{title}</div>
      </div>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-bold text-[#1A0A2E] mb-3">{children}</p>
}

function PrimaryBtn({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="w-full h-14 rounded-full text-white font-extrabold text-base shadow-lg"
      style={{background:'linear-gradient(135deg,#7B3FD4,#E91E63)',boxShadow:'0 8px 24px rgba(123,63,212,0.35)'}}>
      {children}
    </button>
  )
}
