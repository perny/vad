const chalk = require('chalk')
const format = require('util').format

const sep = chalk.gray('·')
const prefix = '   h5-cli'


module.exports = {
  log(...args) {
    const msg = format.apply(format, args)
    console.log(chalk.white(prefix), sep, msg)
  },
  fatal(...args) {
    if (args[0] instanceof Error) args[0] = args[0].message.trim()
    const msg = format.apply(format, args)
    console.error(chalk.red(prefix), sep, msg)
    process.exit(1)
  },
  success(...args) {
    const msg = format.apply(format, args)
    console.log(chalk.green(prefix), sep, msg)
  }
}