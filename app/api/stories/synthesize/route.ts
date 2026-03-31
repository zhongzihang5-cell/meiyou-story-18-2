// app/api/stories/synthesize/route.ts
// 音频合成 API — 共用节点
// 后台批量 + 用户定制 都走这里

import { NextRequest, NextResponse } from 'next/server'
import { synthesizeStory } from '@/lib/tts'
import { auditAudio, auditWithRetry } from '@/lib/audit'
import { saveVoicePackage } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      script,          // 故事脚本（含标注）
      storyId,         // 关联的 story_scripts.id
      ageStage,        // 月龄阶段（用于审核）
      customVoiceMap,  // 自定义音色（换声用）{ 角色名: speaker_id }
      mode = 'batch',  // 'batch' | 'user'
      skipAudit = false, // 换声路径跳过审核
    } = body

    if (!script) {
      return NextResponse.json({ error: '缺少脚本内容' }, { status: 400 })
    }

    // ── 换声路径：跳过AI音频审核，直接合成输出 ──
    if (skipAudit) {
      const { audioBase64, report } = await synthesizeStory(script, customVoiceMap)
      await saveAudioRecord(storyId, audioBase64, report, 'replaced')
      return NextResponse.json({ success: true, report, mock: !audioBase64, skipped_audit: true })
    }

    // ── 常规路径：合成 + AI音频审核（最多重试3次）──
    const result = await auditWithRetry(
      async () => {
        const synth = await synthesizeStory(script, customVoiceMap)
        return synth
      },
      async ({ report }) => auditAudio(script, report, ageStage || 'L3'),
      3,
      mode
    )

    if (!result.item) {
      return NextResponse.json({
        error: mode === 'batch' ? '音频质量不达标，已丢弃' : '音频生成质量未达标，请重试',
        reason: result.reason,
        audit: result.auditResult,
      }, { status: 422 })
    }

    const { audioBase64, report } = result.item

    // ── 写入数据库 ──
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                   process.env.NEXT_PUBLIC_SUPABASE_URL === 'placeholder'

    if (!isMock && storyId) {
      await saveAudioRecord(storyId, audioBase64, report, 'pending_review')
    }

    return NextResponse.json({
      success: true,
      report,
      audio_url: null,   // 真实音频 URL 由 Supabase Storage 生成
      mock: !audioBase64,
      audit: {
        score: result.auditResult?.score,
        retries: result.retries,
      },
    })

  } catch (err: any) {
    console.error('[stories/synthesize]', err)
    return NextResponse.json({ error: err.message || '合成失败' }, { status: 500 })
  }
}

async function saveAudioRecord(
  storyId: string,
  audioBase64: string,
  report: any,
  status: string
) {
  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL === 'placeholder'
  if (isMock) return

  const { supabase } = await import('@/lib/supabase')
  await supabase.from('story_audio').insert({
    story_id: storyId,
    final_audio_url: null,   // 上传到 Storage 后填入
    total_duration_sec: report.duration_sec,
    synthesis_report: report,
    status,
    created_at: new Date().toISOString(),
  })
}
