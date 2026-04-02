/** 我的声音：3 个槽位（妈妈 / 爸爸 / 其他家人） */

export type VoiceSlotId = 'mom' | 'dad' | 'elder'

export type VoiceSlotMeta = {
  done: boolean
  date?: string
  sentences?: number
}

export type VoiceSlotsState = Record<VoiceSlotId, VoiceSlotMeta>

const STORAGE_KEY = 'meiyou_voice_slots_v1'

export const VOICE_SLOT_TOTAL = 3

/** 首次进入演示：妈妈已有一条克隆 */
const DEFAULT_SLOTS: VoiceSlotsState = {
  mom: { done: true, date: '2026-03-28', sentences: 10 },
  dad: { done: false },
  elder: { done: false },
}

/**
 * 仅用于首帧 state 初始化，须与 SSR 输出一致。
 * 勿用 getVoiceSlots() 做 useState 初值，否则客户端会读 localStorage 导致 hydration 报错。
 */
export function getVoiceSlotsServerSnapshot(): VoiceSlotsState {
  return {
    mom: { ...DEFAULT_SLOTS.mom },
    dad: { ...DEFAULT_SLOTS.dad },
    elder: { ...DEFAULT_SLOTS.elder },
  }
}

export function getVoiceSlots(): VoiceSlotsState {
  if (typeof window === 'undefined') return DEFAULT_SLOTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SLOTS }
    const parsed = JSON.parse(raw) as Partial<VoiceSlotsState>
    return {
      mom: { ...DEFAULT_SLOTS.mom, ...parsed.mom },
      dad: { ...DEFAULT_SLOTS.dad, ...parsed.dad },
      elder: { ...DEFAULT_SLOTS.elder, ...parsed.elder },
    }
  } catch {
    return { ...DEFAULT_SLOTS }
  }
}

export function setVoiceSlots(next: VoiceSlotsState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function markVoiceSlotDone(id: VoiceSlotId, meta: { date: string; sentences: number }) {
  const cur = getVoiceSlots()
  cur[id] = { done: true, ...meta }
  setVoiceSlots(cur)
}

/** 克隆所选角色对应管理页槽位：爸妈各对应一项，其余合并为「其他家人」槽 */
export function roleToVoiceSlot(role: string | null): VoiceSlotId | null {
  if (role === 'mom') return 'mom'
  if (role === 'dad') return 'dad'
  if (!role) return null
  return 'elder'
}

export function sessionAudioKey(slot: VoiceSlotId) {
  return `meiyou_voice_audio_${slot}`
}

export function countDoneSlots(slots: VoiceSlotsState) {
  return (['mom', 'dad', 'elder'] as const).filter(id => slots[id].done).length
}
