'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toggleFavorite, isFavorited, subscribe } from '@/lib/favorites'
import { pathAfterCollectionBack, playerFromSuffix } from '@/lib/collectionNav'

const COLLECTIONS: Record<string, {
  id: string, title: string, emoji: string, bg: string,
  desc: string, eps: number, tag: string,
  episodes: Array<{ id: string, title: string, duration_sec: number }>
}> = {
  '001': {
    id: '001', title: '睡吧，我的宝贝', emoji: '🌙',
    bg: 'linear-gradient(135deg,#1a1a3e,#4a1a6e)',
    desc: '专为0-6月宝宝设计的睡前音频，轻柔舒缓，帮助宝宝平静入眠。',
    eps: 23, tag: '0-6月 · 睡前故事',
    episodes: ['月光摇篮','星星说晚安','小云朵的梦','妈妈的歌声','夜风轻轻吹','萤火虫飞舞','小熊睡着了','月亮公公','宁静的夜晚','梦里的彩虹','软软的云朵','小鱼儿的梦','夜空的星星','妈妈的怀抱','轻轻摇啊摇','宝宝睡着了','月亮船','夜幕降临','星星眨眼睛','安静的夜晚','梦乡的入口','小天使降临','晚安宝贝'].map((name, i) => ({
      id: `ep-001-${i+1}`,
      title: name,
      duration_sec: 120 + i * 15,
    }))
  },
  '003': {
    id: '003', title: '和宝贝说晚安', emoji: '⭐',
    bg: 'linear-gradient(135deg,#0d2137,#1a4a6e)',
    desc: '爸爸妈妈用温柔的声音陪宝宝进入甜蜜梦乡，亲子互动睡前故事。',
    eps: 23, tag: '0-6月 · 亲子睡前',
    episodes: ['晚安小星星','宝宝乖乖睡','抱着你的温暖','说声晚安','轻抚宝宝背','妈妈的心跳','爸爸的怀抱','月光下的故事','睡前的吻','今天你真棒','明天见宝贝','一起做梦吧','爸爸讲故事','夜晚真美好','困了的眼睛','小手握大手','宝贝我爱你','轻声唱给你','闭上眼睛吧','梦里再相遇','好梦宝贝','晚安最爱你','明天太阳照'].map((name, i) => ({
      id: `ep-003-${i+1}`,
      title: name,
      duration_sec: 135 + i * 12,
    }))
  },
  's1': {
    id: 's1', title: '亲子运动歌', emoji: '🦁',
    bg: 'linear-gradient(135deg,#7B2D8B,#E91E8C)',
    desc: '活力满满的亲子律动儿歌，边唱边玩，促进宝宝运动发育。',
    eps: 20, tag: '全龄 · 益智儿歌',
    episodes: ['小手拍拍','跺跺脚','摇摇头','弯弯腰','跳起来','转一转','拍手歌','踢踢腿','伸懒腰','蹦蹦跳','小脚丫','动动手','甩甩手','扭一扭','点头歌','小手指','蹲起来','前进歌','体操时间','运动快乐'].map((name, i) => ({
      id: `ep-s1-${i+1}`,
      title: name,
      duration_sec: 90 + i * 8,
    }))
  },
  'a1': {
    id: 'a1', title: '小猫汤米', emoji: '🐱',
    bg: 'linear-gradient(135deg,#FF6B6B,#FF8E53)',
    desc: '小猫汤米的日常冒险，有趣又温馨，适合全龄段宝宝观看。',
    eps: 10, tag: '全龄 · 热门动画',
    episodes: ['汤米的早晨','和朋友玩耍','迷路了怎么办','雨天在家','汤米学游泳','找到新朋友','帮助小鸟','生日快乐','秋天的落叶','晚安汤米'].map((name, i) => ({
      id: `ep-a1-${i+1}`,
      title: name,
      duration_sec: 150 + i * 20,
    }))
  },
  'a2': {
    id: 'a2', title: '豆小鸭迷你冒险', emoji: '🐥',
    bg: 'linear-gradient(135deg,#F7DC6F,#F39C12)',
    desc: '豆小鸭带你探索神奇的迷你世界，充满想象力的冒险故事。',
    eps: 18, tag: '全龄 · 热门动画',
    episodes: ['豆小鸭出发啦','草丛大冒险','遇见小蚂蚁','花园里的秘密','池塘探险','小虫子的家','雨后彩虹','找到宝藏','新朋友蜗牛','回家的路','夜晚的星空','萤火虫舞会','神奇的蘑菇','豆小鸭飞翔','水中的倒影','小石头的故事','风儿带我走','豆小鸭的梦'].map((name, i) => ({
      id: `ep-a2-${i+1}`,
      title: name,
      duration_sec: 130 + i * 15,
    }))
  },
  an1: {
    id: 'an1', title: '贝瓦经典儿歌', emoji: '🐿️',
    bg: 'linear-gradient(135deg,#F57F17,#FFC107)',
    desc: '贝瓦出品的经典动画儿歌，画面生动有趣，适合全龄段宝宝。',
    eps: 10, tag: '全龄 · 儿歌动画',
    episodes: ['小兔乖乖','两只老虎','数鸭子','小星星','洗手歌','找朋友','小燕子','春天来了','蜗牛与黄鹂鸟','让我们荡起双桨'].map((name, i) => ({
      id: `ep-an1-${i+1}`, title: name, duration_sec: 150 + i * 20,
    }))
  },
  an2: {
    id: 'an2', title: '亲宝儿歌之运动', emoji: '🐕',
    bg: 'linear-gradient(135deg,#81D4FA,#0288D1)',
    desc: '亲宝儿歌运动系列，帮助宝宝活动身体，快乐成长。',
    eps: 20, tag: '全龄 · 儿歌动画',
    episodes: Array.from({ length: 20 }, (_, i) => ({
      id: `ep-an2-${i+1}`, title: `运动儿歌第${i+1}集`, duration_sec: 120 + i * 15,
    }))
  },
  an3: {
    id: 'an3', title: '潮流新儿歌', emoji: '🎤',
    bg: 'linear-gradient(135deg,#6A1B9A,#BA68C8)',
    desc: '时尚潮流风格儿歌，活泼动感，让宝宝爱上音乐。',
    eps: 10, tag: '全龄 · 儿歌动画',
    episodes: Array.from({ length: 10 }, (_, i) => ({
      id: `ep-an3-${i+1}`, title: `潮流儿歌第${i+1}集`, duration_sec: 130 + i * 10,
    }))
  },
  an4: {
    id: 'an4', title: '火火兔儿歌', emoji: '🐰',
    bg: 'linear-gradient(135deg,#FF8F00,#FFC107)',
    desc: '火火兔系列动画儿歌，萌趣可爱，宝宝百看不厌。',
    eps: 25, tag: '全龄 · 儿歌动画',
    episodes: Array.from({ length: 25 }, (_, i) => ({
      id: `ep-an4-${i+1}`, title: `火火兔第${i+1}集`, duration_sec: 140 + i * 12,
    }))
  },
  an5: {
    id: 'an5', title: '小猫汤米', emoji: '🐱',
    bg: 'linear-gradient(135deg,#FF6B6B,#FF8E53)',
    desc: '小猫汤米的温馨日常，充满爱与欢笑的亲子故事。',
    eps: 24, tag: '全龄 · 故事动画',
    episodes: ['汤米的早晨','和朋友玩耍','迷路了怎么办','雨天在家','汤米学游泳','找到新朋友','帮助小鸟','生日快乐','秋天的落叶','晚安汤米','汤米爱画画','汤米的花园','捉迷藏','汤米学唱歌','和妈妈一起','汤米生病了','新朋友小狗','汤米的玩具','雪天的故事','汤米上幼儿园','春游记','汤米学做饭','好朋友','汤米的梦'].map((name, i) => ({
      id: `ep-an5-${i+1}`, title: name, duration_sec: 180 + i * 10,
    }))
  },
  an6: {
    id: 'an6', title: '豆小鸭迷你冒险', emoji: '🐥',
    bg: 'linear-gradient(135deg,#F7DC6F,#F39C12)',
    desc: '豆小鸭带你探索神奇的迷你世界，充满想象力的冒险故事。',
    eps: 18, tag: '全龄 · 故事动画',
    episodes: ['豆小鸭出发啦','草丛大冒险','遇见小蚂蚁','花园里的秘密','池塘探险','小虫子的家','雨后彩虹','找到宝藏','新朋友蜗牛','回家的路','夜晚的星空','萤火虫舞会','神奇的蘑菇','豆小鸭飞翔','水中的倒影','小石头的故事','风儿带我走','豆小鸭的梦'].map((name, i) => ({
      id: `ep-an6-${i+1}`, title: name, duration_sec: 160 + i * 15,
    }))
  },
  an7: {
    id: 'an7', title: '超级飞侠', emoji: '✈️',
    bg: 'linear-gradient(135deg,#5DADE2,#2E86C1)',
    desc: '超级飞侠环游世界，帮助有需要的小朋友，传递正能量。',
    eps: 32, tag: '全龄 · 故事动画',
    episodes: Array.from({ length: 32 }, (_, i) => ({
      id: `ep-an7-${i+1}`, title: `超级飞侠第${i+1}集`, duration_sec: 200 + i * 8,
    }))
  },
  an8: {
    id: 'an8', title: '小猪佩奇', emoji: '🐷',
    bg: 'linear-gradient(135deg,#F1948A,#E74C3C)',
    desc: '小猪佩奇和家人朋友的快乐日常，温馨有趣的亲子动画。',
    eps: 26, tag: '全龄 · 故事动画',
    episodes: Array.from({ length: 26 }, (_, i) => ({
      id: `ep-an8-${i+1}`, title: `小猪佩奇第${i+1}集`, duration_sec: 180 + i * 10,
    }))
  },
  an17: {
    id: 'an17', title: '古诗里的小百科', emoji: '🦜',
    bg: 'linear-gradient(135deg,#2E7D32,#81C784)',
    desc: '用动画讲述古诗里的知识，让宝宝爱上中国传统文化。',
    eps: 20, tag: '全龄 · 国学动画',
    episodes: ['春晓','惠崇春江晚景','绝句','静夜思','望庐山瀑布','登鹳雀楼','咏鹅','悯农','江雪','游子吟','早发白帝城','赠汪伦','黄鹤楼送孟浩然','望天门山','夜宿山寺','山行','清明','江南','池上','小池'].map((name, i) => ({
      id: `ep-an17-${i+1}`, title: name, duration_sec: 350,
    }))
  },
  m1: {
    id: 'm1', title: '早安宝宝', emoji: '☀️',
    bg: 'linear-gradient(135deg,#FF8F00,#FFC107)',
    desc: '阳光满满的晨起故事，用温柔声音叫醒宝宝，开启元气一天。',
    eps: 15, tag: '全龄 · 晨起故事',
    episodes: Array.from({ length: 15 }, (_, i) => ({
      id: `ep-m1-${i + 1}`, title: `早安宝宝 · 第${i + 1}集`, duration_sec: 110 + i * 18,
    })),
  },
  m2: {
    id: 'm2', title: '新的一天开始了', emoji: '🌈',
    bg: 'linear-gradient(135deg,#E91E63,#FF9800)',
    desc: '彩虹与朝阳主题晨起故事，培养宝宝对每一天的期待与好奇。',
    eps: 12, tag: '全龄 · 晨起故事',
    episodes: Array.from({ length: 12 }, (_, i) => ({
      id: `ep-m2-${i + 1}`, title: `新的一天 · 第${i + 1}集`, duration_sec: 125 + i * 15,
    })),
  },
  m3: {
    id: 'm3', title: '早起的小鸟', emoji: '🐦',
    bg: 'linear-gradient(135deg,#1565C0,#42A5F5)',
    desc: '跟着小鸟一起迎接清晨，轻松愉快的起床仪式感故事。',
    eps: 18, tag: '全龄 · 晨起故事',
    episodes: Array.from({ length: 18 }, (_, i) => ({
      id: `ep-m3-${i + 1}`, title: `早起的小鸟 · 第${i + 1}集`, duration_sec: 100 + i * 12,
    })),
  },
  m4: {
    id: 'm4', title: '晨间好习惯', emoji: '🪥',
    bg: 'linear-gradient(135deg,#2E7D32,#81C784)',
    desc: '刷牙、洗脸、穿衣……用故事帮宝宝养成晨间好routine。',
    eps: 10, tag: '全龄 · 晨起故事',
    episodes: Array.from({ length: 10 }, (_, i) => ({
      id: `ep-m4-${i + 1}`, title: `晨间好习惯 · 第${i + 1}集`, duration_sec: 95 + i * 20,
    })),
  },
  c1: {
    id: 'c1', title: '小皮球在哪里', emoji: '🔴',
    bg: 'linear-gradient(135deg,#E0F7FA,#0097A7)',
    desc: '找一找、看一看，锻炼观察力与空间概念的认知启蒙故事。',
    eps: 16, tag: '全龄 · 认知启蒙',
    episodes: Array.from({ length: 16 }, (_, i) => ({
      id: `ep-c1-${i + 1}`, title: `小皮球在哪里 · 第${i + 1}集`, duration_sec: 130 + i * 10,
    })),
  },
  c2: {
    id: 'c2', title: '颜色王国', emoji: '🎨',
    bg: 'linear-gradient(135deg,#F3E5F5,#9C27B0)',
    desc: '红橙黄绿青蓝紫，在颜色王国里认识世界、激发想象力。',
    eps: 12, tag: '全龄 · 认知启蒙',
    episodes: Array.from({ length: 12 }, (_, i) => ({
      id: `ep-c2-${i + 1}`, title: `颜色王国 · 第${i + 1}集`, duration_sec: 120 + i * 14,
    })),
  },
  c3: {
    id: 'c3', title: '数字宝宝', emoji: '🔢',
    bg: 'linear-gradient(135deg,#E8F5E9,#388E3C)',
    desc: '从1数到10，数字宝宝带宝宝玩中学、轻松数学启蒙。',
    eps: 20, tag: '全龄 · 认知启蒙',
    episodes: Array.from({ length: 20 }, (_, i) => ({
      id: `ep-c3-${i + 1}`, title: `数字宝宝 · 第${i + 1}集`, duration_sec: 115 + i * 8,
    })),
  },
  c4: {
    id: 'c4', title: '形状大探索', emoji: '🔷',
    bg: 'linear-gradient(135deg,#FFF8E1,#F9A825)',
    desc: '圆形方形三角形，动手动脑认识形状，为几何思维打基础。',
    eps: 14, tag: '全龄 · 认知启蒙',
    episodes: Array.from({ length: 14 }, (_, i) => ({
      id: `ep-c4-${i + 1}`, title: `形状大探索 · 第${i + 1}集`, duration_sec: 118 + i * 12,
    })),
  },
  l1: {
    id: 'l1', title: '小熊学刷牙', emoji: '🐻',
    bg: 'linear-gradient(135deg,#E8F5E9,#4CAF50)',
    desc: '跟着小熊一起刷牙，让宝宝爱上清洁牙齿的好习惯。',
    eps: 8, tag: '全龄 · 生活发展',
    episodes: Array.from({ length: 8 }, (_, i) => ({
      id: `ep-l1-${i + 1}`, title: `小熊学刷牙 · 第${i + 1}集`, duration_sec: 140 + i * 25,
    })),
  },
  l2: {
    id: 'l2', title: '我会自己吃饭', emoji: '🍚',
    bg: 'linear-gradient(135deg,#FFF3E0,#FF9800)',
    desc: '自己拿勺、不挑食，生活自理从好好吃饭开始。',
    eps: 10, tag: '全龄 · 生活发展',
    episodes: Array.from({ length: 10 }, (_, i) => ({
      id: `ep-l2-${i + 1}`, title: `我会自己吃饭 · 第${i + 1}集`, duration_sec: 135 + i * 20,
    })),
  },
  l3: {
    id: 'l3', title: '穿衣服真有趣', emoji: '👕',
    bg: 'linear-gradient(135deg,#FCE4EC,#E91E63)',
    desc: '分清前后、学会扣扣子，穿衣服也可以很好玩。',
    eps: 6, tag: '全龄 · 生活发展',
    episodes: Array.from({ length: 6 }, (_, i) => ({
      id: `ep-l3-${i + 1}`, title: `穿衣服真有趣 · 第${i + 1}集`, duration_sec: 128 + i * 22,
    })),
  },
  l4: {
    id: 'l4', title: '宝宝爱整理', emoji: '🧸',
    bg: 'linear-gradient(135deg,#E3F2FD,#1565C0)',
    desc: '玩具回家、书本归位，培养收纳意识与责任感。',
    eps: 8, tag: '全龄 · 生活发展',
    episodes: Array.from({ length: 8 }, (_, i) => ({
      id: `ep-l4-${i + 1}`, title: `宝宝爱整理 · 第${i + 1}集`, duration_sec: 132 + i * 18,
    })),
  },
  e1: {
    id: 'e1', title: '小兔子交朋友', emoji: '🐰',
    bg: 'linear-gradient(135deg,#EDE7F6,#7B3FD4)',
    desc: '学会打招呼、分享与等待，社交第一步从交朋友开始。',
    eps: 12, tag: '全龄 · 情绪社交',
    episodes: Array.from({ length: 12 }, (_, i) => ({
      id: `ep-e1-${i + 1}`, title: `小兔子交朋友 · 第${i + 1}集`, duration_sec: 145 + i * 16,
    })),
  },
  e2: {
    id: 'e2', title: '我有点害怕', emoji: '🌟',
    bg: 'linear-gradient(135deg,#FFF8E1,#FF8F00)',
    desc: '接纳害怕的情绪，给宝宝安全感与面对未知的勇气。',
    eps: 10, tag: '全龄 · 情绪社交',
    episodes: Array.from({ length: 10 }, (_, i) => ({
      id: `ep-e2-${i + 1}`, title: `我有点害怕 · 第${i + 1}集`, duration_sec: 138 + i * 20,
    })),
  },
  e3: {
    id: 'e3', title: '分享真快乐', emoji: '🎁',
    bg: 'linear-gradient(135deg,#FCE4EC,#E91E63)',
    desc: '分享玩具与心情，体会「给予」带来的双倍快乐。',
    eps: 8, tag: '全龄 · 情绪社交',
    episodes: Array.from({ length: 8 }, (_, i) => ({
      id: `ep-e3-${i + 1}`, title: `分享真快乐 · 第${i + 1}集`, duration_sec: 130 + i * 24,
    })),
  },
  e4: {
    id: 'e4', title: '我爱我的家', emoji: '🏠',
    bg: 'linear-gradient(135deg,#E8F5E9,#2E7D32)',
    desc: '家人之间的爱与陪伴，帮宝宝建立归属感与情感纽带。',
    eps: 14, tag: '全龄 · 情绪社交',
    episodes: Array.from({ length: 14 }, (_, i) => ({
      id: `ep-e4-${i + 1}`, title: `我爱我的家 · 第${i + 1}集`, duration_sec: 142 + i * 14,
    })),
  },
}

