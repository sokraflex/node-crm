var db = require('mongoose'),
	encryption = require('encryption');

var User = new db.Schema({
	username: {type: String, required: true, unique: true},
	name: {type: String, required: true},
	surname: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true}
});

encryption.oneWay(User, 'password', {compareMethod: true});

module.exports = db.model('User', User);