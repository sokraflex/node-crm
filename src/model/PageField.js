var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var PageField = new db.Schema({
	page: {type: ObjectId, ref: 'Page', required: true},
	label: {type: String, required: true},
	type: {type: String, required: true, enum: [
		'BOOLEAN', // ja/nein-Auswahlfeld
		'COSTS', // Aufwands-Tabelle, tbd
		'DATE', // Datums-Feld OHNE Zeiteingabe
		'LONGTEXT',
		'MAIL', // E-Mail Adresse
		'MONEY', // 0.00 - ...9.99
		'NUMBER',
		'SELECT', // auswahlliste mit optionen
		'SELECTMULTI', // auswahlliste mit mehrfachauswahl
		'TEXT'
	]},
	selectables: [{type: String}],
	active: {type: Boolean, required: true, default: true} // dont delete pagefields!
});

module.exports = db.model('PageField', PageField);