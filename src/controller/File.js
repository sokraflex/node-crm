var async = require('async'),
	fs = require('fs'),
	File = require('../model/File.js');

exports.setup = function(app) {
	app.post('/FileAdd', function(req, res, jump) {
		res.locals.session.hasPermission('file.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Dateien an Change Requests anhängen zu können.']});

			var file = res.locals.session.file;
			console.log(file);
			res.send({});
		});
	});
}