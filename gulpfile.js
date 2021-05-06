'use strict'
const moment = require('moment')
const path = require('path')
const fs = require('fs')
const clc = require('cli-color')
// const moment = require('moment')
const argv = require('yargs').argv
// const { port } = require('./config/index')
const gulp = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')

const browserSync = require('browser-sync') // 浏览器自动刷新插件
const $G = gulpLoadPlugins() // 自动加载已安装gulp插件
const gulpConfig = require('./.gulp_config.json')
let proj_name = gulpConfig.project
let proj_conf = {}
function readProj() {
  if (argv.project && proj_name !== argv.project) {
    proj_name = argv.project
    modConfig(proj_name)
  }
  if (fs.existsSync(path.join(__dirname,`./src/${proj_name}/_config.js`))) {
    proj_conf = require(`./src/${proj_name}/_config`) || {}
  }
  // console.log(proj_conf)
  console.log(clc.yellow('当前项目:'), clc.blue.underline(proj_name))
  return proj_name
}
readProj()
function modConfig(proj) {
  gulpConfig.project = proj
  fs.writeFileSync(
    path.join(__dirname, './.gulp_config.json'),
    JSON.stringify(gulpConfig, null, 2)
  )
  console.log(clc.yellow('当前项目已切换到:'), clc.blue.underline(proj))
}
gulp.task('set_proj', () => {})
/**
 * 初始化项目目录
 */
gulp.task('init_project', ['_init_p', 'server'])
gulp.task('_init_p', () => {
  const project_name = argv.project
  if (!project_name) {
    throw new Error(clc.red('！没有定义要初始化的项目参数！'))
  }
  console.log(`初始化项目:  ${project_name}`)
  const dirs = ['css', 'scss', 'img', 'maps', 'fonts', 'js']
  let project_src_path = path.join(__dirname, `./src/${project_name}`)
  let project_build_path = path.join(__dirname, `./src/${project_name}`)
  if (fs.existsSync(project_src_path) || fs.existsSync(project_build_path)) {
    throw new Error('！此项目文件夹已经存在,请直接启动项目！')
  }
  // 如果未创建build文件夹，创建build文件夹
  // if (!fs.existsSync(path.join(__dirname, './build'))) {
  //   fs.mkdirSync(path.join(__dirname, './build'))
  // }
  fs.mkdirSync(path.join(__dirname, `./src/${project_name}`))
  // fs.mkdirSync(path.join(__dirname, `./build/${project_name}`))

  dirs.forEach(dir => {
    fs.mkdirSync(path.join(__dirname, `./src/${project_name}/${dir}`))
    console.log(`create static dir: ${dir}`)
  })
  fs.writeFileSync(
    path.join(__dirname, `./src/${project_name}/index.html`),
    '{% extends "../_njk/base.njk" %}'
  )
  fs.writeFileSync(
    path.join(__dirname, `./src/${project_name}/scss/style.scss`),
    '@charset "utf-8";'
  )
  console.log('初始化完成: ' + path.join(__dirname, `./src/${project_name}`))
  // 修改gulp项目配置文件
  modConfig(project_name)
})
/**
 * 帮助命令
 */
gulp.task('_help', () => {
  const help = [
    '_help                          ||    查看帮助',
    'init_project                   ||    初始化项目',
    'server                         ||    启动服务器',
    'distBuild                      ||    打包静态版本',
    'distZip                        ||    打包并压缩静态版本',
    '* --project=[Project Name]     ||    启动对应项目',
    '* --port=[Port Num]            ||    服务器端口，默认3000端口',
    '* --protocol=https             ||    使用https协议测试项目，默认http'
  ]
  help.forEach((str, i) => {
    let s = str.split(' || ')
    console.log(i + 1 + '.', clc.blue(s[0]), '\t===>\t', clc.yellowBright(s[1]))
  })
})

/**
 * 根据项目启动服务器
 */
