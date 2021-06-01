const mongoose = require('mongoose')
const Schema = mongoose.Schema 

const postSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	review: {
		type: String,
		default: true
	},
	reviewResult: {
		type: String,
		default: true
	},
	date: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('posts', postSchema)