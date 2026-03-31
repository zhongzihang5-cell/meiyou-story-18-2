// app/api/stories/generate/route.ts
// 故事脚本生成 API
// 用户定制 + 后台批量共用同一套生成逻辑

import { NextRequest, NextResponse } from 'next/server'
import { generateStoryScript, type StoryGenParams } from '@/lib/llm'
import { auditScript, auditWithRetry } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      ageStage,
      scene,
      seriesName,
      protagonist,
      theme,
      babyName,
      message,
      baseStoryId,
      mode = 'user',       // 'user' | 'batch'
      userId,
    } = body

    // 参数校验
    if (!ageStage || !protagonist || !theme) {
      return NextResponse.json({ error: '缺少必要参数：ageStage / protagonist / theme' }, { status: 400 })
    }

    // 用户模式：检查次数限制（mock：直接放行）
    if (mode === 'user' && userId) {
      const usageCheck = await checkUserQuota(userId)
      if (!usageCheck.allowed) {
        return NextResponse.json({
          error: '本月定制次数已用完',
          quota: usageCheck,
        }, { status: 429 })
      }
    }

    const params: StoryGenParams = {
      ageStage, scene: scene || '睡前故事',
      seriesName, protagonist,
      theme, babyName, message, baseStoryId,
    }

    // 带重试的生成+审核
    const result = await auditWithRetry(
      () => generateStoryScript(params),
      async (script) => auditScript(script.script, script.age_range, script.word_count),
      3,
      mode
    )

    if (!result.item) {
      // 用户模式：告知用户修改方向
      if (mode === 'user' && result.reason === 'user_retry_exceeded') {
        return NextResponse.json({
          error: '故事生成质量未达标，请尝试修改主题或寄语',
          issues: result.auditResult?.issues ?? [],
          hint: buildUserHint(result.auditResult?.issues ?? []),
        }, { status: 422 })
      }
      // 批量模式：丢弃
      return NextResponse.json({
        error: '生成质量不达标，已丢弃',
        reason: result.reason,
        audit: result.auditResult,
      }, { status: 422 })
    }

    // 用户模式：消耗一次配额（mock跳过）
    if (mode === 'user' && userId) {
      await consumeUserQuota(userId)
    }

    return NextResponse.json({
      success: true,
      script: result.item,
      audit: {
        score: result.auditResult?.score,
        passed: true,
        retries: result.retries,
      },
      mode,
    })

  } catch (err: any) {
    console.error('[stories/generate]', err)
    return NextResponse.json({ error: err.message || '生成失败' }, { status: 500 })
  }
}

// ── 用户配额检查（连接 Supabase）──
async function checkUserQuota(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  // mock：直接允许（接入 Supabase 后实现）
  // 实际：查 user_quotas 表，会员10次/月，免费1次/月
  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL === 'placeholder'
  if (isMock) return { allowed: true, used: 0, limit: 10 }

  const { supabase } = await import('@/lib/supabase')
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { count } = await supabase
    .from('user_story_quotas')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart)

  const used = count ?? 0
  const limit = 10  // TODO: 根据用户会员状态动态获取
  return { allowed: used < limit, used, limit }
}

async function consumeUserQuota(userId: string): Promise<void> {
  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL === 'placeholder'
  if (isMock) return

  const { supabase } = await import('@/lib/supabase')
  await supabase.from('user_story_quotas').insert({ user_id: userId, created_at: new Date().toISOString() })
}

// ── 根据问题生成用户提示 ──
function buildUserHint(issues: string[]): string {
  if (issues.length === 0) return '请尝试换一个主题或角色'
  const hints: Record<string, string> = {
    '月龄': '请检查选择的月龄是否正确',
    '安全': '寄语中包含不适合的内容，请修改',
    '字数': '故事内容过长，请简化主题',
    '互动': '请在寄语中加入一些温馨的话语',
  }
  for (const [key, hint] of Object.entries(hints)) {
    if (issues.some(i => i.includes(key))) return hint
  }
  return `生成遇到问题：${issues[0]}，请调整后重试`
}
