var Department = require('../model/Department.js');

exports.setup = function(app) {
	app.get('/DepartmentAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});
		res.locals.session.hasPermission('department.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du hast nicht die Berechtigung, um neue Abteilungen anzulegen.']});

			res.send({template: 'DepartmentAdd'});
		});
	});

	app.post('/DepartmentAdd', function(req, res, jump) {
		res.locals.session.hasPermission('department.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du hast nicht die Berechtigung, um neue Abteilungen anzulegen.']});
			if (!req.body.name) return res.send({status: 'error', template: 'DepartmentAdd', errors: ['Du musst einen Namen angeben.']});

			var department = new Department({name: req.body.name});
			department.save(function(err) {
				if (err) return jump(err);
				res.send({status: 'success', template: 'DepartmentAdd'});
			});
		});
	});
};