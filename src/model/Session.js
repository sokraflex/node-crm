var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Session = new db.Schema({
	user: {type: ObjectId, ref: 'User'},
	time: {type: Date, required: true, default: Date.now}
});

// check permissions
Session.methods.hasPermission = function(name, callback) {
	// populate user
	this.populate('user', function(err) {
		if (err) return callback(err);

		this.user.hasPermission(name, callback);
	}.bind(this));
}

module.exports = db.model('Session', Session);