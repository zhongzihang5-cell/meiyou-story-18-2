// lib/audit.ts
// AI 审核打分系统 — 脚本审核 + 音频审核
// 分数 ≥90 通过，最多重试3次

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

// ── 审核结果 ──
export interface AuditResult {
  score: number              // 总分 0-100
  passed: boolean            // 是否通过（≥90）
  dimensions: {
    age_fit: number          // 月龄适配性 (0-20)
    language: number         // 语言规范性 (0-20)
    structure: number        // 故事结构完整性 (0-20)
    safety: number           // 内容安全性 (0-20) — 一票否决项
    interaction: number      // 互动设计 (0-20)
  }
  issues: string[]           // 存在的问题（不通过时说明原因）
  fatal: boolean             // 致命问题（安全类，直接丢弃不重试）
}

// ── 脚本审核 ──
export async function auditScript(
  script: string,
  ageStage: string,
  wordCount: number
): Promise<AuditResult> {
  const prompt = `
你是一个严格的婴幼儿故事内容审核员。请对以下故事脚本进行评分。

【故事脚本】
${script}

【月龄阶段】${ageStage}
【实际字数】${wordCount}

请从以下5个维度打分，每项满分20分，总分100分：

1. 月龄适配性（0-20）：语言难度、词汇量、句子长度是否符合该月龄
2. 语言规范性（0-20）：是否口语化、无书面语、无复杂词汇
3. 故事结构（0-20）：开场/发展/互动/结尾是否完整，含有互动句
4. 内容安全（0-20）：无恐怖/暴力/危险/否定式表达。如有任何安全问题直接给0分
5. 互动设计（0-20）：互动句是否自然贴切，是否有重复句强化记忆

严格按JSON输出，不要有任何多余文字：
{
  "score": 总分数字,
  "dimensions": {
    "age_fit": 分数,
    "language": 分数,
    "structure": 分数,
    "safety": 分数,
    "interaction": 分数
  },
  "issues": ["问题描述1", "问题描述2"],
  "fatal": false
}

注意：issues 为空数组时表示无问题。fatal 为 true 仅在内容安全得0分时设置。
`

  return await callAuditLLM(prompt)
}

// ── 音频审核（基于脚本+合成报告）──
export async function auditAudio(
  script: string,
  synthesisReport: {
    duration_sec: number
    role_count: number
    sound_effect_count: number
    pause_count: number
  },
  ageStage: string
): Promise<AuditResult> {
  const prompt = `
你是一个严格的婴幼儿音频故事审核员。请根据故事脚本和合成报告评估音频质量。

【故事脚本】
${script}

【合成报告】
- 总时长：${synthesisReport.duration_sec}秒（${(synthesisReport.duration_sec / 60).toFixed(1)}分钟）
- 角色数量：${synthesisReport.role_count}个
- 音效数量：${synthesisReport.sound_effect_count}个
- 停顿数量：${synthesisReport.pause_count}个
- 月龄阶段：${ageStage}

请从以下5个维度打分（每项20分）：

1. 时长适配（0-20）：时长是否符合该月龄（0-6月:1-3分钟, 6-12月:3-5分钟, 1-2岁:3-5分钟, 2-3岁:5-10分钟）
2. 内容安全（0-20）：脚本是否存在安全隐患，有则给0分
3. 结构完整（0-20）：开场音效/正文/互动/结尾是否完整
4. 音效设计（0-20）：音效数量和位置是否合理，1-3个为佳
5. 节奏停顿（0-20）：停顿是否在合适位置，有利于宝宝理解

严格按JSON输出：
{
  "score": 总分,
  "dimensions": {
    "age_fit": 分数,
    "language": 分数,
    "structure": 分数,
    "safety": 分数,
    "interaction": 分数
  },
  "issues": ["问题描述"],
  "fatal": false
}
`

  return await callAuditLLM(prompt)
}

// ── 调用LLM做审核 ──
async function callAuditLLM(prompt: string): Promise<AuditResult> {
  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.1,   // 审核用低温度，结果更稳定
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`审核API调用失败: ${res.status}`)

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  const result = JSON.parse(cleaned) as AuditResult
  result.passed = result.score >= 90
  return result
}

// ── 带重试的审核包装器 ──
export async function auditWithRetry<T>(
  generateFn: () => Promise<T>,
  auditFn: (item: T) => Promise<AuditResult>,
  maxRetries = 3,
  mode: 'batch' | 'user' = 'batch'
): Promise<{ item: T | null; auditResult: AuditResult | null; retries: number; reason: string }> {
  let lastResult: AuditResult | null = null
  let lastItem: T | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const item = await generateFn()
    const result = await auditFn(item)
    lastResult = result
    lastItem = item

    if (result.passed) {
      return { item, auditResult: result, retries: attempt, reason: 'passed' }
    }

    // 致命问题：直接丢弃，不再重试
    if (result.fatal) {
      return { item: null, auditResult: result, retries: attempt, reason: 'fatal_content' }
    }

    // 用户模式：重试3次都不过，返回失败原因让用户修改
    if (mode === 'user' && attempt === maxRetries - 1) {
      return { item: null, auditResult: result, retries: attempt, reason: 'user_retry_exceeded' }
    }
  }

  // 批量模式：3次不过，丢弃
  return { item: null, auditResult: lastResult, retries: maxRetries, reason: 'batch_discard' }
}
