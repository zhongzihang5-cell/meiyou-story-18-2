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

moveApiAside()
try {
  execSync('next build', {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, GITHUB_PAGES: 'true' },
  })
} finally {
  restoreApi()
}
