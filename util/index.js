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



const syncSpawn = async (...args) => {
  const options = args[args.length - 1]
  if (process.platform === 'win32') {
    console.log('win32')

    // options.cmd = options.cwd
    // delete options.cwd
    // 设置 shell 选项为 true 以隐式地调用 cmd 
    options.shell = true
  } else {
    console.log('Linux/Unix')
  }

  return new Promise(resolve => {
    log('args', ...args)
    const proc = spawn(...args)
    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)
    proc.on('close', () => {
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