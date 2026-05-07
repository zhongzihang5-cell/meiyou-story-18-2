'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type UgcStory = {
  id: string
  title: string
  subtitle: string
  coverEmoji: string
  content: string[]
}

const UGC_STORIES: Record<string, UgcStory> = {
  '001': {
    id: '001',
    title: '柚柚大战小怪兽',
    subtitle: '冒险成长 · 旁白朗读',
    coverEmoji: '🦁',
    content: [
      '夜晚，房间里安安静静，柚柚忽然听见床底传来沙沙声。',
      '她抱紧小被子，心里有点紧张，但还是慢慢探出小脑袋。',
      '原来不是怪兽，而是一只迷路的小毛球，它只是想找回自己的星星灯。',
      '柚柚鼓起勇气，把星星灯递给它，小毛球开心地说了声谢谢。',
      '从那天起，柚柚知道，勇敢不是不害怕，而是害怕时也愿意往前一步。',
    ],
  },
  '002': {
    id: '002',
    title: '神奇小火车的旅行',
    subtitle: '奇幻想象 · 旁白朗读',
    coverEmoji: '🚂',
    content: [
      '清晨，神奇小火车停在彩虹站台，邀请安安一起出发。',
      '第一站是糖果隧道，窗外飘着甜甜的云朵，像棉花一样软。',
      '第二站是风铃桥，每一阵风都会奏出不同的旋律。',
      '最后他们来到星星岛，把愿望悄悄放进会发光的瓶子里。',
      '返程时，安安说：原来世界这么大，每一段路都能遇见惊喜。',
    ],
  },
  '003': {
    id: '003',
    title: '海底探险记',
    subtitle: '友情陪伴 · 旁白朗读',
    coverEmoji: '🌊',
    content: [
      '糖糖戴上泡泡头盔，和小海马一起潜入蓝蓝的海底。',
      '珊瑚森林里，一颗珍珠被海流卷走了，大家都很着急。',
      '章鱼爷爷挥动触手照亮前路，小海豚在前面引路。',
      '他们齐心协力，终于在海草迷宫里找到了那颗珍珠。',
      '糖糖笑着说：有朋友在身边，再难的路也不怕。',
    ],
  },
  '004': {
    id: '004',
    title: '恐龙王国的一天',
    subtitle: '穿越奇遇 · 旁白朗读',
    coverEmoji: '🦕',
    content: [
      '小樱穿过时光门，来到了绿意盎然的恐龙王国。',
      '一只小恐龙找不到回家的路，急得眼泪直打转。',
      '小樱和雷克斯一路翻山越岭，问遍了森林里的朋友。',
      '夕阳快落下时，他们终于看见山谷里亮起温暖的灯火。',
      '小恐龙扑进妈妈怀里，小樱也收获了满满的勇气与善意。',
    ],
  },
}

export default function UgcStoryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [playing, setPlaying] = useState(false)
  const story = useMemo(() => UGC_STORIES[params?.id ?? '001'] ?? UGC_STORIES['001'], [params?.id])

  return (
    <div className="phone-shell relative min-h-screen" style={{ background: '#F5F0FF' }}>
      <div className="mx-auto max-w-[420px] px-4 pb-8 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[20px] text-[rgba(0,0,0,0.7)] shadow-[0_2px_8px_rgba(124,58,237,0.12)]"
            aria-label="返回">
            ‹
          </button>
          <div className="text-[17px] font-semibold text-[rgba(0,0,0,0.82)]">{story.title}</div>
          <div className="h-9 w-9" />
        </div>

        <div className="overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_6px_20px_rgba(124,58,237,0.12)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0E8FF] text-[26px]">
              {story.coverEmoji}
            </div>
            <div>
              <div className="text-[20px] font-bold text-[rgba(0,0,0,0.86)]">{story.title}</div>
              <div className="text-[12px] text-[#7C3AED]">{story.subtitle}</div>
            </div>
          </div>

          <div className="mb-4 rounded-[16px] bg-[#FAF7FF] p-4">
            <div className="mb-2 text-[12px] font-medium text-[rgba(0,0,0,0.45)]">故事内容</div>
            <div className="space-y-2 text-[15px] leading-[1.65] text-[rgba(0,0,0,0.78)]">
              {story.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[14px] border border-[#EDE9FF] bg-[#FCFAFF] px-4 py-3">
            <div>
              <div className="text-[12px] text-[rgba(0,0,0,0.45)]">播放模式</div>
              <div className="text-[14px] font-medium text-[rgba(0,0,0,0.78)]">普通旁白朗读</div>
            </div>
            <button
              type="button"
              onClick={() => setPlaying(v => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
              aria-label={playing ? '暂停' : '播放'}>
              {playing ? '❚❚' : '▶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

