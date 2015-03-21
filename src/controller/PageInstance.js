var ass = require('node-asstpl'),
	async = require('async'),
	mail = require('../config/service/mail.js'),
	PageField = require('../model/PageField.js'),
	PageInstance = require('../model/PageInstance.js');

exports.setup = function(app) {
	app.get('/PageInstanceEdit', function(req, res, jump) {
		res.locals.session.hasPermission('pageInstance.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie haben nicht die notwendigen Berechtigungen, um auf diesen Change Request zu antworten.']});

			PageInstance.findById(req.query.instanceId)
				.populate('page')
				.populate('department')
				.exec(function(err, instance) {
					if (err) return jump(err);
					if (!instance) return res.send({errors: ['Es konnte kein entsprechender Change Request gefunden werden.']});

					instance.page.populate('fields', function(err) {
						if (err) return jump(err);
						res.send({template: 'PageInstanceEdit', data: {instance: instance}});
					});
				});
		});
	});

	app.post('/PageInstanceEdit', function(req, res, jump) {
		PageInstance.findById(req.body.instanceId)
			.populate('page')
			.exec(function(err, instance) {
				if (err) return jump(err);
				if (!instance) return res.send({errors: ['Es konnte kein entsprechender Change Request gefunden werden.']});

				res.locals.session.hasPermission('pageInstance.canEdit', function(err, has) {
					if (err) return jump(err);
					if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um auf diesen Change Request antworten zu können.']});

					instance.page.populate('fields')
						.populate('nextPage', function(err) {
						if (err) return jump(err);

						instance.values = [];
						var values = {};
						for (var i = 0; i < instance.page.fields.length; ++i) {
							var field = instance.page.fields[i];
							var result = {field: field._id, value: req.body[field._id.toString()]};
							instance.values.push(result);
							values[field._id] = req.body[field._id];
						}
						instance.finished = false;
						for (var i = 0; i < instance.page.finishConditions.length; ++i) {
							var condition = instance.page.finishConditions[i];
							for (var j = 0; j < condition.values.length; ++j) {
								if (values[condition.field] == condition.values[j]) {
									instance.finished = true;
									break;
								}
							}
						}

						instance.editors.push(res.locals.session.user);
						instance.editedAt.push(Date.now());
						instance.save(function(err) {
							if (err) return jump(err);

							// send email notifications
							async.parallel([
								function(callback) {
									async.each(instance.page.mails, function(email, next) {
										/*subject = template(mail.title)({
											get: function(name, callback) {
												PageField.findOne({label: name})
													.exec(function(err, field) {
														if (err) return callback(err);
														if (!field) return callback(false, field);

														PageInstance.findOne({'values.field': field._id, request: instance.request})
															.exec(function(err, instance2) {
																if (err) return callback(err);

																for (var i = 0; i < instance2.values.length; ++i) {
																	if (instance2.values[i].field.equals(field._id)) {
																		callback(false, instance2.values[i].value);
																		break;
																	}
																}
															});
													});
											}
										});*/
										var text = email.textField ? values[email.textField.toString()] : '';
										var recipients = [];
										for (var i = 0; i < email.addressFields.length; ++i) {
											var parts = values[email.addressFields[i].toString()].split(',');
											for (var j = 0; j < parts.length; ++j) recipients.push(parts[j].trim());
										}
										for (var i = 0; i < email.addressConditions.length; ++i) {
											var condition = email.addressConditions[i];
											if (values[condition.field.toString()] == condition.value) recipients.push(condition.address);
										}

										console.log('about to send mail to');
										console.log(recipients);
										console.log(email);
										ass.template(email.title, function(match, callback) {
											PageField.findOne({label: match})
												.exec(function(err, field) {
													if (err) return callback(err);
													if (!field) return callback(false, field);

													PageInstance.findOne({'values.field': field._id, request: instance.request})
														.exec(function(err, instance2) {
															if (err) return callback(err);

															for (var i = 0; i < instance2.values.length; ++i) {
																if (instance2.values[i].field.equals(field._id)) {
																	callback(false, instance2.values[i].value);
																	break;
																}
															}
														});
												});
										}, function(err, result) {
											if (err) return next(err);
											if (recipients.length == 0) return next();
											
											mail.sendMail({
												from: 'app@megatherium.to',
												to: recipients,
												subject: result,
												text: text
											}, next);
										});
									}, callback);
								},

								function(next) {
									if (!instance.page.nextPage) return next();
									if (!finished) return next();

									var nextPage = new PageInstance({
										page: instance.page.nextPage._id,
										request: instance.request,
										department: instance.page.nextPage.department,
										editedAt: [Date.now()],
										editors: [res.locals.session.user]
									});
									nextPage.save(next);
								}
							], function(err) {
								if (err) return jump(err);
								res.send({status: 'success', template: 'PageInstanceEdit', data: {instance: instance}});
							});
						});
					});
				});
			});
	});
};