const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.join(__dirname, '..')
const apiPath = path.join(root, 'app', 'api')
const backupPath = path.join(root, 'app', '_api_disabled')

function moveApiAside() {
  if (fs.existsSync(apiPath)) {
    fs.renameSync(apiPath, backupPath)
  }
}

function restoreApi() {
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, apiPath)
  }
}

const PREVIEW_HOME = '/meiyou-story-18-2/ai-stories/home/'

function writeRootRedirect() {
  const indexPath = path.join(root, 'out', 'index.html')
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=${PREVIEW_HOME}" />
  <title>AI亲声讲 · 美柚</title>
  <script>location.replace('${PREVIEW_HOME}')</script>
</head>
<body>
  <p>正在打开 <a href="${PREVIEW_HOME}">AI亲声讲</a>…</p>
</body>
</html>
`
  fs.writeFileSync(indexPath, html, 'utf8')
}

moveApiAside()
try {
  execSync('next build', {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, GITHUB_PAGES: 'true' },
  })
  writeRootRedirect()
} finally {
  restoreApi()
}
