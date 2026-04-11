'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { markVoiceSlotDone, roleToVoiceSlot, sessionAudioKey, VOICE_SLOT_TOTAL } from '@/lib/voiceSlots'
import RecordScreenFlow, { VOICE_RECORD_TOTAL_SEGMENTS } from '@/components/voice-clone/RecordScreenFlow'

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

function VoiceCloneContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [customRoleName, setCustomRoleName] = useState('')
  /** 克隆完成页「试听」用，在完成录制时从各句录音复制而来，避免子组件卸载 revoke 后失效 */
  const [clonePreviewUrl, setClonePreviewUrl] = useState<string | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const skipAppliedRef = useRef(false)

  useEffect(() => {
    return () => {
      previewAudioRef.current?.pause()
      previewAudioRef.current = null
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
    router.back()
  }

  const resetFlow = () => {
    if (clonePreviewUrl) URL.revokeObjectURL(clonePreviewUrl)
    setClonePreviewUrl(null)
    previewAudioRef.current?.pause()
    previewAudioRef.current = null
    setStep('role')
    setSelectedRole(null)
    setCustomRoleName('')
  }

  const toggleClonePreview = () => {
    if (!clonePreviewUrl) {
      alert('暂无可播放的录音')
      return
    }
    const cur = previewAudioRef.current
    if (cur && !cur.paused) {
      cur.pause()
      cur.currentTime = 0
      previewAudioRef.current = null
      return
    }
    if (cur) {
      cur.pause()
      previewAudioRef.current = null
    }
    const a = new Audio(clonePreviewUrl)
    previewAudioRef.current = a
    a.onended = () => {
      previewAudioRef.current = null
    }
    a.play().catch(() => {
      previewAudioRef.current = null
      alert('无法播放，请检查浏览器是否允许音频播放')
    })
  }

  const roleMeta = ALL_ROLES.find(r => r.id === selectedRole)
  const roleLabel =
    selectedRole === 'other' ? customRoleName.trim() : (roleMeta?.label ?? '')
  const roleEmoji = selectedRole === 'other' ? OTHER_ROLE.emoji : (roleMeta?.emoji ?? '')

  const roleStepCanProceed =
    !!selectedRole && (selectedRole !== 'other' || !!customRoleName.trim())

  return (
    <div className="phone-shell bg-[#FBF7FF] flex flex-col">
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
          {step === 'processing' && '正在生成音色'}
          {step === 'done' && '克隆完成'}
        </div>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 px-5 pb-8">

        {step === 'role' && (
          <div>
            <div className="text-[13px] text-[#B0A0C8] text-center mb-1">谁来给宝宝讲故事？</div>
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
                会员可克隆<span className="font-black">{VOICE_SLOT_TOTAL}个</span>不同音色，永久保存
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

        {step === 'record' && (
          <RecordScreenFlow
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
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-[56px] mb-4 animate-pulse">{roleEmoji}</div>
            <div className="text-[18px] font-bold text-[#1A0A2E] mb-2">正在生成音色...</div>
            <div className="text-[13px] text-[#B0A0C8] mb-6">AI正在学习{roleLabel}的声音特征</div>
            <div className="w-48 h-2 bg-[#F0E8FF] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7B3FD4] to-[#E91E63] rounded-full animate-pulse" style={{ width: '70%' }}/>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="text-[20px] font-black text-[#1A0A2E] mb-1">{roleLabel}的声音克隆成功！</div>
            <div className="text-[13px] text-[#B0A0C8] mb-6">现在可以用{roleLabel}的声音讲故事了</div>

            <div className="w-full bg-white rounded-[16px] border border-[#F0E8FF] p-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-[24px]"
                  style={{ background: '#FFF0F5' }}>{roleEmoji}</div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-[#1A0A2E]">{roleLabel}的声音</div>
                  <div className="text-[11px] text-[#B0A0C8]">克隆完成 · 今天</div>
                </div>
                <button
                  type="button"
                  onClick={toggleClonePreview}
                  className="px-3 py-1.5 rounded-full text-[12px] font-bold border border-[#E91E63] text-[#E91E63] active:opacity-80">
                  试听
                </button>
              </div>
            </div>

            <button type="button" onClick={() => router.push('/ai-stories/home')}
              className="w-full h-12 rounded-full text-white font-bold text-[15px] mb-3"
              style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
              进入 AI 亲声讲
            </button>
            <button type="button" onClick={() => router.push('/stories')}
              className="w-full h-11 rounded-full border-2 border-[#E0D8F0] bg-white text-[14px] font-bold text-[#6B5B8C] mb-3 active:bg-[#FAF7FF]">
              去听故事
            </button>
            <button type="button" onClick={() => router.push('/my-voices')}
              className="w-full h-11 rounded-full text-[13px] font-bold mb-2 border-2 border-[#E0D8F0] text-[#6B5B8C] active:bg-[#FAF7FF]">
              管理我的声音
            </button>
            <button type="button" onClick={resetFlow}
              className="w-full h-10 text-[13px] text-[#B0A0C8]">
              再录一个角色
            </button>
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
