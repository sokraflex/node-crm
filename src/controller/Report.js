var async = require('async'),
	calendar = require('../tool/calendar.js'),
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
									instance.populate('fields')
										.populate('editors', next3);
								}, next2);
							}, next);
						});
				}
			], function(err) {
				if (err) return jump(err);

				for (var i = 0; i < report.fields.length; ++i) {
					var subIds = [];
					columns.push(report.fields[i].label);
					for (var j = 0; j < report.fields[i].fields.length; ++j) {
						var field = report.fields[i].fields[j];
						subIds.push(field._id.toString());
					}
					//if (subIds.length == 1) columnFieldIds.push(subIds[0]);
					columnFieldIds.push(subIds);
				}
				for (var i = 0; i < requests.length; ++i) {
					for (var j = 0; j < requests[i].instances.length; ++j) {
						var instance = requests[i].instances[j];
						var row = [];

						for (var k = 0; k < columnFieldIds.length; ++k) {
							var length = row.length;
							var result = null;
							for (var m = 0; m < columnFieldIds[k].length; ++m) {
								for (var l = 0; l < instance.values.length; ++l) {
									var value = instance.values[l];
									if (columnFieldIds[k][m] == value.field) {
										if (columnFieldIds[k].length == 1) row.push(value.value);
										else {
											if (result == null) result = {};
											var value = JSON.parse(value.value);
											for (var propertyName in value) {
												if (value.hasOwnProperty(propertyName)) {
													if (!result.hasOwnProperty(propertyName)) result[propertyName] = parseFloat(value[propertyName]);
													else result[propertyName] += parseFloat(value[propertyName]);
												}
											}
										}
										break;
									}
								}
							}
							if (result != null) row.push(result);
							if (row.length == length) row.push('');
						}

						if (report.additionals) {
							var editedAt = instance.editedAt[instance.editedAt.length-1];
							if (report.additionals.editedAt) row.push(calendar.toString(instance.editedAt[instance.editedAt.length-1]));
							if (report.additionals.editor) row.push(instance.editors[instance.editors.length-1].name+' '+instance.editors[instance.editors.length-1].surname);
							if (report.additionals.olderThan5) {
								if (Date.now() > editedAt + calendar.workToFullDays(5)*86400000) row.push('Ja');
								else row.push('Nein');
							}
							if (report.additionals.olderThan10) {
								if (Date.now() > editedAt + calendar.workToFullDays(10)*86400000) row.push('Ja');
								else row.push('Nein');
							}
						}
						rows.push(row);
					}
				}

				if (report.additionals) {
					if (report.additionals.editedAt) columns.push('Bearbeitet am');
					if (report.additionals.editor) columns.push('Letzter Bearbeiter');
					if (report.additionals.olderThan5) columns.push('Älter 5 Tage');
					if (report.additionals.olderThan10) columns.push('Älter 10 Tage');
				}

				res.send({template: 'ReportView', data: {columns: columns, rows: rows}});
			});
		});
	});
}