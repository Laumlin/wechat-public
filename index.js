const Koa = require('koa')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const config = require('./config')
const wechat = require('./wechat/wechat')
const API = require('./wechat/api')
const menu = require('./wechat/menu')
const router = require('./router')
const app = new Koa()

app.use(logger())
app.use(bodyParser())

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
