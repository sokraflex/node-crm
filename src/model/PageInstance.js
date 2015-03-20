var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

// an instance of a page contains the values of the fields
var PageInstance = new db.Schema({
	request: {type: ObjectId, ref: 'ChangeRequest', required: true},
	page: {type: ObjectId, ref: 'Page', required: true},
	department: {type: ObjectId, ref: 'Department', required: true},
	editors: [{type: ObjectId, ref: 'User'}],
	editedAt: [{type: Date}],
	finished: {type: Boolean, required: true, default: false},
	values: [{
		field: {type: ObjectId, ref: 'PageField'},
		value: {type: String}
	}]
});

module.exports = db.model('PageInstance', PageInstance);