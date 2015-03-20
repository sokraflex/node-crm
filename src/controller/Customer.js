var Customer = require('../model/Customer.js');

exports.setup = function(app) {
	app.get('/CustomerList', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('customer.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um alle Mandanten auflisten zu können.']});

			Customer.find({})
				.sort('name')
				.exec(function(err, customers) {
					if (err) return jump(err);

					if (req.query.status) res.send({status: req.query.status, template: 'CustomerList', data: {customers: customers}});
					else res.send({template: 'CustomerList', data: {customers: customers}});
				});
		});
	});

	app.get('/CustomerAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('customer.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Mandanten anlegen zu können.']});

			res.send({template: 'CustomerAdd'});
		});
	});

	app.post('/CustomerAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('customer.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Mandanten anlegen zu können.']});

			var customer = new Customer({name: req.body.name});
			customer.save(function(err) {
				if (err) {
					if (err.code == 11000) return res.send({status: 'error', template: 'CustomerAdd', errors: ['Der Mandant wurde bereits angelegt.']});
					return jump(err);
				}

				res.send({status: 'success', template: 'CustomerAdd', data: {customer: customer}});
			});
		});
	});

	app.get('/CustomerEdit', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('customer.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um bestehende Mandanten bearbeiten zu können.']});

			Customer.findById(req.query.customerId)
				.exec(function(err, customer) {
					if (err) return jump(err);
					if (!customer) return res.send({status: 'error', template: 'Error', errors: ['Der Mandant konnte nicht gefunden werden.']});

					res.send({template: 'CustomerEdit', data: {customer: customer}});
				});
		});
	});

	app.post('/CustomerEdit', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('customer.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um bestehende Mandanten bearbeiten zu können.']});

			Customer.findById(req.body.customerId)
				.exec(function(err, customer) {
					if (err) return jump(err);
					if (!customer) return res.send({status: 'error', template: 'Error', errors: ['Der Mandant konnte nicht gefunden werden.']});

					customer.name = req.body.name;
					customer.save(function(err) {
						if (err) {
							if (err.code == 11000) return res.send({status: 'error', template: 'CustomerEdit', data: {customer: customer}, errors: ['Der Mandant existiert bereits.']});
							return jump(err);
						}

						res.send({status: 'success', template: 'CustomerEdit', data: {customer: customer}});
					});
				});
		});
	});

	app.get('/CustomerDelete', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('customer.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um bestehende Mandanten entfernen zu können.']});

			Customer.findById(req.query.customerId)
				.exec(function(err, customer) {
					if (err) return jump(err);
					if (!customer) {
						res.writeHead(302, {'Location': '/CustomerList?sessionId='+res.locals.session._id+'&status=success.delete'});
						return res.end();
					}

					customer.remove(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/CustomerList?sessionId='+res.locals.session._id+'&status=success.delete'});
						res.end();
					})
				})
		});
	});
}