const DEFAULT_COLLECTION = COLLECTIONS['001']

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function CollectionPageContent({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromParam = searchParams.get('from')
  const col = COLLECTIONS[id] ?? DEFAULT_COLLECTION
  const fromQ = playerFromSuffix(fromParam)

  const [colFaved, setColFaved] = useState(false)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    setColFaved(isFavorited(`col-${col.id}`))
    const unsub = subscribe(() => forceUpdate(n => n + 1))
    return unsub
  }, [col.id])

  const handleFavCol = () => {
    toggleFavorite({
      id: `col-${col.id}`,
      type: 'collection',
      title: col.title,
      emoji: col.emoji,
      bg: col.bg,
      subtitle: col.tag,
      savedAt: Date.now(),
    })
    setColFaved(f => !f)
  }

  return (
    <div className="phone-shell">
      {/* Status */}
      <div className="h-12 px-7 flex justify-between items-center pt-3 flex-shrink-0"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <span className="text-[15px] font-bold text-white">21:09</span>
        <span className="text-sm text-white">📶🔋</span>
      </div>

      {/* Hero */}
      <div className="flex-shrink-0 relative" style={{ background: col.bg, paddingTop: 48, paddingBottom: 24 }}>
        <button type="button" onClick={() => router.push(pathAfterCollectionBack(fromParam))}
          className="absolute top-14 left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}>
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div className="text-center px-8 pt-6">
          <div className="text-[60px] mb-2 animate-float">{col.emoji}</div>
          <div className="text-white text-[20px] font-black mb-1">{col.title}</div>
          <div className="text-white/55 text-[12px] mb-3">{col.tag} · 共{col.eps}集</div>
          <div className="text-white/70 text-[12px] leading-relaxed px-4">{col.desc}</div>
        </div>

        <div className="flex justify-center mt-4 gap-3">
          <button type="button" onClick={() => router.push(`/player/${col.episodes[0].id}?col=${col.id}&autoplay=1${fromQ}`)}
            className="flex items-center gap-2 text-white text-[13px] font-bold px-5 py-2.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            从头播放
          </button>
          <button onClick={handleFavCol}
            className="flex items-center gap-2 text-white text-[13px] font-bold px-5 py-2.5 rounded-full transition-all"
            style={{
              background: colFaved ? 'rgba(233,30,99,0.5)' : 'rgba(255,255,255,0.15)',
              border: colFaved ? '1px solid rgba(233,30,99,0.8)' : '1px solid transparent',
            }}>
            {colFaved ? '♥ 已收藏' : '♡ 收藏合集'}
          </button>
        </div>
      </div>

      {/* Episodes */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-[#FBF7FF]">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#1A0A2E]">全部单集</span>
          <span className="text-[12px] text-[#B0A0C8]">共{col.episodes.length}集</span>
        </div>

        <div className="px-4 flex flex-col gap-2 pb-8">
          {col.episodes.map((ep, i) => (
            <div key={ep.id}
              onClick={() => router.push(`/player/${ep.id}?col=${col.id}&title=${encodeURIComponent(ep.title)}${fromQ}`)}
              className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-[#F0E8FF] cursor-pointer active:scale-[0.98] transition-transform">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold"
                style={{
                  background: i === 0 ? 'linear-gradient(135deg,#7B3FD4,#E91E63)' : '#F0E8FF',
                  color: i === 0 ? '#fff' : '#B0A0C8',
                }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A0A2E] truncate">{ep.title}</div>
                <div className="text-[11px] text-[#B0A0C8] mt-0.5">{fmt(ep.duration_sec)}</div>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: i === 0 ? 'linear-gradient(135deg,#F06292,#9C6FD6)' : '#F0E8FF' }}>
                <svg className="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill={i === 0 ? 'white' : '#B0A0C8'}>
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CollectionPage({ params }: { params: { id: string } }) {
  const id = params.id
  return (
    <Suspense
      fallback={
        <div className="phone-shell flex items-center justify-center bg-[#FBF7FF] min-h-[844px]">
          <div className="text-[#B0A0C8] text-sm">加载中...</div>
        </div>
      }
    >
      <CollectionPageContent id={id} />
    </Suspense>
  )
}
