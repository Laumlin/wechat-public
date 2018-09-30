const axios = require('axios')
const AccessToken = require('../models/accessToken')
const JsApiTicket = require('../models/jsApiTicket')

class API {
  constructor(appid, appsecret) {
    this.appid = appid
    this.appsecret = appsecret
    this.prefix = 'https://api.weixin.qq.com/cgi-bin/'
    this.qrUrl = 'https://mp.weixin.qq.com/cgi-bin/'

    /**
     * access_token有效时间2小时,未过期时间内重新获取导致前一个失效,调用频次限制每日2000次
     * jsapi_ticket有效时间2小时,未过期时间内重新获取导致前一个失效,调用频次限制每日2000次
     */

    /**
     * 储存token到数据库
     * @param {json} token
     */
    this.saveToken = async function (token) {
      let Token = new AccessToken(token)
      await Token.save().catch(err => console.error('服务器内部错误--存入access_token出错！具体错误信息：', err))
    }
    // 从数据库获取token
    this.getToken = async function () {
      let token = await AccessToken.findOne().exec().catch(err => console.error('服务器内部错误--查询access_token出错！具体错误信息：', err))
      return token
    }

    // 储存ticket到数据库
    this.saveTicket = async function (ticket) {
      let Ticket = new JsApiTicket(ticket)
      await Ticket.save().catch(err => console.error('服务器内部错误--存入jsapi_ticket出错！具体错误信息：', err))
    }
    // 从数据库获取ticket
    this.getTicket = async function () {
      let ticket = await JsApiTicket.findOne().exec().catch(err => console.error('服务器内部错误--查询jsapi_ticket出错！具体错误信息：', err))
      return ticket
    }
  }


  /**
   * 获取AccessToken
   * @returns {object} token
   */
  async getAccessToken() {
    let token = {}
    const response = await axios.get(`${this.prefix}token?grant_type=client_credential&appid=${this.appid}&secret=${this.appsecret}`)

    // 过期时间，因网络延迟等，将实际过期时间提前20秒，以防止临界点
    const expireTime = Date.now() + (response.data.expires_in - 20) * 1000
    token.accessToken = response.data.access_token
    token.expireTime = expireTime
    await this.saveToken(token)
    return token
  }

  /**
   * 返回AccessToken
   * @returns {string} accessToken
   */
  async ensureAccessToken() {
    let token = {}
    try {
      token = await this.getToken()
    } catch (e) {
      token = await this.getAccessToken()
    }
    if (token && (this.isValid(token.accessToken, token.expireTime))) { //未过期
      return token
    } else if (token && (!this.isValid(token.accessToken, token.expireTime))) { //过期
      await AccessToken.remove({})
      return this.getAccessToken()
    }
    return this.getAccessToken()
  }
  
  /**
   * 检查AccessToken, jsapiTicket是否有效，检查规则为当前时间和过期时间进行对比
   * @param {string} accessToken
   * @param {number} expireTime
   */
  isValid(accessToken, expireTime) {
    return !!accessToken && Date.now() < expireTime
  }

  // 创建菜单
  async createMenu(menu) {
    const { accessToken } = await this.ensureAccessToken()
    let url = this.prefix + 'menu/create?access_token=' + accessToken
    const response = await axios.post(url, menu)
    return response.data
  }


  // 查询菜单
  async getMenu() {
    const { accessToken } = await this.ensureAccessToken()
    const url = this.prefix + 'menu/get?access_token=' + accessToken
    const response = await axios.get(url)
    return response.data
  }

  // 删除菜单
  async delMenu() {
    const { accessToken } = await this.ensureAccessToken()
    const url = this.prefix + 'menu/delete?access_token=' + accessToken;
    const response = await axios.get(url)
    return response.data
  }

  // get jsapi_ticket
  async getJsapiTicket() {
    let ticket = {}
    const { accessToken } = await this.ensureAccessToken()
    let url = this.prefix + `ticket/getticket?access_token=${accessToken}&type=jsapi`
    const response = await axios.get(url)
    
    const expireTime = Date.now() + (response.data.expires_in -20) * 1000
    ticket.jsapi_ticket = response.data.ticket
    ticket.expireTime = expireTime
    await this.saveTicket(ticket)
    return ticket
  }

  /**
   * 返回JsapiTicket
   * @returns {string} jsapi_ticket
   */
  async ensureTicket() {
    let ticket = {}
    try {
      ticket = await this.getTicket() // 从数据库获取jsapi_ticket
    } catch (e) {
      ticket = await this.getJsapiTicket() // 从微信获取jsapi_ticket
    }
    if (ticket && (this.isValid(ticket.jsapi_ticket, ticket.expireTime))) {
      return ticket
    } else if (ticket && (!this.isValid(ticket.jsapi_ticket, ticket.expireTime))) {
      await JsApiTicket.remove({})
      return this.getJsapiTicket()
    }
    return this.getJsapiTicket()
  }
}

module.exports = API
