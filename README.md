# 美柚 AI讲故事 · meiyou-story

Next.js 14 + Tailwind + Supabase + 火山引擎声音复刻

## 本地运行

```bash
npm install
npm run dev
# 访问 http://localhost:3000
```

## 页面路由

| 路由 | 页面 |
|---|---|
| `/` | 精选首页（AI故事Banner + 月龄导航） |
| `/stories` | 故事列表（月龄Tab × 分类筛选，200条） |
| `/player/[id]` | 播放器（进度条 + 换声入口） |
| `/voice-clone` | 声音克隆完整流程（身份选择→录制→克隆→完成） |

## API

| 接口 | 说明 |
|---|---|
| `GET /api/stories` | 故事列表，支持 ?age=L1&category=cognition |
| `GET /api/stories?id=001` | 单条故事详情 |
| `POST /api/voice/clone` | 提交录音，触发声音克隆 |
| `GET /api/voice/status?speaker_id=xxx` | 查询克隆进度 |

## Mock 模式说明

未配置火山引擎 API Key 时自动走 Mock 模式：
- 声音克隆会返回 `S_mock_xxx` 格式的 speaker_id
- 前端完整流程（录制→处理→完成→跳转）可正常演示
- 实际克隆效果需要配置真实 Key

## 部署到自有服务器

```bash
npm run build

# 使用 standalone 模式
cp -r .next/standalone ./deploy
cp -r .next/static ./deploy/.next/static
cp -r public ./deploy/public

# 用 pm2 启动
pm2 start deploy/server.js --name meiyou-story

# nginx 配置（反向代理到 3000 端口）
# server {
#   listen 80;
#   server_name your-domain.com;
#   location / {
#     proxy_pass http://localhost:3000;
#     proxy_set_header Host $host;
#   }
# }
```

## 数据库表（Supabase）

项目使用工作流已创建的表，无需额外建表：
- `story_production_plan` — 工作流1写入
- `story_scripts` — 工作流2写入
- `story_audio` — 工作流3写入，前端读取已入库音频
- `user_voice_packages` — 声音克隆结果
- `story_audio_replaced` — 换声后的音频

## 待接入

- [ ] 火山引擎 TTS v1 换声合成（需单独开通服务）
- [ ] 用户登录鉴权（当前 userId 为硬编码 demo 值）
- [ ] 付费会员状态校验（当前前端 mock 会员状态）
- [ ] 定制故事前端交互流程（工作流2已就绪，前端入口待开发）
