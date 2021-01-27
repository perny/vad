const Metalsmith = require('metalsmith');
const chalk = require('chalk');
const path = require('path');
const Handlebars = require('handlebars');
const render = require('consolidate').handlebars.render;
const getOptions = require('./options');
const ask = require('./ask');
const async = require('async');
const filter = require('./filter');
const logger = require('./logger')

// 注册条件语句
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  return a === b ?
    opts.fn(this) :
    opts.inverse(this)
})

module.exports = function generate(name, src, dest, isDownConfig, done) {
  const opts = getOptions(name, src)
  const metalsmith = Metalsmith(path.join(src, 'template'));
  const matedate = metalsmith.metadata();
  
  const data = Object.assign(matedate, {
    destDirName: name,
    inPlace: dest === process.cwd(),
    noEscape: true,
    isAlone: isDownConfig
  })

  metalsmith.use(askQuestions(opts.prompts))
    .use(filterFiles(opts.filters))
    .use(renderTemplateFiles(opts.skipInterpolation))


  metalsmith.clean(false)
    .source(isDownConfig ? '.' : './src') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .destination(dest)
    .build((err, files) => {
      done(err)
      if (typeof opts.complete === 'function') {
        const helpers = {
          chalk,
          //logger,
          //files
        }
        opts.complete(data, helpers)
      } else {
        logMessage(opts.completeMessage, data)
      }
    })

  return data
}

//创建一个问问题的中间件
function askQuestions(prompts) {
  return (files, metalsmith, done) => {
    ask(prompts, metalsmith.metadata(), done)
  }
}

//创建文件过滤中间件
function filterFiles(filters) {
  return (files, metalsmith, done) => {
    filter(files, filters, metalsmith.metadata(), done)
  }
}

// 模板替换中间件
function renderTemplateFiles(skipInterpolation) {
  skipInterpolation = typeof skipInterpolation === 'string' ? [skipInterpolation] :
    skipInterpolation
  return (files, metalsmith, done) => {
    const keys = Object.keys(files)
    const metalsmithMetadata = metalsmith.metadata()
    async.each(keys, (file, next) => {
      // skipping files with skipInterpolation option
      if (skipInterpolation && multimatch([file], skipInterpolation, {
          dot: true
        }).length) {
        return next()
      }
      const str = files[file].contents.toString()
      // do not attempt to render files that do not have mustaches
      if (!/{{([^{}]+)}}/g.test(str)) {
        return next()
      }
      render(str, metalsmithMetadata, (err, res) => {
        if (err) {
          err.message = `[${file}] ${err.message}`
          return next(err)
        }
        files[file].contents = new Buffer(res)
        next()
      })
    }, done)
  }
}

// 显示模板信息
function logMessage(message, data) {
  if (!message) return
  render(message, data, (err, res) => {
    if (err) {
      console.error('\n   Error when rendering template complete message: ' + err.message.trim())
    } else {
      console.log('\n' + res.split(/\r?\n/g).map(line => '   ' + line).join('\n'))
    }
  })
}