var autoIncrement = require('mongoose-auto-increment'),
	db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var ChangeRequest = new db.Schema({
	creator: {type: ObjectId, ref: 'User', required: true},
	customer: {type: ObjectId, ref: 'Customer', required: true},
	time: {type: Date, default: Date.now, required: true},
	number: {type: Number, required: true, unique: true}, // increases automatically, see below
	title: {type: String, required: true},
	/*costs: { // costs are added to each CR reply
		onetime: {
			current: {
				materials: {type: Number, default: 0, required: true},
				itPT: {type: Number, default: 0, required: true},
				ptOps: {type: Number, default: 0, required: true}
			},
			next: {
				materials: {type: Number, default: 0, required: true},
				itPT: {type: Number, default: 0, required: true},
				ptOps: {type: Number, default: 0, required: true}
			}
		},
		ongoing: {
			materials: {type: Number, default: 0, required: true},
			it: {type: Number, default: 0, required: true},
			fteOps: {type: Number, default: 0, required: true},
			ftePPM: {type: Number, default: 0, required: true}
		}
	}*/
});

ChangeRequest.plugin(autoIncrement.plugin, {model: 'ChangeRequest', field: 'number', startAt: 1});

module.exports = db.model('ChangeRequest', ChangeRequest);