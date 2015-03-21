var async = require('async'),
	ChangeRequest = require('../model/ChangeRequest.js'),
	Report = require('../model/Report.js');

exports.setup = function(app) {
	app.get('/ReportView', function(req, res, jump) {
		res.locals.session.hasPermission('report.canView', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie haben nicht die notwendigen Berechtigungen, um diesen Bericht lesen zu dürfen.']});

			var columnFieldIds = [],
				columns = [],
				requests = [],
				report = null,
				rows = [];
			async.parallel([
				function(next) {
					Report.findOne({name: req.query.reportName})
						.populate('fields.fields')
						.exec(function(err, item) {
							if (err) return jump(err);
							if (!item) return res.send({errors: ['Der angeforderte Bericht konnte nicht gefunden werden.']});
							report = item;

							next();
						});
				},

				function(next) {
					ChangeRequest.find({})
						.populate('instances')
						.exec(function(err, items) {
							if (err) return next(err);

							async.each(items, function(request, next2) {
								requests.push(request);
								async.each(request.instances, function(instance, next3) {
									instance.populate('fields', next3);
								}, next2);
							}, next);
						});
				}
			], function(err) {
				if (err) return jump(err);

				for (var i = 0; i < report.fields.length; ++i) {
					for (var j = 0; j < report.fields[i].fields.length; ++j) {
						var field = report.fields[i].fields[j];
						columns.push(field.label);
						columnFieldIds.push(field._id.toString());
					}
				}
				for (var i = 0; i < requests.length; ++i) {
					for (var j = 0; j < requests[i].instances.length; ++j) {
						var instance = requests[i].instances[j];
						var row = [];

						for (var k = 0; k < columnFieldIds.length; ++k) {
							var length = row.length;
							for (var l = 0; l < instance.values.length; ++l) {
								var value = instance.values[l];
								if (value.field == columnFieldIds[k]) {
									row.push(value.value);
									break;
								}
							}
							if (row.length == length) row.push('');
						}
						for (var k = 0; k < instance.values.length; ++k) {
							var value = instance.values[k];
							if (columnFieldIds.indexOf(value.field.toString()) >= 0)
								row.push(value.value);
						}
						rows.push(row);
					}
				}

				res.send({template: 'ReportView', data: {columns: columns, rows: rows}});
			});
		});
	});
}