import { NextRequest, NextResponse } from 'next/server'
import { cloneVoice, validateRecording } from '@/lib/volcengine'
import { saveVoicePackage } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { recordings, identity, userId } = await req.json()

    if (!recordings?.length || !identity || !userId) {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 })
    }

    // 取第一段录音做质量检测（实际应合并所有片段）
    const firstRecording: string = recordings[0]
    const validation = validateRecording(firstRecording, null)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.issues.join('；') }, { status: 422 })
    }

    // 判断是否有真实火山引擎配置
    const hasVolcConfig = process.env.VOLCENGINE_APP_ID && 
                          process.env.VOLCENGINE_APP_ID !== 'placeholder'

    let speakerId: string
    let demoAudio: string | undefined

    if (hasVolcConfig) {
      // ── 真实API调用 ──
      const result = await cloneVoice({
        audioBase64: firstRecording,
        audioFormat: 'webm',
        language: 0,
        modelType: 4,
      })
      speakerId = result.speaker_id
      demoAudio = result.demo_audio
    } else {
      // ── Mock模式：直接返回模拟speaker_id ──
      speakerId = `S_mock_${userId}_${identity}_${Date.now()}`
      await new Promise(r => setTimeout(r, 1500)) // 模拟延迟
    }

    // 写入 Supabase
    const identityLabel: Record<string, string> = {
      mom: '妈妈',
      dad: '爸爸',
      grandma: '奶奶/外婆',
      grandpa: '爷爷/外公',
      nainai: '奶奶',
      yeye: '爷爷',
      waipo: '姥姥',
      waigong: '姥爷',
      other: '其他角色',
    }
    
    const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL &&
                              process.env.NEXT_PUBLIC_SUPABASE_URL !== 'placeholder'

    if (hasSupabaseConfig) {
      await saveVoicePackage({
        id: `vp_${Date.now()}`,
        user_id: userId,
        speaker_id: speakerId,
        identity_label: identityLabel[identity] ?? identity,
        status: hasVolcConfig ? '克隆中' : '克隆完成',
      })
    }

    return NextResponse.json({
      success: true,
      speaker_id: speakerId,
      status: hasVolcConfig ? 'processing' : 'done',
      demo_audio: demoAudio ?? null,
      mock: !hasVolcConfig,
    })

  } catch (err: any) {
    console.error('[voice/clone]', err)
    return NextResponse.json(
      { error: err.message ?? '克隆失败，请稍后重试' },
      { status: 500 }
    )
  }
}
