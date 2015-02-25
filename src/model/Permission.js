var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Permission = new db.Schema({
	name: {type: String, required: true},
	usergroup: {type: ObjectId, ref: 'Usergroup', required: true},
	value: {type: Boolean, required: true}
});

module.exports = db.model('Permission', Permission);