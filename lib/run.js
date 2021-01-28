const path = require('path');
const exists = require('fs').existsSync
const {
  syncSpawn
} = require('../util')
const { fatal, success } = require('./logger');


module.exports = async (projectName) => {
  //目录是否存在
  const inPlace = !projectName || projectName === '.'
  //const name = inPlace ? path.relative('../', process.cwd()) : projectName
  const to = path.resolve(projectName || '.')

  if (inPlace || exists(to)) {
    if (exists(to+'/package.json')) {
      // 安装依赖 npm i
      await syncSpawn('npm', ['run', 'dev'], {
        cwd: to
      }).then(() => {
        success(`Project run successed`)
      })
    } else {
      fatal(`Not found package.json file`)
    }
    
  } else {
    fatal(`Not found ${projectName} folder`)
  }
  
}