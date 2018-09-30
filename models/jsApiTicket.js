const mongoose = require('mongoose')
const schema = mongoose.Schema

//jsapi_ticket用于微信jssdk接口
const jsApiTicket = new schema({
  expireTime: Number, //过期时间
  jsapi_ticket: String //access_token
})

module.exports = mongoose.model('jsApiTicket', jsApiTicket)