var db = require('mongoose'),
	encryption = require('encryption'),
	Permission = require('./Permission.js');
var ObjectId = db.Schema.Types.ObjectId;

var User = new db.Schema({
	username: {type: String, required: true, unique: true},
	name: {type: String, required: true},
	surname: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	usergroups: [{type: ObjectId, ref: 'Usergroup'}],
	department: {type: ObjectId, ref: 'Department'}
});

// encrypt password, add comparePassword(pw, callback)-method
encryption.oneWay(User, 'password', {compareMethod: true});

// add hasPermission method
User.methods.hasPermission = function(name, callback) {
	Permission.findOne({value: true, usergroup: {$in: this.usergroups}, name: name}, function(err, permission) {
		if (err) return callback(err);
		if (!permission) return callback(false, false);
		callback(false, true);
	});
}

module.exports = db.model('User', User);