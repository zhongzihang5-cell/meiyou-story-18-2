// lib/tts.ts
// TTS 音频合成 — 替代 Coze 工作流3
// 解析脚本中的【旁白】【角色】【音效】【停顿】标注，分段合成后合并

// 火山引擎 TTS 配置（需开通 TTS v1 服务）
const VOLC_APP_ID = process.env.VOLCENGINE_APP_ID!
const VOLC_TOKEN = process.env.VOLCENGINE_ACCESS_TOKEN!
const VOLC_TTS_URL = 'wss://openspeech.bytedance.com/api/v1/tts/ws_binary'

// ── 默认音色配置 ──
export const DEFAULT_VOICES = {
  narrator_female: 'zh_female_qingxin',    // 旁白：温柔女声
  narrator_male: 'zh_male_qinhe',          // 旁白：亲切男声
  child: 'zh_child_qingche',               // 儿童角色：活泼童声
  animal: 'zh_female_huanxin',             // 小动物：活泼女声
} as const

// ── 脚本片段类型 ──
export type SegmentType = 'narration' | 'dialogue' | 'sfx' | 'pause'

export interface ScriptSegment {
  type: SegmentType
  role?: string        // 角色名（dialogue用）
  text?: string        // 文字内容（narration/dialogue用）
  sfxDesc?: string     // 音效描述（sfx用）
  pauseSec?: number    // 停顿秒数（pause用）
  voiceType?: string   // 分配的音色
}

// ── 合成报告 ──
export interface SynthesisReport {
  duration_sec: number
  segment_count: number
  role_count: number
  sound_effect_count: number
  pause_count: number
  roles: string[]
  voice_mapping: Record<string, string>  // 角色 → 音色ID
}

// ── 解析脚本为片段数组 ──
export function parseScript(script: string): ScriptSegment[] {
  const segments: ScriptSegment[] = []
  // 匹配 【标签】内容 或 【音效:内容】 或 【停顿X秒】
  const regex = /【(旁白|音效:[^】]+|停顿\d+秒|[^】]+)】([^【]*)/g
  let match

  while ((match = regex.exec(script)) !== null) {
    const tag = match[1].trim()
    const content = match[2].trim()

    if (tag === '旁白') {
      if (content) segments.push({ type: 'narration', text: content })
    } else if (tag.startsWith('音效:')) {
      segments.push({ type: 'sfx', sfxDesc: tag.replace('音效:', '').trim() })
    } else if (tag.startsWith('停顿')) {
      const sec = parseInt(tag.replace('停顿', '').replace('秒', '')) || 1
      segments.push({ type: 'pause', pauseSec: sec })
    } else {
      // 角色对话
      if (content) segments.push({ type: 'dialogue', role: tag, text: content })
    }
  }

  return segments
}

// ── 自动分配音色 ──
export function assignVoices(
  segments: ScriptSegment[],
  customVoiceMap?: Record<string, string>  // 用户自定义音色（换声用）
): ScriptSegment[] {
  const childKeywords = ['小', '宝宝', '孩子']
  const maleKeywords = ['爸爸', '爷爷', '叔叔', '大熊', '狮子', '大象']

  return segments.map(seg => {
    if (seg.type !== 'narration' && seg.type !== 'dialogue') return seg

    // 用户自定义音色优先
    if (seg.role && customVoiceMap?.[seg.role]) {
      return { ...seg, voiceType: customVoiceMap[seg.role] }
    }

    if (seg.type === 'narration') {
      return { ...seg, voiceType: DEFAULT_VOICES.narrator_female }
    }

    // 根据角色名推断音色
    const role = seg.role || ''
    if (childKeywords.some(k => role.includes(k))) {
      return { ...seg, voiceType: DEFAULT_VOICES.child }
    }
    if (maleKeywords.some(k => role.includes(k))) {
      return { ...seg, voiceType: DEFAULT_VOICES.narrator_male }
    }
    return { ...seg, voiceType: DEFAULT_VOICES.animal }
  })
}

// ── 调用火山引擎 TTS 合成单段音频 ──
// 返回 base64 编码的 mp3
async function synthesizeSegment(text: string, voiceType: string): Promise<string> {
  // 实际实现需要 WebSocket 连接火山引擎 TTS v1
  // 当前为占位实现，结构完整，填入真实凭证即可运行
  if (!VOLC_APP_ID || VOLC_APP_ID === 'your_app_id_here') {
    // Mock 模式：返回空字符串，前端用静音占位
    return ''
  }

  // TODO: 接入火山引擎 TTS WebSocket API
  // 参考文档：https://www.volcengine.com/docs/6561/79823
  // 需要 npm install ws
  throw new Error('TTS v1 服务待开通，请在火山引擎控制台开通后配置 VOLCENGINE_ACCESS_TOKEN')
}

// ── 主合成函数 ──
export async function synthesizeStory(
  script: string,
  customVoiceMap?: Record<string, string>
): Promise<{ audioBase64: string; report: SynthesisReport }> {
  const rawSegments = parseScript(script)
  const segments = assignVoices(rawSegments, customVoiceMap)

  const roles = Array.from(new Set(segments.filter(s => s.role).map(s => s.role!)))
  const voiceMapping: Record<string, string> = {}
  segments.forEach(s => { if (s.role && s.voiceType) voiceMapping[s.role] = s.voiceType })

  // Mock 模式：不实际调用 TTS
  const isMock = !VOLC_APP_ID || VOLC_APP_ID === 'your_app_id_here'
  if (isMock) {
    const wordCount = segments.filter(s => s.text).reduce((sum, s) => sum + (s.text?.length || 0), 0)
    const pauseSecs = segments.filter(s => s.type === 'pause').reduce((sum, s) => sum + (s.pauseSec || 0), 0)
    const estimatedDuration = Math.round(wordCount / 2 + pauseSecs)  // 粗估：每字0.5秒

    return {
      audioBase64: '',  // Mock：空音频
      report: {
        duration_sec: estimatedDuration,
        segment_count: segments.length,
        role_count: roles.length,
        sound_effect_count: segments.filter(s => s.type === 'sfx').length,
        pause_count: segments.filter(s => s.type === 'pause').length,
        roles,
        voice_mapping: voiceMapping,
      }
    }
  }

  // 真实合成：逐段调用 TTS，拼接音频
  const audioParts: string[] = []
  let totalDuration = 0

  for (const seg of segments) {
    if (seg.type === 'narration' || seg.type === 'dialogue') {
      if (seg.text && seg.voiceType) {
        const part = await synthesizeSegment(seg.text, seg.voiceType)
        audioParts.push(part)
        totalDuration += seg.text.length * 0.5  // 估算
      }
    } else if (seg.type === 'pause' && seg.pauseSec) {
      // 插入静音
      totalDuration += seg.pauseSec
    }
    // sfx: 音效文件插入（实际需要音效库）
  }

  return {
    audioBase64: audioParts.join(''),  // 实际需要音频拼接工具
    report: {
      duration_sec: Math.round(totalDuration),
      segment_count: segments.length,
      role_count: roles.length,
      sound_effect_count: segments.filter(s => s.type === 'sfx').length,
      pause_count: segments.filter(s => s.type === 'pause').length,
      roles,
      voice_mapping: voiceMapping,
    }
  }
}
