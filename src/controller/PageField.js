var async = require('async'),
	Page = require('../model/Page.js'),
	PageField = require('../model/PageField.js');

exports.setup = function(app) {
	app.get('/PageFieldList', function(req, res, jump) {
		res.locals.session.hasPermission('pageField.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um die Felder dieser Seite auflisten zu können.']});

			Page.findById(req.query.pageId)
				.populate('department')
				.populate('headlines.page')
				.populate('headlines.fields')
				.populate('fields')
				.populate('mails.textField')
				.populate('mails.addressFields')
				.populate('mails.addressConditions.field')
				.exec(function(err, page) {
					if (err) return jump(err);
					if (!page) return res.send({errors: ['Die angeforderte Seite konnte nicht gefunden werden.']});

					res.send({template: 'PageFieldList', data: {page: page}});
				});
		});
	});

	app.get('/PageFieldAdd', function(req, res, jump) {
		res.locals.session.hasPermission('pageField.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um neue Felder zu dieser Seite hinzufügen zu können.']});

			Page.findById(req.query.pageId)
				.exec(function(err, page) {
					if (err) return jump(err);
					if (!page) return res.send({errors: ['Die angeforderte Seite konnte nicht gefunden werden.']});

					res.send({template: 'PageFieldAdd', data: {page: page}});
				});
		});
	});

	app.post('/PageFieldAdd', function(req, res, jump) {
		res.locals.session.hasPermission('pageField.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um neue Felder zu dieser Seite hinzufügen zu können.']});

			var page = null;
			var field = new PageField({
				page: req.body.pageId,
				label: req.body.label,
				type: req.body.type,
				selectables: []
			});
			if ((field.type == 'SELECT' || field.type == 'SELECTMULTI') && req.body.selectables) {
				var parts = req.body.selectables.split(',');
				for (var i = 0; i < parts.length; ++i) {
					if (parts[i].trim().length > 0)
						field.selectables.push(parts[i].trim());
				}
			}

			async.parallel([
				function(next) {field.save(next);},
				function(next) {
					Page.findById(req.body.pageId)
						.exec(function(err, item) {
							page = item;
							next(err);
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'PageFieldAdd', data: {page: page, fieldLabel: field.label}});
			})
		});
	});

	app.get('/PageFieldEdit', function(req, res, jump) {
		res.locals.session.hasPermission('pageField.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um ein bestehendes Feld dieser Seite bearbeiten zu können.']});

			PageField.findById(req.query.fieldId)
				.populate('page')
				.exec(function(err, field) {
					if (err) return jump(err);
					if (!field) return res.send({errors: ['Das angeforderte Feld konnte nicht gefunden werden.']});

					res.send({template: 'PageFieldEdit', data: {field: field}});
				});
		});
	});

	app.post('/PageFieldEdit', function(req, res, jump) {
		res.locals.session.hasPermission('pageField.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um ein bestehendes Feld dieser Seite bearbeiten zu können.']});

			PageField.findById(req.body.fieldId)
				.populate('page')
				.exec(function(err, field) {
					if (err) return jump(err);
					if (!field) return res.send({errors: ['Das angeforderte Feld konnte nicht gefunden werden.']});

					field.label = req.body.label;
					field.type = req.body.type;
					field.selectables = [];
					if (req.body.selectables) 
						req.body.selectables.split(',').forEach(function(item) {
							if (item.trim().length > 0)
								field.selectables.push(item.trim());
						});
					field.save(function(err) {
						if (err) return jump(err);

						res.send({status: 'success', template: 'PageFieldEdit', data: {field: field}});
					});
				});
		});
	});

	app.get('/PageFieldDelete', function(req, res, jump) {
		PageField.findById(req.query.fieldId)
			.populate('page')
			.exec(function(err, field) {
				if (err) return jump(err);

				var page = field.page;
				field.active = false;
				for (var i = 0; i < page.fields.length; ++i) {
					if (page.fields[i].field.equals(field._id)) {
						page.fields = page.fields.splice(i, 1);
						break;
					}
				}

				async.parallel([
					function(next) {field.save(next);},
					function(next) {field.page.save(next);}
				], function(err) {
					if (err) return jump(err);

					res.writeHead(302, {'Location': '/PageFieldList?pageId='+field.page._id+'&status=delete.success'});
					res.end();
				});
			});
	});
}