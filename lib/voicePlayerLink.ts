import type { CollectionFrom } from '@/lib/collectionNav'

/** 爸妈原声卡：列表展示与 /player/003 内页标题/封面一致 */
export function buildVoiceStoryPlayerUrl(
  v: { title: string; emoji: string; bg: string },
  from: CollectionFrom,
  playerId = '003',
): string {
  const p = new URLSearchParams()
  p.set('from', from)
  p.set('title', v.title)
  p.set('emoji', v.emoji)
  p.set('bg', v.bg)
  return `/player/${playerId}?${p.toString()}`
}
