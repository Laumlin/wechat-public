const config = require('../config')
const axios = require('axios')
const API = require('../wechat/api')
const api = new API(config.wechat.appid, config.wechat.appsecret)
class UserInfo {
  // 获取用户是否已经关注当前公众号 https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140839
    static async getUserInfo (ctx) {
    const {openid} = ctx.request.body
    const { accessToken } = await api.ensureAccessToken()
    const response = await axios.get(`${api.prefix}user/info?access_token=${accessToken}&openid=${openid}&lang=zh_CN`)
    ctx.response.body = response.data
  }
}
module.exports = UserInfo