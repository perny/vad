const {
  syncSpawn
} = require('../util')

module.exports = async () => {
  // 安装依赖 npm i 
  log('安装依赖')
  await syncSpawn('npm', ['install'], {
    cwd: `src/${name}`
  })
  log(`
👌安装完成：
To get Start:
===========================
    cd ${name}
    npm run serve
===========================
  `)
}