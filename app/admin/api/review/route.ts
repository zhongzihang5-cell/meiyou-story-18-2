// app/admin/api/review/route.ts
// 审核工作台 API — 通过/退回故事

import { NextRequest, NextResponse } from 'next/server'

// ── GET: 获取待审核故事列表 ──
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'pending_review'
  const page = Number(searchParams.get('page') || 1)
  const limit = 20

  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL === 'placeholder'

  if (isMock) {
    return NextResponse.json({ stories: [], total: 0, page, mock: true })
  }

  const { supabase } = await import('@/lib/supabase')

  // 联表查询：story_scripts + story_audio
  const { data, count, error } = await supabase
    .from('story_scripts')
    .select(`
      id, story_json, status, created_at,
      story_audio (
        story_id, final_audio_url, total_duration_sec, synthesis_report, status
      )
    `, { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ stories: data, total: count, page })
}

// ── POST: 审核操作（通过/退回）──
export async function POST(req: NextRequest) {
  try {
    const { storyId, action, comment, editorId } = await req.json()
    // action: 'approve' | 'reject'

    if (!storyId || !action) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 })
    }
    if (action === 'reject' && !comment?.trim()) {
      return NextResponse.json({ error: '退回时必须填写修改意见' }, { status: 400 })
    }

    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                   process.env.NEXT_PUBLIC_SUPABASE_URL === 'placeholder'

    if (isMock) {
      return NextResponse.json({ success: true, mock: true, action, storyId })
    }

    const { supabase } = await import('@/lib/supabase')
    const newStatus = action === 'approve' ? '已审核' : 'AI预审不通过'

    const { error } = await supabase
      .from('story_scripts')
      .update({
        status: newStatus,
        editor_comment: comment || null,
        editor_id: editorId || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', storyId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // 通过后同步更新 story_audio 状态
    if (action === 'approve') {
      await supabase
        .from('story_audio')
        .update({ status: '已入库' })
        .eq('story_id', storyId)
    }

    return NextResponse.json({ success: true, action, storyId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
