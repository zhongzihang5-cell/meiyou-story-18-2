'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'role' | 'prepare' | 'record' | 'processing' | 'done'
type Role =
  | 'mom'
  | 'dad'
  | 'grandma'
  | 'grandpa'
  | 'waipo'
  | 'waigong'
  | 'nainai'
  | 'yeye'
  | 'other'
  | null

const MAIN_ROLES = [
  { id: 'mom' as const, label: '妈妈', emoji: '👩' },
  { id: 'dad' as const, label: '爸爸', emoji: '👨' },
]

const OTHER_ROLE = { id: 'other' as const, label: '其他角色', emoji: '✨' }

const MORE_ROLES = [
  { id: 'nainai' as const, label: '奶奶', emoji: '👵' },
  { id: 'yeye' as const, label: '爷爷', emoji: '👴' },
  { id: 'waipo' as const, label: '姥姥', emoji: '👵' },
  { id: 'waigong' as const, label: '姥爷', emoji: '👴' },
  { id: 'grandma' as const, label: '外婆', emoji: '👵' },
  { id: 'grandpa' as const, label: '外公', emoji: '👴' },
]

const ALL_ROLES = [...MAIN_ROLES, OTHER_ROLE, ...MORE_ROLES]

const SENTENCES = [
  '小宝贝，今天妈妈给你讲一个温暖的故事。',
  '在一片美丽的森林里，住着一只可爱的小兔子。',
  '小兔子有一双长长的耳朵，走到哪里都很开心。',
  '每天早上，它都会去草地上采摘新鲜的蔬菜。',
  '有一天，小兔子遇到了一只迷路的小鸟。',
  '小兔子说：别担心，我帮你找到回家的路。',
  '它们一起走啊走，终于找到了小鸟的家。',
  '小鸟的妈妈非常感谢小兔子，送给它一束花。',
  '小兔子开心地说：帮助朋友，是最快乐的事。',
  '宝宝，要像小兔子一样善良，好不好？',
]

/** mock：false = 免费用户（先见会员引导，点「立即录制」进入正式准备页）；true = 直接准备页 */
const IS_MEMBER = false

const STEPS_BAR = ['role', 'prepare', 'record'] as const

