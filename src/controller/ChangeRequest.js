var async = require('async'),
	ChangeRequest = require('../model/ChangeRequest.js'),
	Customer = require('../model/Customer.js');

exports.setup = function(app) {
	app.get('/ChangeRequestList', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('changeRequest.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um dir alle Change Requests auflisten zu können.']});

			ChangeRequest.find({})
				.populate('customer')
				.exec(function(err, requests) {
					if (err) return jump(err);

					if (req.query.status) return res.send({status: req.query.status, template: 'ChangeRequestList', data: {requests: requests}});
					res.send({template: 'ChangeRequestList', data: {requests: requests}});
				});
		});
	});

	app.get('/ChangeRequestAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('changeRequest.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Change Requests anlegen zu können.']});

			Customer.find({})
				.exec(function(err, customers) {
					if (err) return jump(err);

					res.send({template: 'ChangeRequestAdd', data: {customers: customers}});
				});
		});
	});

	app.post('/ChangeRequestAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('changeRequest.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Change Requests anlegen zu können.']});

			var customers = [],
				request = new ChangeRequest({
					creator: res.locals.session.user,
					customer: req.body.customerId,
					title: req.body.title
				});
			async.parallel([
				function(next) {request.save(next);},
				function(next) {
					Customer.find({})
						.exec(function(err, items) {
							if (err) return next(err);
							customers = items;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'ChangeRequestAdd', data: {request: request, customers: customers}})
			});
		});
	});

	app.get('/ChangeRequestEdit', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('changeRequest.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um bestehende Change Requests bearbeiten zu können.']});

			var customers = [],
				request = null;
			async.parallel([
				function(next) {
					Customer.find({})
						.exec(function(err, items) {
							if (err) return next(err);
							customers = items;
							next();
						});
				},
				function(next) {
					ChangeRequest.findById(req.query.requestId)
						.exec(function(err, item) {
							if (err) return next(err);
							request = item;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);
				if (!request) return res.send({status: 'error', template: 'Error', errors: ['Der Change Request konnte nicht gefunden werden.']});

				res.send({template: 'ChangeRequestEdit', data: {request: request, customers: customers}});
			});
		});
	});

	app.post('/ChangeRequestEdit', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('changeRequest.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um bestehende Change Requests bearbeiten zu können.']});

			var customers = [],
				request = null;
			async.parallel([
				function(next) {
					Customer.find({})
						.exec(function(err, items) {
							if (err) return next(err);
							customers = items;
							next();
						});
				},
				function(next) {
					ChangeRequest.findById(req.body.requestId)
						.exec(function(err, item) {
							if (err) return next(err);
							request = item;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);

				request.title = req.body.title;
				request.customer = req.body.customerId;
				request.save(function(err) {
					if (err) return jump(err);

					res.send({status: 'success', template: 'ChangeRequestEdit', data: {request: request, customers: customers}});
				});
			});
		});
	});

	app.get('/ChangeRequestDelete', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('changeRequest.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um bestehende Change Requests entfernen zu können.']});

			ChangeRequest.findById(req.query.requestId)
				.exec(function(err, request) {
					if (err) return jump(err);

					if (!request) {
						res.writeHead(302, {'Location': '/ChangeRequestList?sessionId='+res.locals.session._id+'&status=success.delete'});
						return res.end();
					}

					request.remove(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/ChangeRequestList?sessionId='+res.locals.session._id+'&status=success.delete'});
						res.end();
					});
				})
		});
	});

	app.get('/ChangeRequestView', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('changeRequest.canView', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um bestehende Change Requests ansehen zu können.']});

			ChangeRequest.findById(req.query.requestId)
				.populate('customer')
				.populate('creator')
				.exec(function(err, request) {
					if (err) return jump(err);
					if (!request) return res.send({status: 'error', template: 'Error', errors: ['Der Change Request konnte nicht gefunden werden.']});

					res.send({template: 'ChangeRequestView', data: {request: request}});
				});
		});
	});
}