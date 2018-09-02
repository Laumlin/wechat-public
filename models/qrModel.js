const mongoose = require('mongoose')
const schema = mongoose.Schema

const qrSchema = new schema({
	scene_str: String,  //二维码场景信息
	qr_img: String, //二维码图片链接
	expire_seconds: Number //过期时间
})

module.exports = mongoose.model('qrModel', qrSchema)