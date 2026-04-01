const STORAGE_KEY = 'meiyou:lastAgeLevel'

/** 与儿歌/动画页 AGE_TABS 一致 */
export const HOT_SEARCH_TITLE_BY_LEVEL: Record<string, string> = {
  L1: '0-6月都在搜',
  L2: '6-12月都在搜',
  L3: '1-1.5岁都在搜',
  L4: '1.5-2岁都在搜',
  L5: '2-3岁都在搜',
  L6: '3岁+都在搜',
}

export function isValidAgeLevel(v: string | null | undefined): v is string {
  return v != null && /^L[1-6]$/.test(v)
}

export function setLastAgeLevel(level: string) {
  if (typeof window === 'undefined' || !isValidAgeLevel(level)) return
  try {
    sessionStorage.setItem(STORAGE_KEY, level)
  } catch {
    /* ignore */
  }
}

export function getLastAgeLevel(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const v = sessionStorage.getItem(STORAGE_KEY)
    return isValidAgeLevel(v) ? v : null
  } catch {
    return null
  }
}

/** URL ?age= 优先；否则用上次在任意 Tab 选的月龄（识字等无月龄条时用） */
export function resolveHotSearchTitle(ageFromUrl: string | null): string {
  const key =
    (isValidAgeLevel(ageFromUrl) ? ageFromUrl : null) ?? getLastAgeLevel()
  if (key && HOT_SEARCH_TITLE_BY_LEVEL[key]) return HOT_SEARCH_TITLE_BY_LEVEL[key]
  return '1-2岁都在搜'
}
