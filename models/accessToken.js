const mongoose = require('mongoose')
const schema = mongoose.Schema

const accessToken = new schema({
	expireTime: Number, //过期时间
	accessToken: String //access_token
})

module.exports = mongoose.model('accessToken', accessToken)