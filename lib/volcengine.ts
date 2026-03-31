// 火山引擎豆包声音复刻 API 封装
// 文档：https://www.volcengine.com/docs/6561/1305191

const APP_ID = process.env.VOLCENGINE_APP_ID!
const ACCESS_TOKEN = process.env.VOLCENGINE_ACCESS_TOKEN!

const BASE_URL = 'https://openspeech.bytedance.com/api/v3'

// ── 类型 ──
export interface CloneRequest {
  audioBase64: string       // base64编码的录音
  audioFormat: 'wav' | 'mp3' | 'm4a' | 'webm'
  language?: number         // 0=中文
  modelType?: number        // 4=ICL2.0（最新效果）
}

export interface CloneResponse {
  speaker_id: string
  status: number            // 0=处理中 1=失败 2=完成
  demo_audio?: string       // 试听URL
}

export interface SynthesisRequest {
  text: string
  speakerId: string
  speed?: number            // 0.5-2.0，默认1.0
  encoding?: 'mp3' | 'wav'
}

// ── 声音复刻 ──
export async function cloneVoice(req: CloneRequest): Promise<CloneResponse> {
  const body = {
    speaker_id: `S_meiyou_${Date.now()}`, // 预生成ID，火山引擎v3需要提前下单获取
    appid: APP_ID,
    audios: [{
      audio_bytes: req.audioBase64,
      audio_format: req.audioFormat,
    }],
    source: 2,
    language: req.language ?? 0,
    model_type: req.modelType ?? 4,
    extra_params: JSON.stringify({ voice_clone_denoise_model_id: '' }),
  }

  const res = await fetch(`${BASE_URL}/tts/voice_clone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer; ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`声音克隆失败: ${res.status} ${err}`)
  }

  return res.json()
}

// ── 查询克隆状态 ──
export async function queryCloneStatus(speakerId: string): Promise<CloneResponse> {
  const body = { appid: APP_ID, speaker_id: speakerId }

  const res = await fetch(`${BASE_URL}/tts/voice_clone/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer; ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`状态查询失败: ${res.status}`)
  return res.json()
}

// ── 用克隆音色合成语音（WebSocket版，适合长文本）──
// 注意：换声TTS需要火山引擎TTS v1服务单独开通
export async function synthesizeWithClonedVoice(req: SynthesisRequest): Promise<Buffer> {
  // 实现说明：
  // 1. 建立 WebSocket 连接到 wss://openspeech.bytedance.com/api/v1/tts/ws_binary
  // 2. 发送合成请求（含 voice_type = speakerId）
  // 3. 接收音频流并合并
  // 当前占位实现，实际接入时需要 ws 包：npm install ws
  throw new Error('换声TTS待接入：需要开通火山引擎TTS v1服务')
}

// ── 录音质量检测（本地规则校验）──
export function validateRecording(audioBase64: string, durationSec: number): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // 时长检查（至少5秒，最多60秒）
  if (durationSec < 5) issues.push('录音时间太短，至少需要5秒')
  if (durationSec > 60) issues.push('录音时间太长，请控制在60秒以内')
  
  // 文件大小检查（base64解码后大小估算）
  const estimatedBytes = (audioBase64.length * 3) / 4
  if (estimatedBytes < 5000) issues.push('录音文件太小，可能录制失败')
  if (estimatedBytes > 5 * 1024 * 1024) issues.push('录音文件过大，请缩短时间')

  return { valid: issues.length === 0, issues }
}

// ── 朗读句子列表（10句，覆盖常见发音）──
export const READING_SENTENCES = [
  '从前，在一片茂密的森林里，住着一只可爱的小熊。',
  '小熊每天早上都会对着太阳说：今天又是美好的一天！',
  '妈妈的怀抱是世界上最温暖的地方，宝宝最喜欢了。',
  '小兔子跳呀跳，遇见了好朋友，大家一起玩游戏。',
  '今天我们来学一首古诗：床前明月光，疑是地上霜。',
  '宝宝乖，不哭哦，爸爸妈妈永远在你身边保护你。',
  '大树爷爷说：孩子们，只要努力，梦想就会实现。',
  '晚上，星星一颗一颗地亮起来，月亮公公也出来了。',
  '小花猫喵喵叫，小狗汪汪汪，森林里真热闹啊。',
  '故事讲完啦，宝宝要乖乖睡觉，明天又是新的一天。',
]
