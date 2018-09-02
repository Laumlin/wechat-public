const config = require('../config')
const axios = require('axios')
const qrModel = require('../models/qrModel.js')
const API = require('../wechat/api')
const api = new API(config.wechat.appid, config.wechat.appsecret)

class QR {
  // 生成带场景参数二维码 https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1443433542
  static async createQr (ctx) {
    let {scene_str} = ctx.request.body

    const { accessToken } = await api.ensureAccessToken()
    const url = api.prefix + 'qrcode/create?access_token=' + accessToken
    const postData = {
      "expire_seconds": 2592000, //过期时间30天（单位：s）
      "action_name": "qr_SCENE",
      "action_info": {
      "scene": {
        "scene_str": scene_str
        }
      }
    }
    
    const response = await axios.post(url, postData)//获取ticket
    const ticket = response.data.ticket

    const qr_img = `${api.prefix}showqrcode?ticket=${encodeURI(ticket)}` //二维码图片链接

      //数据库操作
    if (!qr_img || !scene_str) {
      ctx.throw(400, 'qr_img和scene_str不能为空！')
    }
    let isOldData = await qrModel
                      .findOne({scene_str})
                      .exec()
                      .catch(err => {
                        ctx.throw(500, '服务器内部错误-查找scene_str错误!')
                      })
  
      //如果记录已存在且过期，更新qr_img
    if (isOldData !== null) { 
      if (Date.now() > isOldData.expire_seconds) {
        await qrModel.findOneAndUpdate({scene_str}, {$set: {"qr_img": qr_img}})
                .exec()
                .catch(err => {
                  ctx.throw(500, '服务器内部错误-更新qr_img失败！')
                })
        console.log('更新qr_img')
      }
    } 
      //不存在记录则计入数据库
    else {
      // 设置过期时间
      let expire_seconds = Date.now() + (postData.expire_seconds)*1000
      let qr_one = new qrModel({scene_str, qr_img, expire_seconds})
      await qr_one.save()
                  .catch(err => {
                    ctx.throw(500, '服务器内部错误-存储qr_img错误！')
                  })
      console.log('新增记录')
    }
  }

  //获取二维码
  static async getQrImage (ctx) {
    let scene_str = ctx.query.scene_str
    let result = await qrModel
                      .findOne({scene_str})
                      .exec()
                      .catch(err => {
                        ctx.throw(500, '服务器内部错误-查找不到结果！')
                      })
    ctx.response.status = 200
    ctx.response.body = result
  }
}

module.exports = QR