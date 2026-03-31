/** 识字分类：列表卡片底色 + 详情页强调色（与全局 #FBF7FF / 紫粉系协调） */
export type LiteracyTheme = {
  cardBg: string
  accent: string
  accentMuted: string
}

export const LITERACY_CATEGORIES: Array<{
  id: string
  title: string
  emoji: string
} & LiteracyTheme> = [
  { id: 'toys', title: '玩具', emoji: '🪀', cardBg: '#EDE7F6', accent: '#5E35B1', accentMuted: '#9575CD' },
  { id: 'shapes', title: '形状', emoji: '🟥', cardBg: '#E3F2FD', accent: '#1565C0', accentMuted: '#42A5F5' },
  { id: 'clothes', title: '衣帽', emoji: '👕', cardBg: '#FCE4EC', accent: '#C2185B', accentMuted: '#F48FB1' },
  { id: 'sports', title: '运动', emoji: '🏀', cardBg: '#FFF3E0', accent: '#E65100', accentMuted: '#FFB74D' },
  { id: 'actions', title: '动作', emoji: '🤸', cardBg: '#E8F5E9', accent: '#2E7D32', accentMuted: '#81C784' },
  { id: 'body', title: '身体', emoji: '🧑', cardBg: '#F3E5F5', accent: '#7B1FA2', accentMuted: '#CE93D8' },
  { id: 'nature', title: '大自然', emoji: '🌳', cardBg: '#E0F2F1', accent: '#00695C', accentMuted: '#4DB6AC' },
  { id: 'transport', title: '交通工具', emoji: '🚌', cardBg: '#E8EAF6', accent: '#3949AB', accentMuted: '#7986CB' },
  { id: 'food', title: '食物', emoji: '🍯', cardBg: '#FFF8E1', accent: '#F57F17', accentMuted: '#FFD54F' },
  { id: 'home', title: '家', emoji: '🏠', cardBg: '#FFEBEE', accent: '#C62828', accentMuted: '#EF9A9A' },
  { id: 'places', title: '地点', emoji: '🗺️', cardBg: '#E1F5FE', accent: '#0277BD', accentMuted: '#4FC3F7' },
  { id: 'jobs', title: '职业', emoji: '👨‍✈️', cardBg: '#F1F8E9', accent: '#558B2F', accentMuted: '#AED581' },
  { id: 'animals', title: '动物', emoji: '🐘', cardBg: '#FFF9C4', accent: '#F9A825', accentMuted: '#FFEE58' },
  { id: 'colors', title: '颜色', emoji: '🎨', cardBg: '#F3E5F5', accent: '#8E24AA', accentMuted: '#BA68C8' },
  { id: 'numbers', title: '数字', emoji: '🔢', cardBg: '#ECEFF1', accent: '#455A64', accentMuted: '#90A4AE' },
  { id: 'fruits', title: '水果', emoji: '🍎', cardBg: '#FFCDD2', accent: '#D32F2F', accentMuted: '#E57373' },
  { id: 'weather', title: '天气', emoji: '⛅', cardBg: '#B3E5FC', accent: '#0277BD', accentMuted: '#81D4FA' },
  { id: 'school', title: '学校', emoji: '📚', cardBg: '#D1C4E9', accent: '#512DA8', accentMuted: '#9575CD' },
]

const DEFAULT_THEME: LiteracyTheme = {
  cardBg: '#EDE7F6',
  accent: '#E91E63',
  accentMuted: '#B0A0C8',
}

export function getLiteracyTheme(id: string): LiteracyTheme {
  const row = LITERACY_CATEGORIES.find(c => c.id === id)
  if (!row) return DEFAULT_THEME
  return { cardBg: row.cardBg, accent: row.accent, accentMuted: row.accentMuted }
}
