'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getLiteracyTheme } from '@/lib/literacyThemes'

const WORDS: Record<string, Array<{ word: string; english: string; emoji: string }>> = {
  transport: [
    { word: '公共汽车', english: 'bus', emoji: '🚌' },
    { word: '小汽车', english: 'car', emoji: '🚗' },
    { word: '飞机', english: 'airplane', emoji: '✈️' },
    { word: '火车', english: 'train', emoji: '🚂' },
    { word: '轮船', english: 'ship', emoji: '🚢' },
    { word: '自行车', english: 'bicycle', emoji: '🚲' },
    { word: '摩托车', english: 'motorcycle', emoji: '🏍️' },
    { word: '地铁', english: 'subway', emoji: '🚇' },
  ],
  animals: [
    { word: '大象', english: 'elephant', emoji: '🐘' },
    { word: '狮子', english: 'lion', emoji: '🦁' },
    { word: '熊猫', english: 'panda', emoji: '🐼' },
    { word: '长颈鹿', english: 'giraffe', emoji: '🦒' },
    { word: '老虎', english: 'tiger', emoji: '🐯' },
    { word: '兔子', english: 'rabbit', emoji: '🐰' },
    { word: '小狗', english: 'dog', emoji: '🐶' },
    { word: '小猫', english: 'cat', emoji: '🐱' },
  ],
  food: [
    { word: '苹果', english: 'apple', emoji: '🍎' },
    { word: '香蕉', english: 'banana', emoji: '🍌' },
    { word: '西瓜', english: 'watermelon', emoji: '🍉' },
    { word: '米饭', english: 'rice', emoji: '🍚' },
    { word: '面条', english: 'noodles', emoji: '🍜' },
    { word: '蛋糕', english: 'cake', emoji: '🎂' },
    { word: '饼干', english: 'cookie', emoji: '🍪' },
    { word: '牛奶', english: 'milk', emoji: '🥛' },
  ],
  sports: [
    { word: '篮球', english: 'basketball', emoji: '🏀' },
    { word: '足球', english: 'football', emoji: '⚽' },
    { word: '游泳', english: 'swimming', emoji: '🏊' },
    { word: '跑步', english: 'running', emoji: '🏃' },
    { word: '跳绳', english: 'jump rope', emoji: '🪢' },
    { word: '骑车', english: 'cycling', emoji: '🚴' },
  ],
  colors: [
    { word: '红色', english: 'red', emoji: '🔴' },
    { word: '蓝色', english: 'blue', emoji: '🔵' },
    { word: '黄色', english: 'yellow', emoji: '🟡' },
    { word: '绿色', english: 'green', emoji: '🟢' },
    { word: '紫色', english: 'purple', emoji: '🟣' },
    { word: '橙色', english: 'orange', emoji: '🟠' },
    { word: '粉色', english: 'pink', emoji: '🩷' },
    { word: '白色', english: 'white', emoji: '⬜' },
  ],
  fruits: [
    { word: '苹果', english: 'apple', emoji: '🍎' },
    { word: '香蕉', english: 'banana', emoji: '🍌' },
    { word: '草莓', english: 'strawberry', emoji: '🍓' },
    { word: '葡萄', english: 'grape', emoji: '🍇' },
    { word: '橙子', english: 'orange', emoji: '🍊' },
    { word: '西瓜', english: 'watermelon', emoji: '🍉' },
    { word: '桃子', english: 'peach', emoji: '🍑' },
    { word: '梨', english: 'pear', emoji: '🍐' },
  ],
}

const DEFAULT_WORDS = [
  { word: '玩具', english: 'toy', emoji: '🪀' },
  { word: '形状', english: 'shape', emoji: '🟥' },
  { word: '衣服', english: 'clothes', emoji: '👕' },
  { word: '身体', english: 'body', emoji: '🧑' },
  { word: '天气', english: 'weather', emoji: '⛅' },
  { word: '数字', english: 'number', emoji: '🔢' },
]

function safeDecodeTitle(raw: string | null): string {
  if (!raw) return '识字'
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function LiteracyCardClient({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const title = safeDecodeTitle(searchParams.get('title'))
  const theme = getLiteracyTheme(id)
  const words = WORDS[id] ?? DEFAULT_WORDS
  const [current, setCurrent] = useState(0)
  const word = words[current] ?? words[0]

  const goPrev = () => {
    if (current > 0) setCurrent(c => c - 1)
  }
  const goNext = () => {
    if (current < words.length - 1) setCurrent(c => c + 1)
  }

  return (
    <div className="phone-shell bg-[#FBF7FF]">
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0">
        <span className="text-[15px] font-bold text-[#1A0A2E]">19:59</span>
        <span className="text-sm">📶🔋</span>
      </div>

      <div className="px-5 flex items-center relative flex-shrink-0 mb-4">
        <button type="button" onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: theme.accent }}>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="flex-1 text-center text-[16px] font-bold text-[#1A0A2E]">{title}</div>
        <div className="w-9"/>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full aspect-square rounded-[28px] flex items-center justify-center mb-10 shadow-sm border border-[#F0E8FF]"
          style={{ maxWidth: 280, background: theme.cardBg }}>
          <span className="text-[100px]">{word.emoji}</span>
        </div>

        <div className="text-[32px] font-black mb-2" style={{ color: theme.accent }}>{word.word}</div>
        <div className="text-[18px] font-medium" style={{ color: theme.accentMuted }}>{word.english}</div>
      </div>

      <div className="flex-shrink-0 pb-10">
        <div className="flex items-center justify-center gap-8 mb-3">
          <button type="button" onClick={goPrev}
            className="w-12 h-12 rounded-full flex items-center justify-center border border-[#F0E8FF]"
            style={{ background: 'rgba(255,255,255,0.85)', opacity: current === 0 ? 0.35 : 1 }}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: theme.accent }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <button type="button" className="w-16 h-16 rounded-full flex items-center justify-center shadow-md border border-[#F0E8FF]"
            style={{ background: 'rgba(255,255,255,0.95)' }}>
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: theme.accent }}>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </button>

          <button type="button" onClick={goNext}
            className="w-12 h-12 rounded-full flex items-center justify-center border border-[#F0E8FF]"
            style={{ background: 'rgba(255,255,255,0.85)', opacity: current === words.length - 1 ? 0.35 : 1 }}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: theme.accent }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <div className="text-center text-[13px] font-semibold" style={{ color: theme.accentMuted }}>
          {current + 1}/{words.length}
        </div>
      </div>
    </div>
  )
}
