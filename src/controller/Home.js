var async = require('async'),
	calendar = require('../tool/calendar.js'),
	ChangeRequestReply = require('../model/ChangeRequestReply.js'),
	Page = require('../model/Page.js'),
	PageInstance = require('../model/PageInstance.js'),
	User = require('../model/User.js');

exports.setup = function(app) {
	app.get('/', function(req, res, jump) {
		res.send({template: 'Home'});
	});
	app.get('/Home', function(req, res, jump) {
		res.send({template: 'Home'});
	});
	app.get('/UserHome', function(req, res, jump) {
		if (!res.locals.session.user) return res.send({status: 'error', template: 'PermissionError', error: 'Du musst angemeldet sein.'});
		
		var canAddChangeRequests = false,
			count = {},
			days = req.query.days ? parseInt(req.query.days) : 5,
			pages = [];
		var totalDays = calendar.workToFullDays(days);

		var timeout = Date.now()-totalDays * 1000 * 60 * 60 * 24; 

		async.parallel([
			function(next) {
				res.locals.session.populate('user', function(err) {
					if (err) return next(err);

					async.parallel([
						function(next2) {
							var departmentId = res.locals.session.user.department;
							Page.find({})
								.sort('name')
								.populate('fields')
								.exec(function(err, items) {
									if (err) return next2(err);
									pages = items;

									async.parallel([
										function(next3) {
											async.eachSeries(pages, function(page, next4) {
												var statusFieldId = null;
												for (var i = 0; i < page.fields.length; ++i)
													if (page.fields[i].label == 'Status') {
														statusFieldId = page.fields[i]._id;
														break;
													}

												PageInstance.find({page: page._id, editedAt: {$gt: timeout}})
													.exec(function(err, instances) {
														if (err) return next4(err);

														count[page.name] = {_total: instances.length, stati: {}};
														async.each(instances, function(instance, next5) {
															for (var i = 0; i < instance.values.length; ++i) {
																var value = instance.values[i];
																if (!value.field.equals(statusFieldId)) continue;
																if (!count[page.name].stati.hasOwnProperty(value.value)) count[page.name].stati[value.value] = 1;
																else ++count[page.name].stati[value.value];
																break;
															}

															next5();
														}, next4);
													});
											}, next3);
										}
									], next2);
								});
						},
						function(next2) {res.locals.session.user.populate('department', next2);}
					], next);
				});
			},
			function(next) {
				res.locals.session.hasPermission('changeRequest.canAdd', function(err, has) {
					if (err) return next(err);
					canAddChangeRequests = has;
					next();
				});
			}
		], function(err) {
			if (err) return jump(err);

			res.send({template: 'UserHome', data: {user: res.locals.session.user, canAddChangeRequests: canAddChangeRequests, count: count, days: req.query.days ? req.query.days : 5}});
		});
	});
};