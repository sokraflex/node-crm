var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var ChangeRequestReply = new db.Schema({
	request: {type: ObjectId, ref: 'ChangeRequest', required: true},
	department: {type: ObjectId, ref: 'Department', required: true},
	user: [{type: ObjectId, ref: 'User'}], // alle Bearbeiter, der Reihenfolge nach
	time: {type: Date}, // letztes Bearbeitungsdatum, nachdem der Status auf "DONE" oder "IRRELEVANT" gesetzt wurde
	status: {type: String, enum: ['DONE', 'INPROGRESS', 'IRRELEVANT'], required: true, default: 'IN_PROGRESS'},
	description: {type: String},
	statementPG: {type: Boolean},
	costs: { // costs are added to each CR reply
		onetime: {
			current: {
				materials: {type: Number, default: 0, required: true},
				itPT: {type: Number, default: 0, required: true},
				ptOps: {type: Number, default: 0, required: true},
				ptPPM: {type: Number, default: 0, required: true}
			},
			next: {
				materials: {type: Number, default: 0, required: true},
				itPT: {type: Number, default: 0, required: true},
				ptOps: {type: Number, default: 0, required: true},
				ptPPM: {type: Number, default: 0, required: true}
			}
		},
		ongoing: {
			materials: {type: Number, default: 0, required: true},
			it: {type: Number, default: 0, required: true},
			fteOps: {type: Number, default: 0, required: true},
			ftePPM: {type: Number, default: 0, required: true}
		}
	},
	operations: {type: ObjectId, ref: 'OperationsStatement'}
});

module.exports = db.model('ChangeRequestReply', ChangeRequestReply);