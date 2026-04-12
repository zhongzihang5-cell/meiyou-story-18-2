/** 克隆完成页 · 四条价值说明 */
export const VOICE_CLONE_PERKS = [
  {
    id: 'no-repeat',
    colorClass: 'p1' as const,
    title: '不用再当"复读机"讲第50遍',
    desc: '录一次你的声音，AI每天讲新的故事',
  },
  {
    id: 'presence',
    colorClass: 'p2' as const,
    title: '你不在的时候，也能陪柚柚成长',
    desc: '用你的声音，陪柚柚吃饭、玩耍、入睡',
  },
  {
    id: 'ai-story',
    colorClass: 'p3' as const,
    title: '不会讲故事，也能讲得很好听',
    desc: '告诉AI一句话，它帮你编成柚柚爱听的故事',
  },
  {
    id: 'keep-stories',
    colorClass: 'p4' as const,
    title: '柚柚讲的故事也能被留下来',
    desc: '那些一闪而过的想象，不会再消失',
  },
] as const

export type VoiceClonePerkColor = (typeof VOICE_CLONE_PERKS)[number]['colorClass']
