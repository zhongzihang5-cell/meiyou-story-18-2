// lib/llm.ts
// DeepSeek API 封装 — 故事脚本生成
// 替代 Coze 工作流2

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

// ── 月龄阶段定义（对应内容框架 L1-L5）──
export const AGE_STAGES = {
  L1: { label: '0-6月', char: '感官与依恋期', maxWords: 180, sentenceLen: '3-5字', speed: '60-80字/分' },
  L2: { label: '6-12月', char: '探索与模仿期', maxWords: 500, sentenceLen: '5-8字', speed: '80-100字/分' },
  L3: { label: '1-1.5岁', char: '自主与语言期', maxWords: 500, sentenceLen: '5-8字', speed: '80-100字/分' },
  L4: { label: '1.5-2岁', char: '规则与社交期', maxWords: 800, sentenceLen: '6-9字', speed: '100-120字/分' },
  L5: { label: '2-3岁', char: '想象与表达期', maxWords: 1200, sentenceLen: '6-10字', speed: '100-120字/分' },
} as const

export type AgeStage = keyof typeof AGE_STAGES

// ── 故事生成参数 ──
export interface StoryGenParams {
  ageStage: AgeStage         // 月龄阶段
  scene: string              // 场景：睡前故事/晨起故事/外出听听
  seriesName?: string        // 故事系列：小熊冒险记/小兔子日常
  protagonist: string        // 主角：小熊/小兔子/小女孩
  theme: string              // 核心主题：分享/情绪管理/习惯养成
  babyName?: string          // 宝宝名字（定制故事用）
  message?: string           // 寄语（定制故事用）
  baseStoryId?: string       // 基于已有故事定制（传入原故事标题）
}

// ── 生成结果 ──
export interface StoryScript {
  title: string
  age_range: string
  scene: string
  series_name: string
  duration_estimate: string  // 预估时长
  word_count: number
  script: string             // 带【旁白】【角色名】【音效:xxx】【停顿X秒】标注
  summary: string            // 故事梗概（100字以内）
  roles: string[]            // 角色列表，用于换声
}

// ── 构建 Prompt ──
function buildPrompt(params: StoryGenParams): string {
  const stage = AGE_STAGES[params.ageStage]
  const isCustom = !!(params.babyName || params.message)

  const baseRule = `
你是一个专业的0-3岁婴幼儿音频故事编剧。请严格按照以下规范生成故事脚本。

【月龄阶段】${stage.label} · ${stage.char}
【字数限制】正文不超过 ${stage.maxWords} 字
【句长要求】基准句长 ${stage.sentenceLen}，单句最长不超过12字
【语言风格】极致口语化，像家长面对面讲话，零书面语

【脚本格式要求】
- 旁白用：【旁白】文字内容
- 角色对话用：【${params.protagonist}】文字内容
- 音效用：【音效:具体描述】（如：【音效:小鸟叫声】）
- 停顿用：【停顿1秒】或【停顿2秒】
- 开场固定：【音效:轻柔叮咚声】【旁白】嗨，小朋友们，今天的故事开始啦～
- 结尾固定：【旁白】故事讲完啦，${isCustom && params.babyName ? params.babyName : '柚柚'}要乖乖睡觉～【音效:轻柔叮咚声】

【内容禁忌】
- 禁止：恐怖/暴力/危险行为描写
- 禁止：否定式表达（不要说"不行""不能"）
- 禁止：复杂词汇/成语/书面语
- 禁止：超过月龄理解范围的抽象概念
- 必须：情绪正向，结局美好

【互动要求】
- 必含2-3句互动句（如："你也喜欢xxx吗？"）
- 可含1-2句重复句强化记忆

【输出格式】严格按JSON输出，不要有任何多余文字：
{
  "title": "故事标题（4-8字）",
  "age_range": "${stage.label}",
  "scene": "${params.scene}",
  "series_name": "${params.seriesName || params.scene}",
  "duration_estimate": "预估X分钟",
  "word_count": 实际字数数字,
  "summary": "故事梗概不超过80字",
  "roles": ["旁白", "${params.protagonist}", "其他角色名"],
  "script": "完整脚本内容"
}
`

  const storyRequest = isCustom
    ? `
【定制故事要求】
- 主角名字改为：${params.babyName || params.protagonist}
- 故事主题：${params.theme}
- 场景：${params.scene}
- 结尾寄语：${params.message ? `在故事结尾自然融入："${params.message}"` : '无'}
${params.baseStoryId ? `- 参考故事风格：${params.baseStoryId}，但内容全新创作` : ''}
`
    : `
【故事要求】
- 主角：${params.protagonist}
- 主题：${params.theme}
- 场景：${params.scene}
- 系列：${params.seriesName || '独立故事'}
`

  return baseRule + storyRequest
}

// ── 调用 DeepSeek 生成脚本 ──
export async function generateStoryScript(params: StoryGenParams): Promise<StoryScript> {
  const prompt = buildPrompt(params)

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.7,
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek API 调用失败: ${res.status} ${err}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? ''

  // 清理可能的 markdown 代码块
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    const script = JSON.parse(cleaned) as StoryScript
    return script
  } catch {
    throw new Error(`脚本解析失败，原始输出：${content.slice(0, 200)}`)
  }
}

// ── 批量生成（后台用，带重试和延迟）──
export async function generateBatch(
  paramsList: StoryGenParams[],
  onProgress?: (done: number, total: number) => void
): Promise<Array<{ params: StoryGenParams; result: StoryScript | null; error?: string }>> {
  const results = []
  for (let i = 0; i < paramsList.length; i++) {
    const params = paramsList[i]
    try {
      // 每次调用间隔500ms，避免限速
      if (i > 0) await new Promise(r => setTimeout(r, 500))
      const result = await generateStoryScript(params)
      results.push({ params, result })
    } catch (e: any) {
      results.push({ params, result: null, error: e.message })
    }
    onProgress?.(i + 1, paramsList.length)
  }
  return results
}
