import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── 数据库表类型定义（与工作流1-4保持一致）──
export interface DBStory {
  id: string
  story_json: {
    title: string
    age_range: string
    story_type: string
    summary: string
    script: string
  }
  status: string
  created_at: string
}

export interface DBAudio {
  story_id: string
  final_audio_url: string
  total_duration_sec: number
  synthesis_report: object
  status: string
  created_at: string
}

export interface DBVoicePackage {
  id: string
  user_id: string
  speaker_id: string
  identity_label: string
  status: string
  created_at: string
}

export interface DBReplacedAudio {
  id: string
  story_id: string
  user_id: string
  voice_package_id: string
  replace_roles: string[]
  replaced_audio_url: string
  synthesis_status: string
  created_at: string
}

// ── 查询已入库的故事音频 ──
export async function fetchPublishedAudios() {
  const { data, error } = await supabase
    .from('story_audio')
    .select('*, story_scripts(story_json)')
    .eq('status', '已入库')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ── 查询用户声音包 ──
export async function fetchUserVoicePackages(userId: string) {
  const { data, error } = await supabase
    .from('user_voice_packages')
    .select('*')
    .eq('user_id', userId)
    .eq('status', '克隆完成')
  if (error) throw error
  return data
}

// ── 保存声音克隆结果 ──
export async function saveVoicePackage(pkg: Omit<DBVoicePackage, 'created_at'>) {
  const { data, error } = await supabase
    .from('user_voice_packages')
    .insert(pkg)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── 保存换声音频 ──
export async function saveReplacedAudio(audio: Omit<DBReplacedAudio, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('story_audio_replaced')
    .insert(audio)
    .select()
    .single()
  if (error) throw error
  return data
}
