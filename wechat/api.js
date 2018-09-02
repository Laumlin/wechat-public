const axios = require('axios')
const AccessToken = require('../models/accessToken')

class API {
  constructor(appid, appsecret) {
    this.appid = appid
    this.appsecret = appsecret
    this.prefix = 'https://api.weixin.qq.com/cgi-bin/'
    /**
     * 储存token到access_token.txt
     * @param {json} token
     */
    this.saveToken = async function (token) {
      let Token = new AccessToken(token)
      await Token.save().catch(err => console.error('服务器内部错误--存入access_token出错！'))
    }
    // 从access_token.txt中获取token
    this.getToken = async function () {
      let token = await AccessToken.find().exec().catch(err => console.error('服务器内部错误--查询access_token出错！'))
      return token
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
    if (token && (this.isValid(token.accessToken, token.expireTime))) {
      return token
    }
    return this.getAccessToken()
  }

  /**
   * 检查AccessToken是否有效，检查规则为当前时间和过期时间进行对比
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

}

module.exports = API
