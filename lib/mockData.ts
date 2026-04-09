export type AgeGroup = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
export type Category = 'cognition' | 'life' | 'emotion' | 'culture' | 'imagination'
export type StoryStatus = 'published' | 'member_only' | 'ai_generated'

export interface Story {
  id: string
  title: string
  age_group: AgeGroup
  age_label: string
  category: Category
  category_label: string
  sub_category: string
  duration_sec: number
  cover_emoji: string
  cover_bg: string
  status: StoryStatus
  is_ai: boolean
  play_count: number
  audio_url: string | null
  description: string
}

const AGE_LABELS: Record<AgeGroup, string> = {
  L1: '0-6月', L2: '6-12月', L3: '1-1.5岁', L4: '1.5-2岁', L5: '2-3岁',
}
const CAT_LABELS: Record<Category, string> = {
  cognition: '认知启蒙', life: '成长日常', emotion: '爱与情感',
  culture: '文化传承', imagination: '想象创造',
}

// ── 每个月龄段 × 每个分类 8条，共 5×5×8 = 200条 ──
const TEMPLATES: Array<{
  age: AgeGroup, cat: Category, sub: string,
  titles: string[], emoji: string, bg: string,
}> = [
  // L1 × cognition
  { age:'L1', cat:'cognition', sub:'感知探索',
    emoji:'🌟', bg:'linear-gradient(135deg,#FFF8E1,#FFE0B2)',
    titles:['小星星说话了','叮咚叮咚的声音','光影游戏','摸摸软软的','闻一闻香香的','颜色真好看','听妈妈的心跳','感觉真奇妙'] },
  // L1 × life
  { age:'L1', cat:'life', sub:'作息规律',
    emoji:'🌙', bg:'linear-gradient(135deg,#E8EAF6,#C5CAE9)',
    titles:['晚安小宝贝','睡前摇篮曲','早安太阳公公','吃奶奶时间到','小手洗干净','抱抱真舒服','换尿布啦','洗澡好开心'] },
  // L1 × emotion
  { age:'L1', cat:'emotion', sub:'依恋建立',
    emoji:'💛', bg:'linear-gradient(135deg,#FFF9C4,#FFF176)',
    titles:['妈妈的怀抱','爸爸的大手','笑一个吧','宝宝不哭','我爱你宝贝','安全的港湾','最爱的声音','永远在你身边'] },
  // L1 × culture
  { age:'L1', cat:'culture', sub:'韵律感知',
    emoji:'🏮', bg:'linear-gradient(135deg,#FFEBEE,#FFCDD2)',
    titles:['小星星古诗','床前明月光','春眠不觉晓','锄禾日当午','咿呀学语谣','儿歌唱起来','古韵启蒙曲','韵律真好听'] },
  // L1 × imagination
  { age:'L1', cat:'imagination', sub:'感官想象',
    emoji:'🌈', bg:'linear-gradient(135deg,#F3E5F5,#E1BEE7)',
    titles:['云朵在飘','小雨滴跳舞','彩虹来了','风儿轻轻吹','小草探头了','树叶沙沙响','蝴蝶飞过来','梦里好世界'] },

  // L2 × cognition
  { age:'L2', cat:'cognition', sub:'因果认知',
    emoji:'🔍', bg:'linear-gradient(135deg,#E0F7FA,#B2EBF2)',
    titles:['小皮球在哪里','躲猫猫','开关灯','叠叠乐倒了','小铃铛哪去了','倒水哗哗流','推推小积木','滚来滚去'] },
  // L2 × life
  { age:'L2', cat:'life', sub:'尝试参与',
    emoji:'🍚', bg:'linear-gradient(135deg,#F1F8E9,#DCEDC8)',
    titles:['拍拍手洗洗手','自己喝水','吃饭饭啦','小勺子用起来','穿袜子','脱帽子','收玩具时间','小马桶坐坐'] },
  // L2 × emotion
  { age:'L2', cat:'emotion', sub:'情绪识别',
    emoji:'😊', bg:'linear-gradient(135deg,#FCE4EC,#F8BBD0)',
    titles:['笑一笑真好看','小熊哭了','害怕没关系','开心拍拍手','生气怎么办','委屈了怎么说','爱笑的宝宝','分享真快乐'] },
  // L2 × culture
  { age:'L2', cat:'culture', sub:'片段熟悉',
    emoji:'📜', bg:'linear-gradient(135deg,#FFF3E0,#FFE0B2)',
    titles:['小兔乖乖','数字歌','小燕子来了','捉迷藏歌','劳动最光荣','我爱北京','三字经启蒙','弟子规片段'] },
  // L2 × imagination
  { age:'L2', cat:'imagination', sub:'简单探索',
    emoji:'🐾', bg:'linear-gradient(135deg,#E8F5E9,#C8E6C9)',
    titles:['小雨滴的旅行','种子怎么长','小蜜蜂嗡嗡','青蛙呱呱叫','小鸟飞高高','蚂蚁搬家','蜗牛慢慢走','小鱼游游游'] },

  // L3 × cognition
  { age:'L3', cat:'cognition', sub:'语言词汇',
    emoji:'💬', bg:'linear-gradient(135deg,#EDE7F6,#D1C4E9)',
    titles:['认识颜色','大小比比看','上下左右找','圆形方形真有趣','动物朋友叫什么','水果摊摊','交通工具来了','我的身体'] },
  // L3 × life
  { age:'L3', cat:'life', sub:'主动执行',
    emoji:'🦷', bg:'linear-gradient(135deg,#E3F2FD,#BBDEFB)',
    titles:['自己刷牙','穿衣服学习','自己走路','收拾玩具真棒','吃饭不挑食','睡前故事时间','洗澡泡泡多','帮妈妈做事'] },
  // L3 × emotion
  { age:'L3', cat:'emotion', sub:'自我表达',
    emoji:'🗣️', bg:'linear-gradient(135deg,#FBE9E7,#FFCCBC)',
    titles:['我不高兴','我想要这个','对不起真诚心','谢谢你朋友','我能自己来','不行你别走','妈妈我爱你','宝宝有想法'] },
  // L3 × culture
  { age:'L3', cat:'culture', sub:'含义理解',
    emoji:'🎋', bg:'linear-gradient(135deg,#F9FBE7,#F0F4C3)',
    titles:['春节到来了','元宵节猜灯谜','清明祭祖先','端午粽子香','中秋赏月亮','重阳尊老人','冬至吃汤圆','过年真热闹'] },
  // L3 × imagination
  { age:'L3', cat:'imagination', sub:'兴趣激发',
    emoji:'🧚', bg:'linear-gradient(135deg,#FCE4EC,#F48FB1)',
    titles:['小仙子的翅膀','云朵城堡','糖果屋','会说话的玩具','月亮上的兔子','星星睡觉了','海底小世界','魔法棒变变变'] },

  // L4 × cognition
  { age:'L4', cat:'cognition', sub:'规则理解',
    emoji:'🎯', bg:'linear-gradient(135deg,#F3E5F5,#CE93D8)',
    titles:['排队有秩序','等一等轮到你','信号灯规则','公共场所礼貌','图书馆安静','借东西要还','爱护公物','做个好公民'] },
  // L4 × life
  { age:'L4', cat:'life', sub:'规范巩固',
    emoji:'🏠', bg:'linear-gradient(135deg,#EFEBE9,#D7CCC8)',
    titles:['垃圾分类学','节约用水','爱护小植物','关灯节电','整理书包','洗手七步法','饭前便后洗手','保护环境'] },
  // L4 × emotion
  { age:'L4', cat:'emotion', sub:'技能学习',
    emoji:'🤝', bg:'linear-gradient(135deg,#E8F5E9,#A5D6A7)',
    titles:['一起玩吧','轮流来','我们是朋友','分享小饼干','吵架和好了','帮助小朋友','邀请你加入','团队合作棒'] },
  // L4 × culture
  { age:'L4', cat:'culture', sub:'美德吸收',
    emoji:'🌺', bg:'linear-gradient(135deg,#FFF8E1,#FFE082)',
    titles:['孔融让梨','司马光砸缸','曹冲称象','铁杵磨成针','龟兔赛跑','狐狸和葡萄','农夫与蛇','小马过河'] },
  // L4 × imagination
  { age:'L4', cat:'imagination', sub:'勇气锻炼',
    emoji:'🦁', bg:'linear-gradient(135deg,#FFF3E0,#FFCC80)',
    titles:['小狮子学吼叫','勇敢的小鸭子','克服黑暗恐惧','第一次滑滑梯','学游泳不怕水','试一试真棒','我能做到的','勇气在哪里'] },

  // L5 × cognition
  { age:'L5', cat:'cognition', sub:'逻辑运用',
    emoji:'🧠', bg:'linear-gradient(135deg,#E8EAF6,#9FA8DA)',
    titles:['为什么天黑了','种子怎么长大','水从哪里来','影子为什么动','冰变成水','彩虹怎么来的','月亮为什么变','恐龙去哪里了'] },
  // L5 × life
  { age:'L5', cat:'life', sub:'自主优化',
    emoji:'⭐', bg:'linear-gradient(135deg,#E0F7FA,#80DEEA)',
    titles:['我的时间表','计划做作业','整理我的房间','管理零花钱','提前准备好','目标和计划','习惯好力量','今天我当家'] },
  // L5 × emotion
  { age:'L5', cat:'emotion', sub:'灵活运用',
    emoji:'💝', bg:'linear-gradient(135deg,#FCE4EC,#EF9A9A)',
    titles:['我做小主人','一起分享玩具','主动说你好','道歉要真诚','化解小冲突','理解朋友心','集体融入了','社交小达人'] },
  // L5 × culture
  { age:'L5', cat:'culture', sub:'经典积累',
    emoji:'📚', bg:'linear-gradient(135deg,#FBE9E7,#FF8A65)',
    titles:['三字经故事','弟子规道理','唐诗三百首','宋词美如画','成语小故事','民间传说','中国神话故事','历史小英雄'] },
  // L5 × imagination
  { age:'L5', cat:'imagination', sub:'创意拓展',
    emoji:'🎨', bg:'linear-gradient(135deg,#F3E5F5,#BA68C8)',
    titles:['我来讲故事','发明新玩具','设计小城市','当个小导演','写信给未来','创作小诗歌','想象太空生活','梦想职业秀'] },
]

