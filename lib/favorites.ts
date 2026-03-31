// lib/favorites.ts
// 收藏状态管理（客户端内存存储，实际接入后存 Supabase）

export interface FavoriteItem {
  id: string
  type: 'story' | 'collection'
  title: string
  emoji: string
  bg: string
  subtitle: string
  savedAt: number
}

// 全局状态（单例，跨组件共享）
let favorites: FavoriteItem[] = []
let listeners: Array<() => void> = []

export function getFavorites() { return [...favorites] }

export function isFavorited(id: string) { return favorites.some(f => f.id === id) }

export function toggleFavorite(item: FavoriteItem) {
  const idx = favorites.findIndex(f => f.id === item.id)
  if (idx >= 0) {
    favorites = favorites.filter(f => f.id !== item.id)
  } else {
    favorites = [{ ...item, savedAt: Date.now() }, ...favorites]
  }
  listeners.forEach(fn => fn())
}

export function subscribe(fn: () => void) {
  listeners.push(fn)
  return () => { listeners = listeners.filter(l => l !== fn) }
}
