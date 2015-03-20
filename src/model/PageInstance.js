var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

// an instance of a page contains the values of the fields
var PageInstance = new db.Schema({
	request: {type: ObjectId, ref: 'ChangeRequest'},
	page: {type: ObjectId, ref: 'Page'},
	editors: [{type: ObjectId, ref: 'User'}],
	editedAt: [{type: Date}],
	values: [{
		field: {type: ObjectId, ref: 'PageField'},
		value: {type: String}
	}]
});

module.exports = db.model('PageInstance', PageInstance);