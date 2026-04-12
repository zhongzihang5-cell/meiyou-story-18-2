import { NextRequest, NextResponse } from 'next/server'

/**
 * Mock 克隆接口：不连 Supabase / 火山引擎，部署无密钥也可 200。
 * 前端仍可走完录音 → 提交 → 成功 UI。
 */
export async function POST(req: NextRequest) {
  try {
    const { recordings, identity, userId } = await req.json()

    if (!recordings?.length || !identity || !userId) {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 })
    }

    const first = recordings[0]
    if (typeof first !== 'string' || !first.trim()) {
      return NextResponse.json({ error: '录音数据无效' }, { status: 422 })
    }

    await new Promise(r => setTimeout(r, 800))

    const speakerId = `S_mock_${String(userId).slice(0, 32)}_${identity}_${Date.now()}`

    return NextResponse.json({
      success: true,
      speaker_id: speakerId,
      status: 'done',
      demo_audio: null,
      mock: true,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '克隆失败，请稍后重试'
    console.error('[voice/clone mock]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
