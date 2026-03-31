// scripts/batch-produce.ts
// 后台批量生产脚本 — 替代 Coze 工作流1+2+3
// 运营手动触发一次，生成200条故事完整入库
//
// 运行方式：
//   npx ts-node scripts/batch-produce.ts
//   或：npx tsx scripts/batch-produce.ts

import { generateStoryScript, type StoryGenParams, type AgeStage } from '../lib/llm'
import { auditScript, auditAudio, auditWithRetry } from '../lib/audit'
import { synthesizeStory } from '../lib/tts'

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

// ── 200条故事生产计划（对应内容框架）──
// 5个月龄段 × 5个一级分类 × 8条 = 200条
const PRODUCTION_PLAN: StoryGenParams[] = [
  // ── L1 (0-6月) × 每分类8条 ──
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L1' as AgeStage, scene: '睡前故事',
    protagonist: ['星星', '月亮', '云朵', '小鸟', '妈妈', '宝宝', '风儿', '小花'][i],
    theme: ['感官唤醒', '依恋建立', '听觉刺激', '触觉感知', '亲子互动', '安抚入眠', '韵律节奏', '情感联结'][i],
    seriesName: '感官启蒙',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L1' as AgeStage, scene: '晨起故事',
    protagonist: ['太阳', '小鸟', '露珠', '小草', '蝴蝶', '彩虹', '微风', '花朵'][i],
    theme: ['作息规律', '晨间互动', '身体感知', '声音探索', '视觉刺激', '嗅觉感知', '亲子依恋', '情绪安抚'][i],
    seriesName: '晨间唤醒',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L1' as AgeStage, scene: '亲子互动',
    protagonist: ['宝宝', '妈妈', '爸爸', '小手', '小脚', '眼睛', '微笑', '心跳'][i],
    theme: ['亲子互动', '身体认知', '情感联结', '感官游戏', '肢体探索', '语言萌芽', '社交萌芽', '安全感'][i],
    seriesName: '亲子温情',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L1' as AgeStage, scene: '睡前故事',
    protagonist: ['小熊', '小兔', '小猫', '小狗', '小象', '小鱼', '小马', '小鸡'][i],
    theme: ['韵律感知', '拟声词学习', '动物认知', '声音模仿', '节奏感受', '文化启蒙', '古典韵律', '诗歌启蒙'][i],
    seriesName: '小动物韵律',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L1' as AgeStage, scene: '外出听听',
    protagonist: ['云朵', '小雨', '彩虹', '风儿', '树叶', '小溪', '小草', '蒲公英'][i],
    theme: ['感官想象', '自然感知', '声音探索', '色彩感知', '触觉体验', '嗅觉启蒙', '视觉刺激', '感官协同'][i],
    seriesName: '自然感知',
  })),

  // ── L2 (6-12月) × 每分类8条 ──
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L2' as AgeStage, scene: '亲子互动',
    protagonist: ['小皮球', '小铃铛', '小积木', '小杯子', '小勺子', '小镜子', '小纸盒', '小布偶'][i],
    theme: ['因果认知', '物体探索', '躲猫猫游戏', '物体恒存', '容纳关系', '大小概念', '颜色认知', '形状认知'][i],
    seriesName: '探索玩具',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L2' as AgeStage, scene: '晨起故事',
    protagonist: ['小熊', '小兔', '小鸭', '小猫', '小狗', '小鸡', '小猪', '小羊'][i],
    theme: ['洗手习惯', '饮食行为', '穿衣学习', '收玩具', '如厕训练', '作息规律', '个人清洁', '睡前准备'][i],
    seriesName: '生活小达人',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L2' as AgeStage, scene: '睡前故事',
    protagonist: ['小熊宝宝', '妈妈熊', '爸爸熊', '小兔子', '小猫咪', '小狗狗', '小象', '小鸟'][i],
    theme: ['情绪识别', '笑脸传递', '害怕安抚', '开心表达', '委屈处理', '依恋情感', '分享快乐', '安全感建立'][i],
    seriesName: '情绪小宝贝',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L2' as AgeStage, scene: '外出听听',
    protagonist: ['小星星', '月亮公公', '太阳', '小鸟', '蝴蝶', '小蜜蜂', '小蚂蚁', '小青蛙'][i],
    theme: ['韵律模仿', '古诗启蒙', '儿歌学习', '数字认知', '颜色名称', '动物声音', '自然认知', '文化感知'][i],
    seriesName: '韵律启蒙',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L2' as AgeStage, scene: '亲子互动',
    protagonist: ['小雨滴', '小蜗牛', '小蚂蚁', '小蜜蜂', '小青蛙', '小蝴蝶', '小鱼儿', '小松鼠'][i],
    theme: ['模仿探索', '爬行游戏', '追逐玩耍', '滚球游戏', '叠叠乐', '扔球接球', '推拉玩具', '感官探索'][i],
    seriesName: '动作探索',
  })),

  // ── L3 (1-1.5岁) × 每分类8条 ──
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L3' as AgeStage, scene: '亲子互动',
    protagonist: ['小虎虎', '小猪猪', '小熊熊', '小猫猫', '小狗狗', '小兔兔', '小象象', '小鸭鸭'][i],
    theme: ['颜色认知', '形状认知', '数量概念', '大小比较', '空间方位', '动物认识', '身体部位', '日常物品'][i],
    seriesName: '认知小课堂',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L3' as AgeStage, scene: '晨起故事',
    protagonist: ['小熊', '小兔', '小猪', '小猫', '小狗', '小鸭', '小象', '小羊'][i],
    theme: ['自己刷牙', '自己穿衣', '自己吃饭', '自己走路', '收拾玩具', '洗手洗脸', '睡前准备', '帮妈妈做事'][i],
    seriesName: '自己来',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L3' as AgeStage, scene: '睡前故事',
    protagonist: ['小熊', '小狐狸', '小兔', '小鸟', '小松鼠', '小刺猬', '小猫', '小鱼'][i],
    theme: ['情绪表达', '需求表达', '说不高兴', '要求帮助', '表示喜欢', '分享情绪', '寻求安慰', '自我接纳'][i],
    seriesName: '说出来',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L3' as AgeStage, scene: '外出听听',
    protagonist: ['巧虎', '小花猫', '小黑狗', '小白兔', '小棕熊', '小绿蛙', '小黄鸭', '小红鸟'][i],
    theme: ['春节习俗', '中秋赏月', '端午粽子', '元宵猜谜', '清明踏青', '重阳敬老', '冬至汤圆', '传统节日'][i],
    seriesName: '节日故事',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L3' as AgeStage, scene: '亲子互动',
    protagonist: ['小魔法师', '小仙子', '小精灵', '小云朵', '小星星', '小彩虹', '小月亮', '小太阳'][i],
    theme: ['想象力启发', '角色扮演', '创意游戏', '魔法故事', '冒险探索', '神奇世界', '梦境游历', '奇幻想象'][i],
    seriesName: '想象世界',
  })),

  // ── L4 (1.5-2岁) × 每分类8条 ──
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L4' as AgeStage, scene: '亲子互动',
    protagonist: ['小博士', '小科学家', '小探险家', '小发明家', '小问号', '小望远镜', '小放大镜', '小笔记本'][i],
    theme: ['为什么下雨', '种子怎么长', '影子为何动', '水变成冰', '气泡从哪来', '彩虹怎么来', '月亮为何变', '蚂蚁怎么搬'][i],
    seriesName: '十万个为什么',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L4' as AgeStage, scene: '晨起故事',
    protagonist: ['小熊', '小兔', '小猫', '小狗', '小象', '小鸭', '小鸡', '小猪'][i],
    theme: ['垃圾分类', '节约用水', '爱护植物', '关灯节电', '整理房间', '保护环境', '爱惜粮食', '文明出行'][i],
    seriesName: '环保小卫士',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L4' as AgeStage, scene: '睡前故事',
    protagonist: ['小熊', '小猫', '小兔', '小鸭', '小猪', '小狗', '小羊', '小鸟'][i],
    theme: ['一起玩', '轮流玩', '做朋友', '分享玩具', '和好了', '帮助别人', '邀请加入', '团队合作'][i],
    seriesName: '小小社交家',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L4' as AgeStage, scene: '外出听听',
    protagonist: ['孔融', '司马光', '曹冲', '小乌龟', '小兔子', '小狐狸', '小蚂蚁', '小老鼠'][i],
    theme: ['孔融让梨', '司马光砸缸', '曹冲称象', '龟兔赛跑', '狐狸葡萄', '蚂蚁搬家', '小老鼠历险', '勇敢诚实'][i],
    seriesName: '美德故事',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L4' as AgeStage, scene: '亲子互动',
    protagonist: ['小狮子', '小老虎', '小豹子', '小猴子', '小浣熊', '小企鹅', '小北极熊', '小海豚'][i],
    theme: ['克服黑暗', '第一次游泳', '学会跳跃', '面对陌生', '尝试新食物', '第一次上幼儿园', '勇敢打针', '独立睡觉'][i],
    seriesName: '勇敢向前',
  })),

  // ── L5 (2-3岁) × 每分类8条 ──
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L5' as AgeStage, scene: '亲子互动',
    protagonist: ['小问号', '小探险家', '小科学家', '小哲学家', '小发明家', '小艺术家', '小诗人', '小作家'][i],
    theme: ['数量排列', '因果推理', '分类排序', '空间关系', '时间概念', '数字游戏', '逻辑谜题', '问题解决'][i],
    seriesName: '小小思考家',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L5' as AgeStage, scene: '晨起故事',
    protagonist: ['小明', '小花', '小军', '小雨', '小阳', '小朵', '小峰', '小晴'][i],
    theme: ['制定计划', '整理书包', '管理时间', '今日目标', '自我管理', '独立完成', '主动帮忙', '好习惯养成'][i],
    seriesName: '我能行',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L5' as AgeStage, scene: '睡前故事',
    protagonist: ['小主人', '小客人', '小朋友', '小邻居', '小同学', '小伙伴', '小新生', '小队长'][i],
    theme: ['当小主人', '分享玩具', '主动说你好', '真诚道歉', '化解冲突', '理解朋友', '集体融入', '团队协作'][i],
    seriesName: '社交达人',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L5' as AgeStage, scene: '外出听听',
    protagonist: ['小书虫', '小诗人', '小画家', '小音乐家', '小舞蹈家', '小故事家', '小发明家', '小哲学家'][i],
    theme: ['三字经故事', '古诗意境', '成语故事', '民间传说', '历史小英雄', '中国神话', '传统美德', '文化精神'][i],
    seriesName: '中华文化',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    ageStage: 'L5' as AgeStage, scene: '亲子互动',
    protagonist: ['小创作家', '小导演', '小演员', '小作家', '小画家', '小设计师', '小建筑师', '小厨师'][i],
    theme: ['自编故事', '设计玩具', '想象城市', '角色扮演', '创意绘画', '发明创造', '梦想职业', '未来世界'][i],
    seriesName: '创意无限',
  })),
]

