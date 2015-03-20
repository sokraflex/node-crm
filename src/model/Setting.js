var db = require('mongoose');

var Setting = new db.Schema({
	default: {type: Boolean, default: false}, // true => Standard-Einstellungsblock
	notificationTimeout: {type: Number} // zeit in Millisekunden, nach der informiert wird, dass ein neuer laufzettel noch nicht beantwortet wurde
});

module.exports = db.model('Setting', Setting);