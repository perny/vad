const exists = require('fs').existsSync
const path = require('path');
const getGitUser = require('./git-user')
const validate = require('validate-npm-package-name')

module.exports = function options(name, dir) {
  const opts = getMetadata(dir)
  // 补充默认选项
  setDefault(opts, 'name', name)
  // 校验项目name是否符合npm包的规则
  setValidateName(opts)
  // 获取git用户
  const author = getGitUser()
  if (author) {
    setDefault(opts, 'author', author)
  }

  return opts
}


function getMetadata(dir) {
  const js = path.join(dir, 'ask.js');
  let opts = {}
  
  if (exists(js)) {
    const req = require(path.resolve(js))
    if (req !== Object(req)) {
      throw new Error('ask.js needs to expose an object')
    }
    opts = req
  }

  

  return opts
}


function setDefault(opts, key, val) {
  if (opts.schema) {
    opts.prompts = opts.schema
    delete opts.schema
  }
  const prompts = opts.prompts || (opts.prompts = {})
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      'type': 'string',
      'default': val
    }
  } else {
    prompts[key]['default'] = val
  }
}


function setValidateName(opts) {
  const name = opts.prompts.name
  const customValidate = name.validate
  name.validate = name => {
    const its = validate(name)
    if (!its.validForNewPackages) {
      const errors = (its.errors || []).concat(its.warnings || [])
      return 'Sorry, ' + errors.join(' and ') + '.'
    }
    if (typeof customValidate === 'function') return customValidate(name)
    return true
  }
}