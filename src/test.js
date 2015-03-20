var template = require('./tools/template.js');

template('[CRNrBCB] [Status] ([Titel])')({
	get: function(name, callback) {
		if (name == 'CRNrBCB') callback(false, '#CR-LOL');
		else if (name == 'Status') callback(false, 'Abgeschlossen');
		else if (name == 'Titel') callback(false, 'Test Change Request')
	}
}, function(err, result) {
	if (err) throw err;
	console.log(result);
});