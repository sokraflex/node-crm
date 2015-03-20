var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var File = new db.Schema({
	name: {type: String, required: true},
	time: {type: Date, required: true, default: Date.now},
	user: {type: ObjectId, ref: 'User'}
});

module.exports = db.model('File', File);