var Usergroup = require('../model/Usergroup.js');

exports.setup = function(app) {
	app.get('/UsergroupAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});
		res.send({template: 'UsergroupAdd'});
	});

	app.post('/UsergroupAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});
		var usergroup = new Usergroup({name: req.body.name});
		usergroup.save(function(err) {
			if (err) {
				if (err.code == 11000) return res.send({status: 'error', template: 'UsergroupAdd', errors: ['Der Gruppenname wird bereits verwendet.']});
				if (err.errors && err.errors.name && err.errors.name.type == 'required') return res.send({status: 'error', template: 'UsergroupAdd', errors: ['Du musst einen Gruppennamen angeben.']});
				return jump(err);
			}
			res.send({status: 'success', template: 'UsergroupAdd'});
		});
	});
};