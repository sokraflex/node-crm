var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Session = new db.Schema({
	user: {type: ObjectId, ref: 'User'},
	time: {type: Date, required: true, default: Date.now}
});

module.exports = db.model('Session', Session);