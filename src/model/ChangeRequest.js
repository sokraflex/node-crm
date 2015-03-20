var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var ChangeRequest = new db.Schema({
	instances: [{type: ObjectId, ref: 'PageInstance'}]
});

module.exports = db.model('ChangeRequest', ChangeRequest);