var Usergroup = require('../model/Usergroup.js');

exports.setup = function(app) {
	app.get('/UsergroupAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});
		
		res.locals.session.hasPermission('usergroup.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Benutzergruppen erstellen zu können.']});

			res.send({template: 'UsergroupAdd'});
		});
	});

	app.post('/UsergroupAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});
		res.locals.session.hasPermission('usergroup.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Benutzergruppen erstellen zu können.']});

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
	});

	app.get('/UsergroupList', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('usergroup.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um alle Benutzergruppen auflisten zu können.']});

			Usergroup.find({})
				.sort('name')
				.exec(function(err, usergroups) {
					if (err) return jump(err);

					var response = {template: 'UsergroupList', data: {usergroups: usergroups}};
					if (req.query.status) response.status = req.query.status;
					res.send(response);
				});
		});
	});

	app.get('/UsergroupDelete', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('usergroup.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Benutzergruppen entfernen zu können.']});

			Usergroup.findById(req.query.usergroupId)
				.exec(function(err, usergroup) {
					if (err) return jump(err);
					if (!usergroup) return res.send({status: 'success', template: 'UsergroupDelete'});

					usergroup.remove(function(err) {
						if (err) return jump(err);

						res.send({status: 'success', template: 'UsergroupDelete', data: {name: usergroup.name}});
					});
				});
		});
	});

	app.get('/UsergroupEdit', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('usergroup.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Benutzergruppen bearbeiten zu können.']});
			
			Usergroup.findById(req.query.usergroupId)
				.exec(function(err, usergroup) {
					if (err) return jump(err);
					if (!usergroup) return res.send({status: 'error', template: 'Error', errors: ['Die Benutzergruppe existiert nicht.']});

					res.send({template: 'UsergroupEdit', data: {usergroup: usergroup}});
				});
		});
	});

	app.post('/UsergroupEdit', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('usergroup.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Benutzergruppen bearbeiten zu können.']});
			
			Usergroup.findById(req.body.usergroupId)
				.exec(function(err, usergroup) {
					if (err) return jump(err);
					if (!usergroup) return res.send({status: 'error', template: 'Error', errors: ['Die Benutzergruppe existiert nicht.']});

					usergroup.name = req.body.name;
					usergroup.save(function(err) {
						if (err) {
							if (err.code == 11000) return res.send({status: 'error', template: 'UsergroupEdit', data: {usergroup: usergroup}, errors: ['Der Gruppenname wird bereits verwendet.']});
							return jump(err);
						}

						res.send({status: 'success', template: 'UsergroupEdit', data: {usergroup: usergroup}});
					});
				});
		});
	});

	app.get('/UsergroupDefault', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('usergroup.canSetDefault', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um die Standard-Benutzergruppe setzen zu können.']});

			Usergroup.findById(req.query.usergroupId)
				.exec(function(err, usergroup) {
					if (err) return jump(err);
					if (!usergroup) return res.send({status: 'error', template: 'Error', errors: ['Die Benutzergruppe konnte nicht gefunden werden.']});

					Usergroup.update({default: true}, {$set: {default: false}})
						.exec(function(err) {
							if (err) return jump(err);

							usergroup.default = true;
							usergroup.save(function(err) {
								if (err) return jump(err);

								res.writeHead(302, {'Location': '/UsergroupList?sessionId='+req.query.sessionId+'&status=default.success'});
								res.end();
							});
						});
				});
		});
	});
};