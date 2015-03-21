var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Page = new db.Schema({
	department: {type: ObjectId, ref: 'Department', requierd: true},
	name: {type: String, required: true, index: {unique: true}},
	nextPage: {type: ObjectId, ref: 'Page'},
	headlines: [{
		page: {type: ObjectId, ref: 'Page'},
		fields: [{type: ObjectId, ref: 'PageField'}]
	}],
	fields: [{type: ObjectId, ref: 'PageField'}],
	mails: [{
		title: {type: String},
		textField: {type: ObjectId, ref: 'PageField'},
		addressFields: [{type: ObjectId, ref: 'PageField'}],
		addressConditions: [{
			field: {type: ObjectId, ref: 'PageField', required: true},
			value: {type: String},
			address: {type: String}
		}]
	}],
	finishConditions: [{
		field: {type: ObjectId, ref: 'PageField', required: true},
		values: [{type: String}]
	}]
});

module.exports = db.model('Page', Page);