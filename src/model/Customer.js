var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Customer = new db.Schema({
	name: {type: String, required: true, unique: true}
});

module.exports = db.model('Customer', Customer);