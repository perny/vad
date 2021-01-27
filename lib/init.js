const {
  promisify
} = require('util')
const path = require('path')
const chalk = require('chalk')
const exists = require('fs').existsSync
const figlet = promisify(require('figlet')) //炫标题
const inquirer = require('inquirer')
const download = require('download-git-repo')
const ora = require('ora') //转圈提示
const logger = require("./logger")
const home = require('user-home');
const rm = require('rimraf').sync;
const clear = require('clear')
const shell = require('shelljs')
const generate = require('./generate')


module.exports = async (projectName) => {
  // 打印欢迎界面
  clear()
  const data = await figlet('Vad-cli Welcome')
  console.log(chalk.green(data))


  //目录是否存在
  const inPlace = !projectName || projectName === '.'
  const name = inPlace ? path.relative('../', process.cwd()) : projectName
  const to = path.resolve(projectName || '.')

  process.on('exit', () => {
    console.log()
  })

  if (inPlace || exists(to)) {
    inquirer.prompt([{
      type: 'confirm',
      message: inPlace ?
        '生成目标目录?' : `${projectName} directory exists. Continue?`,
      name: 'ok'
    }]).then(answers => {
      if (answers.ok) {
        if (shell.exec(`rm -rf ${name}`).code === 0) {
          run(name, to)
        }
      }
    }).catch(logger.fatal)
  } else {
    run(name, to)
  }
}

function run(projectFolder, targetDir){
  // 临时目录
  const tmp = path.join(home, '.h5_templates');

  const process = ora(`🚴downloading template`)
  process.start()
  // 如果有本地已经有模板就删除模板
  if (exists(tmp)) rm(tmp)
  download('direct:https://gitee.com/perny/h5-vue-boilerplate.git', tmp, {
    clone: true
  }, err => {
    process.stop()
    if (err) logger.fatal('Failed to download repo : ' + err.message.trim())

    inquirer.prompt([{
      type: 'confirm',
      message: 'Whether to download the webpack configuration',
      name: 'ok'
    }]).then(answers => {
      if (answers.ok) {
        // 下载webpack配置
        generate(projectFolder, tmp, targetDir, true, err => {
          if (err) logger.fatal(err)
          console.log()
          logger.success('Generated "%s".', projectFolder)
        })
      } else {
        // 不下载webpack配置
        generate(projectFolder, tmp, targetDir, false, err => {
          if (err) logger.fatal(err)
          console.log()
          logger.success('Generated "%s".', projectFolder)
        })
      }
    }).catch(logger.fatal)
  });
}