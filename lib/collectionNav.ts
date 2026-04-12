/** 合集列表页 ?from= 与播放器返回链 */

export type CollectionFrom = 'stories' | 'home' | 'nursery' | 'ai-stories'

export function isCollectionFromParam(v: string | null): v is CollectionFrom {
  return v === 'stories' || v === 'home' || v === 'nursery' || v === 'ai-stories'
}

/** 合集页 / 播放器返回：按进入来源回落；未知来源默认回 AI 亲声讲首页（不再默认进儿歌精选 /featured） */
export function pathAfterCollectionBack(from: string | null): string {
  if (from === 'stories') return '/stories'
  if (from === 'nursery') return '/nursery'
  if (from === 'home') return '/featured'
  if (from === 'ai-stories') return '/ai-stories/browse'
  if (from === 'ai-stories-home') return '/ai-stories/home'
  return '/ai-stories/home'
}

/** 拼到 player URL 上的 &from=（需在已有 query 后追加） */
export function playerFromSuffix(from: string | null): string {
  return isCollectionFromParam(from) ? `&from=${from}` : ''
}

/** 拼合集 URL 的 ?from= */
export function collectionHref(id: string, from: CollectionFrom): string {
  return `/collection/${id}?from=${from}`
}
