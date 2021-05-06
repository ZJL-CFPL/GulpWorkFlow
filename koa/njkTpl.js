const nunjucks = require('nunjucks')

const createEnv = (
  path,
  opts = {
    autoescape: true,
    noCache: false,
    watch: false,
    throwOnUndefined: false,
    filter: undefined
  }
) => {
  const { noCache, watch, autoescape, throwOnUndefined, filter } = opts
  let env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(path, {
      noCache: noCache,
      watch: watch
    }),
    {
      autoescape: autoescape,
      throwOnUndefined: throwOnUndefined
    }
  )
  if (filter) {
    for (let f in filter) {
      env.addFilter(f, filter[f])
    }
  }
  return env
}

const template = (path, opts) => {
  let env = createEnv(path, opts)
  return async (ctx, next) => {
    ctx.render = (view, model) => {
      ctx.response.body = env.render(
        view,
        Object.assign({}, ctx.state || {}, model || {})
      )
      ctx.response.type = 'text/html'
    }
    await next()
  }
}

module.exports = template
