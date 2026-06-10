import { MOCK_STORIES } from '@/lib/mockData'
import { LITERACY_CATEGORIES } from '@/lib/literacyThemes'
import { NURSERY_COLLECTIONS } from '@/lib/nurseryCollections'

export const UGC_STORY_IDS = ['001', '002', '003', '004'] as const

export const CATEGORY_SLUGS = [
  'sleep-story',
  'nursery-songs',
  'animation',
  'morning-story',
  'cognitive',
  'life',
  'emotion',
] as const

/** 与 app/collection/[id]/page.tsx 内 COLLECTIONS 本地 key 一致 */
const LOCAL_COLLECTION_IDS = [
  '001', '003', '002', '004', 'm1', 'm2', 'm3', 'm4',
  'c1', 'c2', 'c3', 'c4', 'l1', 'l2', 'l3', 'l4',
  'e1', 'e2', 'e3', 'e4', 'a1', 'a2', 'an1', 'an2', 'an3', 'an4', 'an5', 'an6',
] as const

export const COLLECTION_IDS = Array.from(
  new Set([...LOCAL_COLLECTION_IDS, ...Object.keys(NURSERY_COLLECTIONS)]),
)

export function ugcStaticParams() {
  return UGC_STORY_IDS.map(id => ({ id }))
}

export function playerStaticParams() {
  return MOCK_STORIES.map(s => ({ id: s.id }))
}

export function categoryStaticParams() {
  return CATEGORY_SLUGS.map(slug => ({ slug }))
}

export function collectionStaticParams() {
  return COLLECTION_IDS.map(id => ({ id }))
}

export function literacyStaticParams() {
  return LITERACY_CATEGORIES.map(c => ({ id: c.id }))
}