// 生成200条数据
let _id = 1
export const MOCK_STORIES: Story[] = TEMPLATES.flatMap(tpl =>
  tpl.titles.map((title, i) => {
    const id = String(_id++).padStart(3, '0')
    const isMemberOnly = i >= 2 // 前2条免费，后6条会员
    const isAi = i === 2 // 第3条是AI生成示例
    return {
      id,
      title,
      age_group: tpl.age,
      age_label: AGE_LABELS[tpl.age],
      category: tpl.cat,
      category_label: CAT_LABELS[tpl.cat],
      sub_category: tpl.sub,
      duration_sec: 120 + ((i * 37 + TEMPLATES.indexOf(tpl) * 13) % 240),
      cover_emoji: tpl.emoji,
      cover_bg: tpl.bg,
      status: isMemberOnly ? 'member_only' : (isAi ? 'ai_generated' : 'published'),
      is_ai: isAi,
      play_count: (i * 7919 + TEMPLATES.indexOf(tpl) * 3571 + 12345) % 500000,
      audio_url: null, // mock: no real audio yet
      description: `${AGE_LABELS[tpl.age]}适合的${tpl.sub}故事，帮助宝宝${CAT_LABELS[tpl.cat]}发展。`,
    }
  })
)

export function getStoriesByFilter(ageGroup?: AgeGroup, category?: Category): Story[] {
  return MOCK_STORIES.filter(s =>
    (!ageGroup || s.age_group === ageGroup) &&
    (!category || s.category === category)
  )
}

export function getStoryById(id: string): Story | undefined {
  return MOCK_STORIES.find(s => s.id === id)
}

export const AGE_OPTIONS = [
  { value: 'L1' as AgeGroup, label: '0-6月' },
  { value: 'L2' as AgeGroup, label: '6-12月' },
  { value: 'L3' as AgeGroup, label: '1-1.5岁' },
  { value: 'L4' as AgeGroup, label: '1.5-2岁' },
  { value: 'L5' as AgeGroup, label: '2-3岁' },
  { value: undefined as unknown as AgeGroup, label: '3岁+' },
]

export const CAT_OPTIONS = [
  { value: undefined, label: '全部' },
  { value: 'cognition' as Category, label: '认知启蒙', emoji: '🔍' },
  { value: 'life' as Category, label: '成长日常', emoji: '🏠' },
  { value: 'emotion' as Category, label: '爱与情感', emoji: '💛' },
  { value: 'culture' as Category, label: '文化传承', emoji: '🏮' },
  { value: 'imagination' as Category, label: '想象创造', emoji: '🌈' },
]
