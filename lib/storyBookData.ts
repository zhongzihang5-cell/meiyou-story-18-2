import type { StoryPage } from '@/components/FlipBook'

/** 声音册翻页故事 · 可在本文件改文案/条数 */
export const STORY_BOOK_PAGES: StoryPage[] = [
  {
    id: 'today',
    date: '2026年4月29日',
    dateLabel: '今天 · 周二',
    emoji: '📚',
    title: '小布的图书首页',
    preview: '翻开这本属于小布的睡前故事书，记录每一晚的温柔声音与冒险想象。',
    color: '#fff7ef',
    accent: '#ff8a65',
    hasStory: true,
  },
  {
    id: '2026-04-27',
    date: '2026年4月27日',
    dateLabel: '周日',
    emoji: '🦕',
    title: '小布和恐龙朋友的秘密花园',
    preview:
      '在一个谁也不知道的地方，住着一只会说话的小恐龙，它等小布很久了……那天晚上，小布悄悄推开了花园的小门。',
    color: '#f0faf4',
    accent: '#6ab04c',
    hasStory: true,
  },
  {
    id: '2026-04-25',
    date: '2026年4月25日',
    dateLabel: '周五',
    emoji: '⚡',
    title: '奥特曼帮小布战胜睡前怪兽',
    preview:
      '每天晚上关灯后，床底下总会出现一个小怪兽。但今晚，奥特曼叔叔悄悄来到了小布的枕边……',
    color: '#eef5ff',
    accent: '#378ADD',
    hasStory: true,
  },
  {
    id: '2026-04-22',
    date: '2026年4月22日',
    dateLabel: '周二',
    emoji: '🌙',
    title: '月亮上的小白兔找到了家',
    preview: '小白兔坐在月亮上，想找一个温暖的家。它往下看，看到了小布家透出的那盏灯……',
    color: '#f8f0ff',
    accent: '#9c6dd8',
    hasStory: true,
  },
]
