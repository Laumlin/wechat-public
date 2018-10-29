const Router = require('koa-router')
const QR = require('../controller/qr')
const Signature = require('../controller/signature')
const UserInfo = require('../controller/getUserInfo')
router = new Router()

router
      .post('/createQr', QR.createQr)
      .get('/getQrImage', QR.getQrImage)
      .post('/getSignature', Signature.sign)
      .post('/getUserInfo', UserInfo.getUserInfo)
module.exports = router;