export default function VoiceClonePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [showMore, setShowMore] = useState(false)
  const [prepareUnlocked, setPrepareUnlocked] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordedCount, setRecordedCount] = useState(0)
  const [currentSentence, setCurrentSentence] = useState(0)
  const [progress, setProgress] = useState(0)
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentSentenceRef = useRef(0)

  useEffect(() => {
    currentSentenceRef.current = currentSentence
  }, [currentSentence])

  useEffect(() => () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current)
      recordIntervalRef.current = null
    }
  }, [])

  const showMemberPrepare = IS_MEMBER || prepareUnlocked

  const handleRoleNext = () => {
    if (!selectedRole) return
    setStep('prepare')
  }

  const handleStartRecord = () => {
    setStep('record')
  }

  const handleRecord = () => {
    if (recording) return
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current)
      recordIntervalRef.current = null
    }
    setRecording(true)
    let p = 0
    recordIntervalRef.current = setInterval(() => {
      p += 5
      setProgress(p)
      if (p >= 100) {
        if (recordIntervalRef.current) {
          clearInterval(recordIntervalRef.current)
          recordIntervalRef.current = null
        }
        setRecording(false)
        setProgress(0)
        const idx = currentSentenceRef.current
        if (idx < SENTENCES.length - 1) {
          setCurrentSentence(idx + 1)
          setRecordedCount(c => c + 1)
        } else {
          setRecordedCount(SENTENCES.length)
          setStep('processing')
          setTimeout(() => setStep('done'), 3000)
        }
      }
    }, 80)
  }

  const handleBack = () => {
    if (step === 'role') {
      router.back()
      return
    }
    if (step === 'prepare') {
      if (!IS_MEMBER && prepareUnlocked) {
        setPrepareUnlocked(false)
      } else {
        setStep('role')
      }
      return
    }
    if (step === 'record') {
      setStep('prepare')
      return
    }
    router.back()
  }

  const resetFlow = () => {
    setStep('role')
    setSelectedRole(null)
    setRecordedCount(0)
    setCurrentSentence(0)
    currentSentenceRef.current = 0
    setPrepareUnlocked(false)
    setShowMore(false)
    setRecording(false)
    setProgress(0)
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current)
      recordIntervalRef.current = null
    }
  }

  const roleMeta = ALL_ROLES.find(r => r.id === selectedRole)
  const roleLabel = roleMeta?.label ?? ''
  const roleEmoji = roleMeta?.emoji ?? ''

  const stepIdx = STEPS_BAR.indexOf(step as (typeof STEPS_BAR)[number])

  return (
    <div className="phone-shell bg-[#FBF7FF] flex flex-col min-h-[844px]">
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
          {step === 'prepare' && '录制前准备'}
          {step === 'record' && `录制声音（${recordedCount + 1}/${SENTENCES.length}）`}
          {step === 'processing' && '正在生成音色'}
          {step === 'done' && '克隆完成'}
        </div>
        <div className="w-9" />
      </div>

      {(step === 'role' || step === 'prepare' || step === 'record') && (
        <div className="flex gap-1.5 px-5 mb-4 flex-shrink-0">
          {STEPS_BAR.map(s => (
            <div key={s} className="flex-1 h-1 rounded-full"
              style={{
                background:
                  stepIdx >= 0 && STEPS_BAR.indexOf(s) <= stepIdx ? '#E91E63' : '#F0E8FF',
              }}/>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 min-h-0">

        {step === 'role' && (
          <div>
            <div className="text-[13px] text-[#B0A0C8] text-center mb-6">选择谁来给宝宝讲故事</div>

            <div className="flex gap-2 mb-3">
              {[...MAIN_ROLES, OTHER_ROLE].map(role => (
                <button key={role.id} type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className="flex-1 py-5 rounded-[16px] flex flex-col items-center gap-2 border-2 transition-all"
                  style={{
                    background: selectedRole === role.id ? '#FFF0F5' : '#fff',
                    borderColor: selectedRole === role.id ? '#E91E63' : '#F0E8FF',
                  }}>
                  <span className="text-[36px]">{role.emoji}</span>
                  <span className="text-[14px] font-bold"
                    style={{ color: selectedRole === role.id ? '#E91E63' : '#1A0A2E' }}>
                    {role.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[14px] border border-[#F0E8FF] overflow-hidden mb-6">
              <button type="button" onClick={() => setShowMore(m => !m)}
                className="w-full px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {MORE_ROLES.slice(0, 3).map(r => (
                      <span key={r.id} className="text-[18px]" style={{ marginRight: -4 }}>{r.emoji}</span>
                    ))}
                  </div>
                  <span className="text-[13px] text-[#888] ml-2">更多长辈角色</span>
                </div>
                <span className="text-[12px] text-[#E91E63]">{showMore ? '收起 ∧' : '展开 ›'}</span>
              </button>

              {showMore && (
                <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                  {MORE_ROLES.map(role => (
                    <button key={role.id} type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className="py-3 rounded-[12px] flex flex-col items-center gap-1 border transition-all"
                      style={{
                        background: selectedRole === role.id ? '#FFF0F5' : '#FAFAFA',
                        borderColor: selectedRole === role.id ? '#E91E63' : '#F0E8FF',
                      }}>
                      <span className="text-[24px]">{role.emoji}</span>
                      <span className="text-[12px] font-semibold"
                        style={{ color: selectedRole === role.id ? '#E91E63' : '#1A0A2E' }}>
                        {role.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" onClick={handleRoleNext}
              disabled={!selectedRole}
              className="w-full h-12 rounded-full text-white font-bold text-[15px] transition-all"
              style={{ background: selectedRole ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#E0D8F0' }}>
              下一步
            </button>
          </div>
        )}

        {step === 'prepare' && (
          <div>
            {!showMemberPrepare ? (
              <div>
                <div className="text-center mb-5">
                  <div className="text-[56px] mb-2">{roleEmoji}</div>
                  <div className="text-[18px] font-black text-[#1A0A2E] mb-1">
                    用{roleLabel}的声音<br/>陪伴宝宝入睡
                  </div>
                  <div className="text-[13px] text-[#B0A0C8]">只需录制15秒，AI帮你永久保存</div>
                </div>

                <div className="bg-white rounded-[16px] border border-[#F0E8FF] p-4 mb-4">
                  <div className="text-[13px] font-bold text-[#1A0A2E] mb-3">开通会员，解锁声音克隆</div>
                  {[
                    { icon: '🌙', title: '宝宝睡得更香', desc: '听到爸妈真实声音，安全感更强' },
                    { icon: '⚡', title: '15秒完成录制', desc: 'AI克隆准确率97%，效果逼真' },
                    { icon: '📚', title: '全部200个故事', desc: '所有故事均可一键换成你的声音' },
                    { icon: '💾', title: '永久保存', desc: '克隆一次，随时使用，永不过期' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3 py-2.5 border-b border-[#F9F0FF] last:border-0">
                      <span className="text-[20px] flex-shrink-0">{item.icon}</span>
                      <div>
                        <div className="text-[13px] font-semibold text-[#1A0A2E]">{item.title}</div>
                        <div className="text-[11px] text-[#B0A0C8] mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#FFF0F5] rounded-[14px] p-3 mb-5 border border-[#F8BBD0]">
                  <div className="text-[11px] text-[#E91E63] font-bold mb-1">💬 来自其他妈妈的评价</div>
                  <div className="text-[12px] text-[#880E4F] leading-relaxed">
                    「用自己的声音录完之后，宝宝每次听故事都特别安静，感觉真的在听我讲话一样，太感动了！」
                  </div>
                  <div className="text-[11px] text-[#F48FB1] mt-1">— 来自 8个月宝妈</div>
                </div>

                <button type="button" onClick={() => setPrepareUnlocked(true)}
                  className="w-full h-12 rounded-full text-white font-bold text-[15px] mb-2"
                  style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)', boxShadow: '0 6px 20px rgba(233,30,99,0.3)' }}>
                  开通会员 · 立即录制
                </button>
                <div className="text-center text-[11px] text-[#B0A0C8]">演示场景：点击即可进入录制准备与演示流程</div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-5">
                  <div className="text-[48px] mb-2">{roleEmoji}</div>
                  <div className="text-[16px] font-bold text-[#1A0A2E]">准备录制{roleLabel}的声音</div>
                  <div className="text-[12px] text-[#B0A0C8] mt-1">共10句话，约1分钟</div>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  {[
                    { icon: '🔇', title: '保持环境安静', desc: '关闭电视、空调，找个安静的房间' },
                    { icon: '📱', title: '手机距离适中', desc: '距离15-20cm，正常音量说话' },
                    { icon: '🗣️', title: '用讲故事的语气', desc: '温柔舒缓，克隆效果更逼真' },
                    { icon: '📝', title: '完整朗读每一句', desc: '不要中途停顿，读错了可以重录' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3 bg-white rounded-[14px] p-3.5 border border-[#F0E8FF]">
                      <span className="text-[22px] flex-shrink-0">{item.icon}</span>
                      <div>
                        <div className="text-[13px] font-bold text-[#1A0A2E]">{item.title}</div>
                        <div className="text-[11px] text-[#B0A0C8] mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={handleStartRecord}
                  className="w-full h-12 rounded-full text-white font-bold text-[15px]"
                  style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)', boxShadow: '0 6px 20px rgba(233,30,99,0.3)' }}>
                  准备好了，开始录制
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'record' && (
          <div className="flex flex-col items-center">
            <div className="flex gap-1.5 mb-6 w-full">
              {SENTENCES.map((_, i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full"
                  style={{
                    background:
                      i < recordedCount ? '#E91E63' : i === recordedCount ? '#F48FB1' : '#F0E8FF',
                  }}/>
              ))}
            </div>

            <div className="w-full bg-white rounded-[16px] border border-[#F0E8FF] p-5 mb-6 text-center">
              <div className="text-[11px] text-[#B0A0C8] mb-3">请朗读以下内容</div>
              <div className="text-[16px] font-semibold text-[#1A0A2E] leading-relaxed">
                {SENTENCES[currentSentence]}
              </div>
            </div>

            <div className="relative mb-4">
              {recording && (
                <div className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'rgba(233,30,99,0.2)', transform: 'scale(1.4)' }}/>
              )}
              <button type="button" onClick={handleRecord}
                disabled={recording}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: recording ? '#F48FB1' : 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" fill="none"/>
                  <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2"/>
                  <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            {recording && (
              <div className="w-full h-1.5 bg-[#F0E8FF] rounded-full overflow-hidden mb-3">
                <div className="h-full bg-[#E91E63] rounded-full transition-all"
                  style={{ width: `${progress}%` }}/>
              </div>
            )}

            <div className="text-[12px] text-[#B0A0C8]">
              {recording ? '录制中，请朗读文字...' : '点击麦克风开始录制'}
            </div>
          </div>
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
                <button type="button" className="px-3 py-1.5 rounded-full text-[12px] font-bold border border-[#E91E63] text-[#E91E63]">
                  试听
                </button>
              </div>
            </div>

            <button type="button" onClick={() => router.push('/')}
              className="w-full h-12 rounded-full text-white font-bold text-[15px] mb-3"
              style={{ background: 'linear-gradient(135deg,#7B3FD4,#E91E63)' }}>
              去听故事
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
