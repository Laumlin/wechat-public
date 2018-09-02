const Router = require('koa-router')
const QR = require('../controller/qr')
router = new Router()

router
			.post('/createQr', QR.createQr)
			.get('/getQrImage', QR.getQrImage)

module.exports = router;