gulp.task('server', ['nodemon'], () => {
  const project = `./src/${proj_name}`
  const scss_server_path = `${project}/scss/**/*.scss`
  const html_server_path = [`${project}/**/*.html`, './src/_njk/*.njk']
  let { port = 3000, protocol = 'http' } = argv

  browserSync.init({
    // server: {
    //   baseDir: path.join(__dirname, project)
    // },
    proxy: `${protocol == 'https' ? 'https' : 'http'}://localhost:${port}`,
    ui: {
      port: port + 2,
      weinre: {
        port: port + 3
      }
    },
    notify: false,
    // directory: true,
    port: port + 1,
    open: 'external'
  })
  gulp.watch(scss_server_path, ['scss'])
  gulp.watch(html_server_path).on('change', browserSync.reload)
})
gulp.task('default', ['server'])
/**
 * 启动本地服务器
 */
gulp.task('nodemon', callback => {
  const project = proj_name
  let called = false
  let { port = 3000, protocol = 'http' } = argv

  $G.nodemon({
    script: './bin/www',
    ext: 'js',
    ignore: ['src', 'bulid', 'lib'], // 静态资源修改不重启服务器
    env: { port, protocol, NODE_ENV: 'development', PROJ_NAME: project,STATIC_PREFIX:proj_conf.static_prefix }
  }).on('start', () => {
    if (!called) {
      called = true
      callback()
    }
  })
})
/**
 * scss 编译
 */
gulp.task('scss', () => {
  const project = proj_name
  let scss_src_path = [
    `./src/${project}/scss/*.scss`,
    `!./src/${project}/scss/_*.scss`
  ]
  let scss_changed_path = `./src/${project}/css`
  let scss_maps_path = './maps'
  let scss_dist_path = `./src/${project}/`
  gulp
    .src(scss_src_path)
    .pipe($G.changed(scss_changed_path, { extension: '.css' }))
    .pipe($G.sourcemaps.init())
    .pipe($G.sass.sync({ outputStyle: 'expanded' }))
    .on('error', $G.sass.logError)
    .pipe(
      $G.autoprefixer({
        browsers: [
          'last 2 version',
          'Firefox >= 20',
          'safari 5',
          'ie 8',
          'ie 9',
          'opera 12.1',
          'iOS 7',
          '> 5%',
          'ios 6',
          'android 4'
        ],
        cascade: true, //是否美化属性值
        remove: true //是否去掉不必要的前缀
      })
    )
    .pipe($G.cssnano())
    .pipe(
      $G.rename({
        dirname: 'css',
        suffix: '.min'
      })
    )
    .pipe($G.sourcemaps.write(scss_maps_path))
    .pipe(gulp.dest(scss_dist_path, { mode: '0777' }))
    .pipe(browserSync.stream())
})

/**=============**
 * BUILD PART    *
 **=============**/
// 清空项目文件夹
gulp.task('clean', () => {
  const project = proj_name
  if (fs.existsSync(path.join(__dirname, `./src/${project}`)))
    return gulp
      .src([`./build/${project}/*`, `!./build/${project}/version`])
      .pipe($G.clean({ force: true }))
})
// 拷贝其他静态资源文件，
gulp.task('staticCopy', ['clean'], () => {
  const project = proj_name
  const src_copy_path = `./src/${project}/{css,js,img,fonts,mp3,video,audio,common}/**/*`
  const src_dist_path = `./build/${project}/`
  return gulp.src(src_copy_path).pipe(gulp.dest(src_dist_path))
})

// js编译压缩
gulp.task('jsBuild', ['clean'], () => {
  const project = proj_name
  return (
    gulp
      .src(`src/${project}/js/*.js`)
      // .pipe($G.babel())
      .pipe(
        $G.uglify({
          compress: {
            drop_console: true // 去调console调试命令
          }
        })
      )
      .pipe(
        $G.rename({
          dirname: 'js',
          suffix: ''
        })
      )
      .pipe(gulp.dest(`build/${project}`, { mode: '0777' }))
  )
})
// scss编译压缩
gulp.task('cssBuild', ['clean'], () => {
  const project = proj_name
  const scss_src_path = [
    `src/${project}/scss/*.scss`,
    `!src/${project}/scss/_*.scss`
  ]
  const scss_dist_path = `build/${project}`
  return gulp
    .src(scss_src_path)
    .pipe($G.sass.sync({ outputStyle: 'expanded' }))
    .on('error', $G.sass.logError)
    .pipe(
      $G.autoprefixer({
        browsers: [
          'last 2 version',
          'Firefox >= 20',
          'safari 5',
          'ie 8',
          'ie 9',
          'opera 12.1',
          'iOS 7',
          '> 5%',
          'ios 6',
          'android 4'
        ],
        cascade: true, //是否美化属性值
        remove: true //是否去掉不必要的前缀
      })
    )
    .pipe($G.cssnano())
    .pipe(
      $G.rename({
        dirname: 'css',
        suffix: '.min'
      })
    )
    .pipe(gulp.dest(scss_dist_path, { mode: '0777' }))
})

