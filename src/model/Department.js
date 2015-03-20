var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Department = new db.Schema({
	name: {type: String, required: true, unique: true},
	email: {type: String},
	fields: [{type: ObjectId, ref: 'ChangeRequestField'}]
});

module.exports = db.model('Department', Department);