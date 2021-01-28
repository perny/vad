const {
  promisify
} = require('util')
const {
  spawn
} = require('child_process')
const {
  log
} = require('console')

const clone = async function (repo, desc) {
  const download = promisify(require('download-git-repo'))
  const ora = require('ora') //转圈提示
  const process = ora(`🚴下载...${repo}`)
  process.start()
  await download(repo, desc, {
    clone: true
  })
  process.succeed()
}



const syncSpawn = async (cmd, args, options) => {
  if (process.platform === 'win32') {
    //console.log('win32')

    // options.cmd = options.cwd
    // delete options.cwd
    // 设置 shell 选项为 true 以隐式地调用 cmd 
    options.shell = true
  } else {
    //console.log('Linux/Unix')
  }

  return new Promise(resolve => {
    //子进程流
    const proc = spawn(
      cmd,
      args,
      Object.assign(
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
        },
        options
      )
    )

    proc.on('exit', () => {
      resolve()
    })
  })

}
module.exports = {
  syncSpawn,
  clone
}
// process.nextTick( async () => {
//     const ret = await syncSpawn('ls',{cwd: './__tests__'})
//     console.log('返回值....',ret)
// })