// htmlBeautify的可配置参数，注释部分为配置项默认值
const htmlBeautifyOptions = {
  // indent_level: 0,
  // indent_with_tabs: false,
  // max_preserve_newlines: 10,
  // jslint_happy: false,
  // space_after_anon_function: false,
  // brace_style: 'collapse',
  // keep_array_indentation: false,
  // keep_function_indentation: false,
  // space_before_conditional: true,
  // break_chained_methods: false,
  // eval_code: false,
  // unescape_strings: false,
  // wrap_line_length: 0,
  // wrap_attributes: 'auto',
  // wrap_attributes_indent_size: 4,
  // end_with_newline: false,
  unformatted: true,
  indent_size: 2, // 缩进空格
  indent_char: ' ',
  extra_liners: []
  // preserve_newlines: false
}
// 用 /(['"])[^'"]*\1/ 可以匹配闭合起来的单双引号，即左引号和右引号须保持一致
// 正则表达式中 \1 匹配的是第一个带圆括号的子表达式所匹配的模式 以此类推
// const srcRegExp = /src=(['"])[^'"]*\1/gim // 匹配src属性 e.g. src="..."
// const linkRegExp = /<link.*?href=(['"])[^'"]*\1.*?>/gim // 匹配 link标签 的 href属性
// const bgUrlRegExp = /url\((['"])[^'"]*\1/gim // 匹配内联样式中的 url 属性
/**
 * 替换静态资源路径
 * @param {string} str 包含静态资源地址的字符串
 */
// function replaceStaticPath(str) {
//   console.log(str)
//   // 包含http字符的跳过，所以如果是本地资源请不要在路径中使用http
//   if (str.indexOf('http') > -1 || !/["']\/public\//.test(str)) {
//     return str
//   } else {
//     return str.replace(/\/public\//, '../static/')
//   }
// }
// // njk模板编译html静态文件
gulp.task('njk', ['clean'], () => {
  const project = proj_name
  const njk_src_path = [`src/${project}/*.html`]
  const njk_dist_path = `build/${project}/`
  return (
    gulp
      .src(njk_src_path)
      .pipe(
        $G.nunjucksRender({
          path: [`src/${proj_name}/`, 'src/_njk']
        })
      )
      // 替换html里的特殊代码块，这里用于替换公共库代码代码
      // .pipe(
      //   $G.useref({
      //     noAssets: true
      //   })
      // )
      // html 结构格式化 先格式化代码可以降低替换路径的正则匹配复杂度，
      // 比如: 去除html属性的不必要空格空行，去除不正确换行的
      .pipe($G.htmlBeautify(htmlBeautifyOptions))
      .pipe(gulp.dest(njk_dist_path, { mode: '0777' }))
  )
})

// // 将dist文件夹内的内容打包成一个zip包
gulp.task('distZip', ['distBuild'], () => {
  const project = proj_name
  const dateTime = moment().format('YYYYMMDD')
  const zipName = `${dateTime}_limei_${project}.zip`
  gulp
    .src([`build/${project}/**/*.*`, `!build/${project}/version/*.*`])
    .pipe($G.zip(zipName))
    .pipe(gulp.dest(`./build/${project}/version`))

  console.log(
    '\t文件打包目录: ',
    path.join(__dirname, `./build/${project}/version/${zipName}`)
  )
})
gulp.task('distBuild', ['staticCopy', 'njk'])

gulp.task('imageMin', function() {
  const project = proj_name
  gulp
    .src(`src/${project}/img/**/*.{png,jpg,gif,ico}`)
    .pipe($G.imagemin())
    .pipe(gulp.dest(`src/${project}/_imgmin`))
})
