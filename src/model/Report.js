var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Report = new db.Schema({
	name: {type: String, index: {unique: true}},
	fields: [{
		fields: [{type: ObjectId, ref: 'PageField'}],
		type: {type: String, enum: ['added', 'normal'], required: true, default: 'normal'}
	}],
	additionals: {
		editedAt: {type: Boolean, default: true},
		editor: {type: Boolean, default: true},
		olderThan5: {type: Boolean, default: true},
		olderThan10: {type: Boolean, default: true}
	}
});

module.exports = db.model('Report', Report);