// ── 主函数 ──
async function main() {
  console.log(`🚀 开始批量生产，共 ${PRODUCTION_PLAN.length} 条故事`)
  console.log('━'.repeat(50))

  let success = 0, failed = 0, discarded = 0
  const results: any[] = []

  for (let i = 0; i < PRODUCTION_PLAN.length; i++) {
    const params = PRODUCTION_PLAN[i]
    console.log(`\n[${i + 1}/${PRODUCTION_PLAN.length}] ${params.ageStage} · ${params.scene} · ${params.protagonist}`)

    // Step 1: 生成脚本 + AI脚本审核
    const scriptResult = await auditWithRetry(
      () => generateStoryScript(params),
      async (s) => auditScript(s.script, s.age_range, s.word_count),
      3, 'batch'
    )

    if (!scriptResult.item) {
      console.log(`  ❌ 脚本生成失败 (${scriptResult.reason})`)
      discarded++
      continue
    }

    console.log(`  ✅ 脚本通过 (score: ${scriptResult.auditResult?.score}, retries: ${scriptResult.retries})`)

    // Step 2: TTS合成 + AI音频审核
    const audioResult = await auditWithRetry(
      async () => synthesizeStory(scriptResult.item!.script),
      async ({ report }) => auditAudio(scriptResult.item!.script, report, params.ageStage),
      3, 'batch'
    )

    if (!audioResult.item) {
      console.log(`  ❌ 音频合成失败 (${audioResult.reason})`)
      discarded++
      continue
    }

    console.log(`  ✅ 音频通过 (score: ${audioResult.auditResult?.score}, duration: ${audioResult.item.report.duration_sec}s)`)

    results.push({
      params,
      script: scriptResult.item,
      report: audioResult.item.report,
      status: 'pending_review',  // 等待人工审核
    })
    success++

    // 每50条保存一次进度
    if ((i + 1) % 50 === 0) {
      console.log('\n📊 阶段性保存...')
      await saveBatch(results.slice(-50))
    }

    // 间隔避免限速
    await new Promise(r => setTimeout(r, 800))
  }

  // 保存剩余
  if (results.length % 50 !== 0) {
    await saveBatch(results.slice(-(results.length % 50)))
  }

  console.log('\n' + '━'.repeat(50))
  console.log(`✅ 成功: ${success} 条`)
  console.log(`🗑️  丢弃: ${discarded} 条`)
  console.log(`📋 待人工审核: ${success} 条`)
  console.log('\n下一步：编辑在 Supabase 后台将 status 改为「已审核」后，运行音频上传脚本')
}

async function saveBatch(items: any[]) {
  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL === 'placeholder'
  if (isMock) {
    console.log(`  (Mock模式) 跳过数据库写入，${items.length} 条结果仅输出到控制台`)
    return
  }

  const { supabase } = require('./lib/supabase')
  const rows = items.map(item => ({
    story_json: item.script,
    status: item.status,
    created_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('story_scripts').insert(rows)
  if (error) console.error('写入失败:', error)
  else console.log(`  已写入 ${items.length} 条到 story_scripts 表`)
}

main().catch(console.error)
