const chalk = require('chalk') // 粉笔
const {
  syncSpawn
} = require('../util')
const log = content => console.log(chalk.green(content)) // 包装一个自己的log函数

module.exports = async () => {
  await syncSpawn('npm', ['run', 'dev'])
    .then(() => {
      log('运行项目成功')
    })
}