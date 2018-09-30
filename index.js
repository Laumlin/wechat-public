const Koa = require('koa')
const cors = require('koa2-cors')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const config = require('./config')
const wechat = require('./wechat/wechat')
const API = require('./wechat/api')
const menu = require('./wechat/menu')
const initCreateQr = require('middlewares/initCreateQr')
const router = require('./router')
const app = new Koa()

app.use(logger())
app.use(bodyParser())
const whitelist = ['http://domain1', 'http://domain2']
const devWhiteList = ['http://m.localhost.net.cn:3000', 'http://localhost:8000']
function checkOriginAgainstWhitelist(ctx) {
  // https://madole.xyz/whitelisting-multiple-domains-with-kcors-in-koa/
  const requestOrigin = ctx.accept.headers.origin
  if (whitelist.includes(requestOrigin) || devWhiteList.includes(requestOrigin)) {
    return requestOrigin
  }
  return false
}
app.use(cors({
  origin: checkOriginAgainstWhitelist
}))

const mongoose = require('mongoose')

const mongoUrl = `mongodb://${ config.mongodb.host }:${ config.mongodb.port }/${ config.mongodb.database }`
mongoose.Promise = global.Promise;
mongoose.connect(mongoUrl, {useNewUrlParser:true})
const db = mongoose.connection
db.on('error', () => {
    console.log('数据库连接出错!')
})
db.once('open', () => {
    console.log('数据库连接成功！')
})

const api = new API(config.wechat.appid, config.wechat.appsecret)

//创建自定义菜单
const createMenu = async () => {
  const result = await api.createMenu(menu)
  console.log(result)
}
createMenu()

//生成带参数二维码
const createQr = async (ctx) => {
  await initCreateQr('invite_award')
  await initCreateQr('register_award')
  await initCreateQr('share_award')
  await initCreateQr('detail_award')
}
createQr()

app.use(wechat(config, async (message, ctx) => {
  // TODO

  // examples
  if (message.MsgType === 'event' && message.Event === 'subscribe') {
    return '感谢您关注DataHubWiki数据维基'
  } else if (message.Content === '音乐') {
    return {
      type: 'music',
      content: {
        title: 'Lemon Tree',
        description: 'Lemon Tree',
        musicUrl: 'http://mp3.com/xx.mp3',
      },
    }
  } else if (message.MsgType === 'text') {
    return message.Content
  } else if (message.MsgType === 'image') {
    return {
      type: 'image',
      content: {
        mediaId: message.MediaId
      },
    }
  } else if (message.MsgType === 'voice') {
    return {
      type: 'voice',
      content: {
        mediaId: message.MediaId
      },
    }
  } else if (message.MsgType === 'event' && message.Event === 'VIEW') {
    
  }
  else {
    return '你说什么？'
  }
}))

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8080, () => {
	console.log('The server is running at http://localhost:8080')
})
