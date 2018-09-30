const config = require('../config')
const crypto = require('crypto')
const API = require('../wechat/api')
const api = new API(config.wechat.appid, config.wechat.appsecret)

// 生成随机字符串
let createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
}
// 生成时间戳
let createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000) + '';
}
//对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1 = value1 & key2=value2…）拼接成字符串string
let raw = function (args) {
    let keys = Object.keys(args)
    keys = keys.sort()
    let string = ''
    keys.forEach(k => {
        string += '&' + k + '=' + args[k]
    })
    string = string.substr(1)
    return string
}
//生成签名
class Signature {
  static async sign (ctx) {
    const { jsapi_ticket } = await api.ensureTicket()
    let ret = {
      jsapi_ticket: jsapi_ticket,
      noncestr: createNonceStr(),
      timestamp: createTimestamp(),
      url: ctx.request.body.url
    }
    const string = raw(ret)
    let hash = crypto.createHash('sha1')
    hash.update(string)
    ret.signature = hash.digest('hex')
    ctx.response.body = ret
  }
}

module.exports = Signature
