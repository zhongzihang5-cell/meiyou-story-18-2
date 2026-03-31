// app/api/stories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MOCK_STORIES, getStoriesByFilter } from '@/lib/mockData'
import type { AgeGroup, Category } from '@/lib/mockData'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const age = searchParams.get('age') as AgeGroup | null
  const cat = searchParams.get('category') as Category | null
  const id = searchParams.get('id')

  if (id) {
    const story = MOCK_STORIES.find(s => s.id === id)
    if (!story) return NextResponse.json({ error: '故事不存在' }, { status: 404 })
    return NextResponse.json(story)
  }

  const stories = getStoriesByFilter(age ?? undefined, cat ?? undefined)
  return NextResponse.json({ stories, total: stories.length })
}
