var async = require('async'),
	Permission = require('../model/Permission.js'),
	Usergroup = require('../model/Usergroup.js');

exports.setup = function(app) {
	app.get('/PermissionList', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('permission.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Berechtigungen auflisten zu können.']});

			var permissions = [],
				usergroup = null;
			async.parallel([
				function(next) {
					Permission.find({usergroup: req.query.usergroupId})
						.sort('name')
						.exec(function(err, items) {
							if (err) return next(err);
							permissions = items;
							next();
						});
				},

				function(next) {
					Usergroup.findById(req.query.usergroupId)
						.exec(function(err, item) {
							if (err) return next(err);
							usergroup = item;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);

				var response = {template: 'PermissionList', data: {permissions: permissions, usergroup: usergroup}};
				if (req.query.status) response.status = req.query.status;
				res.send(response);
			});
		});
	});

	app.post('/PermissionAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('permission.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Gruppen neue Berechtigungen zu gewähren.']});

			Permission.findOne({usergroup: req.body.usergroupId, name: req.body.name})
				.exec(function(err, permission) {
					if (err) return jump(err);
					console.log(permission);
					if (!permission) permission = new Permission({name: req.body.name, usergroup: req.body.usergroupId, value: true});
					else permission.value = true;

					console.log(permission);
					permission.save(function(err) {
						if (err) return jump(err);
						res.writeHead(302, {'Location': '/PermissionList?sessionId='+req.query.sessionId+'&usergroupId='+req.body.usergroupId+'&status=add.success'});
						res.end();
					});
				});
		});
	});

	app.get('/PermissionDelete', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});
		
		res.locals.session.hasPermission('permission.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Gruppen Berechtigungen zu entziehen.']});

			Permission.findByIdAndRemove(req.query.permissionId)
				.exec(function(err, permission) {
					if (err) return jump(err);

					res.writeHead(302, {'Location': '/PermissionList?sessionId='+req.query.sessionId+'&usergroupId='+permission.usergroup+'&status=delete.success'});
					res.end();
				});
		});
	});
};