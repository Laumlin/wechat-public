const Router = require('koa-router')
const QR = require('../controller/qr')
const Signature = require('../controller/signature')
router = new Router()

router
      .post('/createQr', QR.createQr)
      .get('/getQrImage', QR.getQrImage)
      .post('/getSignature', Signature.sign)
module.exports = router;