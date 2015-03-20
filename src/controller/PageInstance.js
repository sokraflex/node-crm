var mail = require('../config/service/mail.js'),
	ass = require('node-asstpl'),
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
		PageInstance.findById(req.query.instanceId)
			.populate('page')
			.exec(function(err, instance) {
				if (err) return jump(err);
				if (!instance) return res.send({errors: ['Es konnte kein entsprechender Change Request gefunden werden.']});

				res.locals.session.hasPermission('pageInstance.canEdit', function(err, has) {
					if (err) return jump(err);
					if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um auf diesen Change Request antworten zu können.']});

					instance.page.populate('fields', function(err) {
						if (err) return jump(err);

						if (!instance.values) instance.values = [];
						var values = {};
						for (var i = 0; i < instance.page.fields.length; ++i) {
							var field = instance.page.fields[i];
							instance.values.push({field: field._id, value: req.body[field._id]});
							values[field._id] = req.body[field._id];
						}
						instance.editors.push(res.locals.session.user);
						instance.editedAt.push(Date.now());
						instance.save(function(err) {
							if (err) return jump(err);

							// send email notifications
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
								ass.template(mail.title, function(match, callback) {
									console.log('MATCHED: '+match);
									callback(false, match);
								}, function(err, result) {
									if (err) return jump(err);
									console.log('RESULT: '+result);
									next(false);
								});
								/*mail.sendMail({
									from: 'app@dressiety.de',
									to: recipients
									subject: email.title,
									text: text
								}, next);*/
							}, function(err) {
								if (err) return jump(err);
								res.send({status: 'success'});
							});
						});
					});
				});
			});
	});
};