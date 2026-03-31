'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const getEpisodes = (collectionTitle: string) => {
  const episodeMap: Record<string, string[]> = {
    '古诗里的小百科': ['春晓','惠崇春江晚景','绝句','静夜思','望庐山瀑布','登鹳雀楼','咏鹅','悯农','江雪','游子吟'],
    '小猫汤米': ['汤米的早晨','和朋友玩耍','迷路了怎么办','雨天在家','汤米学游泳','找到新朋友','帮助小鸟','生日快乐','秋天的落叶','晚安汤米'],
    '豆小鸭迷你冒险': ['豆小鸭出发啦','草丛大冒险','遇见小蚂蚁','花园里的秘密','池塘探险','小虫子的家','雨后彩虹','找到宝藏','新朋友蜗牛','回家的路'],
    '超级飞侠': ['乐迪出发','环游世界','帮助小朋友','神秘的礼物','飞越大海','沙漠冒险','雪山救援','城市探索','海底奇遇','回到基地'],
    '小猪佩奇': ['泥坑','风筝','游泳课','野餐','爷爷的花园','生日派对','赛车','雨天','动物园','圣诞节'],
    '贝瓦经典儿歌': ['小兔乖乖','两只老虎','数鸭子','小星星','洗手歌','找朋友','小燕子','春天来了','蜗牛与黄鹂鸟','让我们荡起双桨'],
    '亲宝儿歌之运动': ['小手拍拍','跺跺脚','摇摇头','弯弯腰','跳起来','转一转','拍手歌','踢踢腿','伸懒腰','蹦蹦跳'],
    '潮流新儿歌': ['YO宝宝','跳跳舞','嗨起来','酷宝宝','动起来','节拍来了','宝宝说唱','潮流派对','节奏宝贝','一起摇摆'],
    '火火兔儿歌': ['火火兔出发','兔兔爱唱歌','快乐成长','兔兔的朋友','一起玩耍','兔兔学习','快乐时光','兔兔的梦','宝贝加油','晚安兔兔'],
    '宝宝巴士古诗国学': ['咏鹅','春晓','静夜思','悯农','登鹳雀楼','望庐山瀑布','早发白帝城','赠汪伦','黄鹤楼','游子吟'],
  }

  const names = episodeMap[collectionTitle] ??
    Array.from({ length: 10 }, (_, i) => `第${i+1}集`)

  return names.map((name, i) => ({
    id: `v-${i+1}`,
    title: `${String(i+1).padStart(2, '0')} ${name}`,
    duration: '05:50',
    thumb: '🎬',
  }))
}

const getCollectionInfo = (collectionTitle: string) => {
  const infoMap: Record<string, { emoji: string; bg: string }> = {
    '古诗里的小百科': { emoji: '🦜', bg: 'linear-gradient(135deg,#1a3a1a,#2d5a2d)' },
    '小猫汤米': { emoji: '🐱', bg: 'linear-gradient(135deg,#8B2500,#CC4400)' },
    '豆小鸭迷你冒险': { emoji: '🐥', bg: 'linear-gradient(135deg,#5a4000,#8B6914)' },
    '超级飞侠': { emoji: '✈️', bg: 'linear-gradient(135deg,#0a1a3a,#1a3a6a)' },
    '小猪佩奇': { emoji: '🐷', bg: 'linear-gradient(135deg,#6a1a1a,#aa3030)' },
    '贝瓦经典儿歌': { emoji: '🐿️', bg: 'linear-gradient(135deg,#5a3000,#8B5000)' },
    '亲宝儿歌之运动': { emoji: '🐕', bg: 'linear-gradient(135deg,#0a2a4a,#1a5a8a)' },
    '潮流新儿歌': { emoji: '🎤', bg: 'linear-gradient(135deg,#2a0a4a,#5a1a8a)' },
    '火火兔儿歌': { emoji: '🐰', bg: 'linear-gradient(135deg,#5a2000,#9a4000)' },
    '宝宝巴士古诗国学': { emoji: '🐼', bg: 'linear-gradient(135deg,#4a0a2a,#8a1a5a)' },
  }
  return infoMap[collectionTitle] ?? { emoji: '🎬', bg: 'linear-gradient(135deg,#1a1a2e,#2d2d5a)' }
}

function VideoPlayerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTitle = searchParams.get('title')
  const title = rawTitle ? decodeURIComponent(rawTitle) : '古诗里的小百科'
  const episodes = getEpisodes(title)
  const { emoji, bg } = getCollectionInfo(title)
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)
  const ep = episodes[current]

  return (
    <div className="phone-shell bg-[#FFF0F5]">
      {/* 顶部导航 */}
      <div className="h-12 px-4 flex items-center justify-between pt-3 flex-shrink-0">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-[#1A0A2E]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="text-[15px] font-bold text-[#1A0A2E] truncate max-w-[180px]">{title}</div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-[#E91E63] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1C7 1 3 5 3 10c0 1.5.4 3 1 4.2L3 21l6.8-1c1 .5 2.1.8 3.2.8 5 0 9-4 9-9S17 1 12 1z"/></svg>
            </div>
            <span className="text-[10px] text-[#666]">儿童锁</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-[#E91E63] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <span className="text-[10px] text-[#666]">只听声音</span>
          </div>
        </div>
      </div>

      {/* 主内容区：视频 + 列表 */}
      <div className="flex flex-1 overflow-hidden px-3 gap-3">
        {/* 左侧视频播放器 */}
        <div className="flex-1 flex flex-col">
          {/* 视频区域（16:9）*/}
          <div className="w-full rounded-[12px] overflow-hidden relative bg-black" style={{ aspectRatio:'16/9' }}>
            <div className="w-full h-full flex items-center justify-center text-[60px]"
              style={{ background: bg }}>
              {emoji}
            </div>
            {/* 字幕 */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <span className="bg-black/50 text-white text-[12px] px-3 py-1 rounded-full">我是小鹦鹉扣扣</span>
            </div>
            {/* 播放控制覆盖层 */}
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
              <div className="flex items-center gap-2">
                <button onClick={() => setPlaying(p => !p)} className="text-white">
                  {playing
                    ? <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    : <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                  }
                </button>
                <span className="text-white text-[11px]">00:02</span>
                <div className="flex-1 h-1 bg-white/30 rounded-full relative">
                  <div className="h-full w-[1%] bg-white rounded-full"/>
                  <div className="w-3 h-3 bg-white rounded-full absolute top-1/2 -translate-y-1/2" style={{ left:'1%' }}/>
                </div>
                <span className="text-white text-[11px]">{ep.duration}</span>
                <button className="text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* 标题 */}
          <div className="mt-3 text-[14px] font-bold text-[#1A0A2E]">{ep.title}</div>
        </div>

        {/* 右侧播放列表 */}
        <div className="w-[120px] flex-shrink-0 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-2">
            {episodes.map((e, i) => (
              <div key={e.id} onClick={() => setCurrent(i)}
                className="cursor-pointer rounded-[8px] overflow-hidden border-2 transition-all"
                style={{ borderColor: current===i ? '#E91E63' : 'transparent' }}>
                <div className="w-full rounded-[8px] overflow-hidden relative bg-[#e8f5e9]" style={{ aspectRatio:'16/9' }}>
                  <div className="w-full h-full flex items-center justify-center text-[20px]">{emoji}</div>
                </div>
                <div className="py-1">
                  <div className="text-[10px] font-semibold truncate" style={{ color: current===i ? '#E91E63' : '#1A0A2E' }}>{e.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VideoPlayerPage() {
  return (
    <Suspense fallback={
      <div className="phone-shell bg-[#FFF0F5] flex items-center justify-center">
        <div className="text-[#888]">加载中...</div>
      </div>
    }>
      <VideoPlayerContent />
    </Suspense>
  )
}

