var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Usergroup = new db.Schema({
	name: {type: String, required: true, unique: true},
	default: {type: Boolean, required: true, default: false}
});

module.exports = db.model('Usergroup', Usergroup);