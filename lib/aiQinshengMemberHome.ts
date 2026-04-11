/**
 * AI 亲声讲 · 会员首页文案与列表数据（结构对齐 qinsheng-react HomeScreen + types STORY_CARDS）
 */

export const MEMBER_HOME_BABY_LINE = '小美 · 14个月 · 为你推荐'

export const MEMBER_HOME_FEATURED = {
  title: '好饿的毛毛虫',
  voiceLine: '妈妈的声音 · 3分20秒',
  subLine: '适合今晚安睡前的情绪安抚',
  /** 演示用播放跳转（可换成真实推荐位 id） */
  playerStoryId: '001',
} as const

export const MEMBER_HOME_BABY_NAME = '小美'

export const MEMBER_HOME_KEYWORDS = ['小狮子', '草莓', '垃圾车'] as const

export const MEMBER_HOME_SLEEP_COUNT = 23

export const MEMBER_HOME_ALBUM_ITEMS = [
  { id: 1, date: '11月3日', voice: '妈妈的声音', name: '毛毛虫和草莓的故事', tone: 'blue' as const },
  { id: 2, date: '1月31日', voice: '妈妈的声音', name: '小美和小狗的冒险', tone: 'green' as const },
  { id: 3, date: '10月28日', voice: '妈妈的声音', name: '草莓王国历险记', tone: 'amber' as const },
]

export const ALBUM_COVER_STYLES: Record<
  (typeof MEMBER_HOME_ALBUM_ITEMS)[number]['tone'],
  { areaClass: string; stroke: string }
> = {
  blue: {
    areaClass: 'bg-gradient-to-br from-[#EDE9FE] to-[#E8E0FF]',
    stroke: '#7B3FD4',
  },
  green: {
    areaClass: 'bg-gradient-to-br from-[#D1FAE5] to-[#ECFDF5]',
    stroke: '#059669',
  },
  amber: {
    areaClass: 'bg-gradient-to-br from-[#FEF3C7] to-[#FFFBEB]',
    stroke: '#D97706',
  },
}
