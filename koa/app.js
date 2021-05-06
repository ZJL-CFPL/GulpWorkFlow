const path = require('path')
const Koa = require('koa')
const logger = require('koa-logger')
const koaBody = require('koa-body')
const request = require('request')
const koaStatic = require('koa-static')
const Router = require('koa-router')
const onerror = require('koa-onerror')
const app = new Koa()
// 统一错误处理
// onerror(app)

const views = require('./njkTpl')

const project = process.env.PROJ_NAME
const static_prefix = process.env.STATIC_PREFIX || ''

app.use(logger())
app.use(koaBody())
app.use(
  views(path.join(__dirname, `../src`), {
    multipart:true,
    noCache: true,
    watch: true
  })
)

const router = new Router()

router.get('/', ctx => {
  // throw new Error(121)
  ctx.render(`${project}/index.html`)
})
// API代理
router.all('/proxy', async (ctx, next) => {
  let { url } = ctx.query
  const { method } = ctx.request
  let reqBody = null
  if (method == 'GET') {
    const query = []
    for (const key in ctx.query) {
      if (key != 'url') {
        query.push(`${key}=${ctx.query[key]}`)
      }
    }
    await new Promise((resolve, reject) => {
      request.get({ url: `${url}?${query.join('&')}` }, (err, res, body) => {
        if (err) {
          reqBody = {
            code: -1,
            err: err
          }
          reject()
        } else {
          reqBody = body
          resolve()
        }
      })
    })
  } else {
    const body = ctx.request.body
    await new Promise((resolve, reject) => {
      request.post(
        {
          url,
          formData: body,
          headers: { 'Auth-User': ctx.request.headers['auth-user'] }
        },
        (err, res, body) => {
          if (err) {
            reqBody = {
              code: -1,
              err: err
            }
            reject()
          } else {
            reqBody = body
            resolve()
          }
        }
      )
    })
  }
  ctx.body = reqBody
})

router.get('/:pathname', (ctx, next) => {
  let pathname = ctx.params.pathname
  let extName = pathname.replace(/^.*?(\..*?)$/, '$1')
  if (extName) {
    if (extName === '.html') {
      ctx.render(`${project}/${pathname}`)
    }
  } else {
    pathname += '.html'
    ctx.render(`${project}/${pathname}`)
  }
  next()
})

app.use(router.routes())

app.use(koaStatic(path.join(__dirname, `../src/${project}`)))
app.use(koaStatic(path.join(__dirname, '../src/_lib')))

module.exports = app
