/** 合集列表页 ?from= 与播放器返回链 */

export type CollectionFrom = 'stories' | 'home' | 'nursery' | 'ai-stories'

export function isCollectionFromParam(v: string | null): v is CollectionFrom {
  return v === 'stories' || v === 'home' || v === 'nursery' || v === 'ai-stories'
}

/** 合集页左上角返回：回到进入合集的 Tab */
export function pathAfterCollectionBack(from: string | null): string {
  if (from === 'stories') return '/stories'
  if (from === 'nursery') return '/nursery'
  if (from === 'ai-stories') return '/ai-stories'
  return '/featured'
}

/** 拼到 player URL 上的 &from=（需在已有 query 后追加） */
export function playerFromSuffix(from: string | null): string {
  return isCollectionFromParam(from) ? `&from=${from}` : ''
}

/** 拼合集 URL 的 ?from= */
export function collectionHref(id: string, from: CollectionFrom): string {
  return `/collection/${id}?from=${from}`
}
