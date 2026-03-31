import { NextRequest, NextResponse } from 'next/server'
import { queryCloneStatus } from '@/lib/volcengine'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const speakerId = searchParams.get('speaker_id')

  if (!speakerId) {
    return NextResponse.json({ error: '缺少 speaker_id' }, { status: 400 })
  }

  // Mock 模式（speaker_id 以 S_mock_ 开头）
  if (speakerId.startsWith('S_mock_')) {
    return NextResponse.json({
      speaker_id: speakerId,
      status: 2,           // 2 = 完成
      status_label: '克隆完成',
      demo_audio: null,
      mock: true,
    })
  }

  const hasVolcConfig = process.env.VOLCENGINE_APP_ID &&
                        process.env.VOLCENGINE_APP_ID !== 'placeholder'

  if (!hasVolcConfig) {
    return NextResponse.json({ error: '火山引擎未配置' }, { status: 503 })
  }

  try {
    const result = await queryCloneStatus(speakerId)
    const STATUS_MAP: Record<number, string> = {
      0: '处理中',
      1: '克隆失败',
      2: '克隆完成',
    }
    return NextResponse.json({
      speaker_id: result.speaker_id,
      status: result.status,
      status_label: STATUS_MAP[result.status] ?? '未知',
      demo_audio: result.demo_audio ?? null,
      mock: false,
    })
  } catch (err: any) {
    console.error('[voice/status]', err)
    return NextResponse.json(
      { error: err.message ?? '查询失败' },
      { status: 500 }
    )
  }
}
