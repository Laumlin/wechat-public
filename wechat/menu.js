const config = require('../config')

const menu = {
  "button": [
    {
      "name": "我要激活",
      "sub_button": [
        {
          "type": "view",
          "name": "邀请码激活",
          "url": "http://m.datahub.net.cn/register/"
        },
        {
          "type": "click",
          "name": "审核激活",
          "key": "activate_result"
        }]
    },
    {
      "type": "view",
      "name": "我要邀请",
      "url": `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wechat.appid}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
    },
    {
      "type": "click",
      "name": "今日推荐",
      "key": "today_articles"
    }]
}

module.exports = menu