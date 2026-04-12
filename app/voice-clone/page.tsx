'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { markVoiceSlotDone, roleToVoiceSlot, sessionAudioKey, VOICE_SLOT_TOTAL } from '@/lib/voiceSlots'
import RecordScreenFlow, { VOICE_RECORD_TOTAL_SEGMENTS } from '@/components/voice-clone/RecordScreenFlow'
import CloneDoneHeroCanvas from '@/components/voice-clone/CloneDoneHeroCanvas'
import { CloneDonePerkIcon, cloneDonePerkIconBg } from '@/components/voice-clone/CloneDonePerkIcon'
import { VOICE_CLONE_PERKS } from '@/lib/voiceClonePerks'

type Step = 'role' | 'record' | 'processing' | 'done'
type Role =
  | 'mom'
  | 'dad'
  | 'grandma'
  | 'grandpa'
  | 'waipo'
  | 'waigong'
  | 'nainai'
  | 'yeye'
  | 'yiyi'
  | 'other'
  | null

const MAIN_ROLES = [
  { id: 'mom' as const, label: '妈妈', emoji: '👩' },
  { id: 'dad' as const, label: '爸爸', emoji: '👨' },
]

const OTHER_ROLE = { id: 'other' as const, label: '其他角色', emoji: '✨' }

/** 其他家人：两行四列，最后一格为「+ 其他角色」 */
const FAMILY_GRID_ROLES: { id: Exclude<Role, 'mom' | 'dad' | 'other' | null>; label: string; emoji: string; circleBg: string }[] = [
  { id: 'waipo', label: '姥姥', emoji: '👵', circleBg: '#FCE4EC' },
  { id: 'waigong', label: '姥爷', emoji: '👴', circleBg: '#E8F5E9' },
  { id: 'nainai', label: '奶奶', emoji: '👵', circleBg: '#FFF9C4' },
  { id: 'yeye', label: '爷爷', emoji: '👴', circleBg: '#E3F2FD' },
  { id: 'grandma', label: '外婆', emoji: '👵', circleBg: '#F3E5F5' },
  { id: 'grandpa', label: '外公', emoji: '👴', circleBg: '#E0F7FA' },
  { id: 'yiyi', label: '姨姨', emoji: '👩', circleBg: '#FFE0B2' },
]

const ALL_ROLES = [...MAIN_ROLES, OTHER_ROLE, ...FAMILY_GRID_ROLES]

/** 完成页「试听效果」固定口播（不播放用户录音文件，避免环境差异） */
const DEMO_PREVIEW_SPEAK_TEXT =
  '柚柚乖，这是亲声讲的试听效果。开通会员后，可以用你的声音给柚柚讲每一首故事哦。'

const DEMO_WAVE_BAR_HEIGHTS = [5, 11, 15, 8, 12]

function VoiceCloneContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [customRoleName, setCustomRoleName] = useState('')
  /** 克隆完成页「试听」用，在完成录制时从各句录音复制而来，避免子组件卸载 revoke 后失效 */
  const [clonePreviewUrl, setClonePreviewUrl] = useState<string | null>(null)
  const [demoPreviewPlaying, setDemoPreviewPlaying] = useState(false)
  const skipAppliedRef = useRef(false)

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => {
    if (skipAppliedRef.current) return
    const skip = searchParams.get('skipRole')
    if (skip !== '1' && skip !== 'true') return
    const r = searchParams.get('role')
    if (r === 'mom') {
      setSelectedRole('mom')
      setCustomRoleName('')
      setStep('record')
      skipAppliedRef.current = true
    } else if (r === 'dad') {
      setSelectedRole('dad')
      setCustomRoleName('')
      setStep('record')
      skipAppliedRef.current = true
    } else if (r === 'other') {
      setSelectedRole('other')
      setCustomRoleName(decodeURIComponent(searchParams.get('custom') || '其他家人'))
      setStep('record')
      skipAppliedRef.current = true
    }
  }, [searchParams])

  useEffect(() => {
    if (step !== 'done' || !clonePreviewUrl || !selectedRole) return
    const slot = roleToVoiceSlot(selectedRole)
    if (!slot) return
    markVoiceSlotDone(slot, {
      date: new Date().toISOString().slice(0, 10),
      sentences: VOICE_RECORD_TOTAL_SEGMENTS,
    })
    try {
      sessionStorage.setItem(sessionAudioKey(slot), clonePreviewUrl)
    } catch {
      /* ignore */
    }
  }, [step, clonePreviewUrl, selectedRole])

  const handleRoleNext = () => {
    if (!selectedRole) return
    if (selectedRole === 'other' && !customRoleName.trim()) return
    setStep('record')
  }

  const handleBack = () => {
    if (step === 'role') {
      router.back()
      return
    }
    if (step === 'record') {
      if (searchParams.get('from') === 'my-voices') {
        router.push('/my-voices')
        return
      }
      router.push('/ai-stories')
      return
    }
    if (step === 'processing' || step === 'done') {
      router.push('/ai-stories/home')
      return
    }
    router.back()
  }

  const toggleDemoPreview = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('当前环境不支持语音试听')
      return
    }
    if (demoPreviewPlaying) {
      window.speechSynthesis.cancel()
      setDemoPreviewPlaying(false)
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(DEMO_PREVIEW_SPEAK_TEXT)
    u.lang = 'zh-CN'
    u.rate = 0.92
    u.onend = () => setDemoPreviewPlaying(false)
    u.onerror = () => setDemoPreviewPlaying(false)
    setDemoPreviewPlaying(true)
    window.speechSynthesis.speak(u)
  }

  const handleRerecordFromDone = () => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    setDemoPreviewPlaying(false)
    setClonePreviewUrl(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setStep('record')
  }

  const roleMeta = ALL_ROLES.find(r => r.id === selectedRole)
  const roleLabel =
    selectedRole === 'other' ? customRoleName.trim() : (roleMeta?.label ?? '')
  const roleEmoji = selectedRole === 'other' ? OTHER_ROLE.emoji : (roleMeta?.emoji ?? '')

  const roleStepCanProceed =
    !!selectedRole && (selectedRole !== 'other' || !!customRoleName.trim())

  return (
    <div className="phone-shell relative bg-[#FBF7FF] flex flex-col">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">10:37</span>
        <span className="text-sm">📶🔋</span>
      </div>

      <div className="px-5 flex items-center flex-shrink-0 mb-2">
        <button type="button" onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(0,0,0,0.05)' }}>
          <svg className="w-5 h-5 text-[#1A0A2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="flex-1 text-center text-[16px] font-bold text-[#1A0A2E]">
          {step === 'role' && '选择角色'}
          {step === 'record' && '录制你的声音'}
          {step === 'processing' && '正在学习你的音色'}
          {step === 'done' && 'AI亲声讲'}
        </div>
        <div className="w-9" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {step === 'record' ? (
          <RecordScreenFlow
            className="min-h-0 flex-1 px-5"
            roleLabel={roleLabel || '妈妈'}
            onComplete={previewUrl => {
              setClonePreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev)
                return previewUrl
              })
              setStep('processing')
              setTimeout(() => setStep('done'), 3000)
            }}
          />
        ) : step === 'done' ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 no-scrollbar">
              <div className="flex flex-col items-stretch pt-2">
                <CloneDoneHeroCanvas />

                <h2 className="mb-2 text-center text-[20px] font-bold text-[#1A0A2E]">声音克隆准备好了</h2>
                <div className="mb-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                  <button
                    type="button"
                    onClick={toggleDemoPreview}
                    aria-pressed={demoPreviewPlaying}
                    className={`inline-flex items-center gap-3 rounded-full border px-4 py-2.5 shadow-sm transition-colors active:opacity-85 ${
                      demoPreviewPlaying
                        ? 'border-[#7B3FD4] bg-[#F3EEFF]'
                        : 'border-[#E4D8F4] bg-white'
                    }`}>
                    <div className="flex h-5 items-end gap-0.5" aria-hidden>
                      {DEMO_WAVE_BAR_HEIGHTS.map((h, i) => (
                        <span
                          key={i}
                          className={`w-[3px] rounded-full bg-[#7B3FD4] ${demoPreviewPlaying ? 'voice-record-wave-bar' : ''}`}
                          style={{
                            height: h,
                            animationDelay: `${i * 0.09}s`,
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[13px] font-semibold ${demoPreviewPlaying ? 'text-[#5B21B6]' : 'text-[#7B3FD4]'}`}>
                      {demoPreviewPlaying ? '播放中…' : '试听效果'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRerecordFromDone}
                    className="text-[12px] font-normal text-[#C4B8D8] underline decoration-[#E8E0F4] underline-offset-2 active:opacity-70">
                    重录
                  </button>
                </div>

                <div className="mb-4 flex flex-col gap-3">
                  {VOICE_CLONE_PERKS.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3.5 rounded-[16px] border border-[#F0E8FF] bg-white p-4 shadow-[0_2px_12px_rgba(123,63,212,0.06)]">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] border border-[#F0E8FF] ${cloneDonePerkIconBg(p.colorClass)}`}>
                        <CloneDonePerkIcon colorClass={p.colorClass} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1.5 text-[15px] font-bold leading-snug text-[#1A0A2E]">{p.title}</p>
                        <p className="text-[13px] leading-relaxed text-[#6B5B8C]">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="flex-shrink-0 border-t border-[#EEE8F5] bg-white px-3 pb-2 pt-2"
              style={{
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
              }}>
              <p className="mb-1.5 flex items-center gap-1 text-[13px] font-bold leading-tight text-[#1A0A2E]">
                <span className="text-[14px]" aria-hidden>
                  💗
                </span>
                不到一顿饭钱，你将获得：
              </p>
              <ul className="mb-0 space-y-1">
                {[
                  '1种高还原度克隆音色',
                  '0～6岁故事全库支持换声畅听',
                  '每月30次柚柚故事定制',
                ].map(line => (
                  <li key={line} className="flex gap-2 text-[11px] leading-snug text-[#6B5B8C]">
                    <span
                      className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#7B3FD4]"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-2 px-0.5">
                <span
                  className="absolute -top-1.5 right-1.5 z-10 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
                  style={{ background: 'linear-gradient(90deg, #FF5F5F, #FF8E53)' }}>
                  限时特惠
                </span>
                <button
                  type="button"
                  onClick={() => router.push('/ai-stories/home')}
                  className="flex h-[46px] w-full items-center justify-center rounded-[23px] text-[14px] font-bold text-white active:opacity-90"
                  style={{
                    background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
                    boxShadow: '0 4px 16px rgba(168,85,247,0.22)',
                  }}>
                  开通会员立即生成
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 no-scrollbar">
        {step === 'role' && (
          <div>
            <div className="text-[13px] text-[#B0A0C8] text-center mb-1">谁来给柚柚讲故事？</div>
            <div className="text-[11px] text-[#D0C8E0] text-center mb-5">选择克隆音色对应的家庭角色</div>

            <div className="text-[13px] font-bold text-[#1A0A2E] mb-2.5">主要角色</div>
            <div className="flex gap-2 mb-5">
              {MAIN_ROLES.map(role => {
                const sel = selectedRole === role.id
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id)
                      setCustomRoleName('')
                    }}
                    className="flex-1 py-4 rounded-[18px] flex flex-col items-center gap-2 border-2 transition-all bg-white"
                    style={{
                      borderColor: sel ? '#7B3FD4' : '#F0E8FF',
                      boxShadow: sel ? '0 4px 16px rgba(123,63,212,0.12)' : 'none',
                    }}>
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-[32px]"
                      style={{
                        background: role.id === 'mom' ? '#FCE4EC' : '#E3F2FD',
                      }}>
                      {role.emoji}
                    </div>
                    <span className="text-[15px] font-black" style={{ color: sel ? '#7B3FD4' : '#1A0A2E' }}>
                      {role.label}
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: sel ? '#7B3FD4' : '#B0A0C8' }}>
                      {sel ? '已选择' : '点击选择'}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="text-[13px] font-bold text-[#1A0A2E] mb-2.5">其他家人</div>
            <div className="bg-white rounded-[18px] border border-[#F0E8FF] p-3 mb-4">
              <div className="grid grid-cols-4 gap-2">
                {FAMILY_GRID_ROLES.map(role => {
                  const sel = selectedRole === role.id
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id)
                        setCustomRoleName('')
                      }}
                      className="py-2.5 rounded-[14px] flex flex-col items-center gap-1.5 border transition-all"
                      style={{
                        background: sel ? '#FFF0F5' : '#FAFAFA',
                        borderColor: sel ? '#E91E63' : '#F0E8FF',
                      }}>
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[18px]"
                        style={{ background: role.circleBg }}>
                        {role.emoji}
                      </div>
                      <span
                        className="text-[11px] font-semibold leading-tight text-center px-0.5"
                        style={{ color: sel ? '#E91E63' : '#1A0A2E' }}>
                        {role.label}
                      </span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setSelectedRole('other')}
                  className="py-2.5 rounded-[14px] flex flex-col items-center justify-center gap-0.5 border-2 border-dashed transition-all min-h-[88px]"
                  style={{
                    borderColor: selectedRole === 'other' ? '#E91E63' : '#D8C8E8',
                    background: selectedRole === 'other' ? '#FFF0F5' : '#FAFAFA',
                  }}>
                  <span className="text-[22px] font-light leading-none" style={{ color: '#B0A0C8' }}>
                    +
                  </span>
                  <span
                    className="text-[10px] font-semibold text-center leading-tight px-0.5"
                    style={{ color: selectedRole === 'other' ? '#E91E63' : '#6B5B8C' }}>
                    其他角色
                  </span>
                </button>
              </div>
            </div>

            {selectedRole === 'other' && (
              <div className="mb-4">
                <div className="text-[12px] font-semibold text-[#6B5B8C] mb-2">填写角色称呼</div>
                <input
                  type="text"
                  value={customRoleName}
                  onChange={e => setCustomRoleName(e.target.value)}
                  placeholder="例如：小姨、哥哥、保姆"
                  maxLength={16}
                  autoFocus
                  className="w-full h-11 px-3.5 rounded-[14px] border-2 border-[#F0E8FF] bg-white text-[15px] text-[#1A0A2E] placeholder:text-[#C4B8D8] outline-none focus:border-[#7B3FD4]"
                />
              </div>
            )}

            <div
              className="flex items-center gap-2 rounded-[12px] px-3 py-2.5 mb-4 border border-[#F8BBD0]"
              style={{ background: '#FFF5F8' }}>
              <span className="text-[16px] flex-shrink-0">🎙️</span>
              <span className="text-[11px] text-[#880E4F] leading-snug">
                会员可克隆<span className="font-black">{VOICE_SLOT_TOTAL}</span>种音色，永久保存
              </span>
            </div>

            <button
              type="button"
              onClick={handleRoleNext}
              disabled={!roleStepCanProceed}
              className="w-full h-12 rounded-full text-white font-bold text-[15px] transition-all"
              style={{
                background: roleStepCanProceed ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#E0D8F0',
              }}>
              开始录制
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#F5F0FF] text-[40px] animate-pulse">
              🎙️
            </div>
            <div className="text-[18px] font-bold text-[#1A0A2E] mb-6">正在学习你的音色</div>
            <div className="w-48 h-2 bg-[#F0E8FF] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7B3FD4] to-[#E91E63] rounded-full animate-pulse" style={{ width: '70%' }}/>
            </div>
          </div>
        )}

          </div>
        )}
      </div>
    </div>
  )
}

export default function VoiceClonePage() {
  return (
    <Suspense
      fallback={
        <div className="phone-shell bg-[#FBF7FF] flex flex-col items-center justify-center text-[#B0A0C8]">
          加载中…
        </div>
      }>
      <VoiceCloneContent />
    </Suspense>
  )
}
