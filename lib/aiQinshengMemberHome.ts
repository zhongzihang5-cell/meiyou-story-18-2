/**
 * AI 亲声讲 · 会员首页数据（含 cursor_prompt_ai_story.md 规格字段）
 */

export const MEMBER_HOME_BABY_LINE = '柚柚 · 14个月 · 为你推荐'

export const MEMBER_HOME_FEATURED = {
  title: '好饿的毛毛虫',
  voiceLine: '妈妈的声音 · 3分20秒',
  subLine: '适合今晚安睡前的情绪安抚',
  playerStoryId: '001',
} as const

/** 今晚推荐横滑卡片（规范 2.2 mock 表） */
export const MEMBER_HOME_RECOMMEND_STORIES = [
  {
    id: '1',
    title: '好饿的毛毛虫',
    emoji: '🐛',
    duration: '3分20秒',
    scene: '情绪安抚',
    isCloned: true,
    playerStoryId: MEMBER_HOME_FEATURED.playerStoryId,
    durationSec: 200,
    playerCoverBg: 'linear-gradient(135deg,#6D28D9,#9333EA)',
  },
  {
    id: '2',
    title: '三只小猪',
    emoji: '🐷',
    emojiBg: '#FDF2F8',
    duration: '4分05秒',
    scene: '专注培养',
    isCloned: false,
    playerStoryId: '002',
    durationSec: 245,
    playerCoverBg: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)',
  },
  {
    id: '3',
    title: '小熊晚安',
    emoji: '🐻',
    emojiBg: '#FEF9EC',
    duration: '2分50秒',
    scene: '睡眠引导',
    isCloned: false,
    playerStoryId: '003',
    durationSec: 170,
    playerCoverBg: 'linear-gradient(135deg,#FEF9EC,#FFF4D6)',
  },
] as const

/** 亲声讲首页进入播放器：单集页展示与卡片一致的标题/封面 */
export function buildMemberHomePlayerHref(p: {
  playerStoryId: string
  title: string
  emoji: string
  coverBg: string
}) {
  const q = new URLSearchParams()
  q.set('from', 'ai-stories-home')
  q.set('title', p.title)
  q.set('emoji', p.emoji)
  q.set('bg', p.coverBg)
  return `/player/${p.playerStoryId}?${q.toString()}`
}

/** 定制故事：默认选中的兴趣标签 */
export const MEMBER_HOME_CUSTOM_DEFAULT_TAG = '小狮子' as const

export const MEMBER_HOME_BABY_NAME = '柚柚'

export const MEMBER_HOME_KEYWORDS = ['小狮子', '草莓', '垃圾车'] as const

export const MEMBER_HOME_SLEEP_COUNT = 23

/** 声音册统计 Pill 行（规范 2.6） */
export const MEMBER_HOME_VOICE_STATS = {
  storyCount: 8,
  voiceKinds: 1,
  totalMinutes: 41,
} as const

export type MemberHomeVoiceAlbumStoryCard = {
  kind: 'story'
  id: number
  title: string
  emoji: string
  date: string
  cardBg: string
  borderColor: string
  illBg: string
  waveColor: string
  playerStoryId: string
  durationSec: number
}

export type MemberHomeVoiceAlbumCtaCard = { kind: 'cta' }

export type MemberHomeVoiceAlbumCard = MemberHomeVoiceAlbumStoryCard | MemberHomeVoiceAlbumCtaCard

/** 声音册横滑卡片（规范 2.6 表） */
export const MEMBER_HOME_VOICE_ALBUM_CARDS: MemberHomeVoiceAlbumCard[] = [
  {
    kind: 'story',
    id: 1,
    title: '毛毛虫和草莓的故事',
    emoji: '🐛',
    date: '11月3日',
    cardBg: '#FFF7ED',
    borderColor: '#FCD9A0',
    illBg: '#FDE8B4',
    waveColor: '#F59E0B',
    playerStoryId: '001',
    durationSec: 188,
  },
  {
    kind: 'story',
    id: 2,
    title: '柚柚和小狗的冒险',
    emoji: '🐶',
    date: '1月31日',
    cardBg: '#FDF4FF',
    borderColor: '#E9D5FF',
    illBg: '#F3E8FF',
    waveColor: '#A855F7',
    playerStoryId: '002',
    durationSec: 210,
  },
  {
    kind: 'story',
    id: 3,
    title: '草莓王国历险记',
    emoji: '🍓',
    date: '10月28日',
    cardBg: '#FFF0F6',
    borderColor: '#FBCFE8',
    illBg: '#FCE7F3',
    waveColor: '#EC4899',
    playerStoryId: '003',
    durationSec: 195,
  },
  { kind: 'cta' },
]
