var async = require('async'),
	ChangeRequest = require('../model/ChangeRequest.js'),
	Page = require('../model/Page.js'),
	PageInstance = require('../model/PageInstance.js');

exports.setup = function(app) {
	app.get('/ChangeRequestAdd', function(req, res, jump) {
		res.locals.session.hasPermission('changeRequest.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um neue Change Requests anlegen zu können.']});

			var request = new ChangeRequest({instances: []});
			Page.findOne({})
				.populate('fields')
				.sort('name')
				.exec(function(err, page) {
					if (err) return jump(err);
					if (!page) return res.send({errors: ['Es konnte keine Seite gefundne werden, mit der ein neuer Change Request erstellt werden könnte.']});

					var instance = new PageInstance({
						request: request._id,
						page: page._id,
						department: page.department,
						editedAt: [Date.now()],
						editors: [res.locals.session.user],
						values: []
					});
					for (var i = 0; i < page.fields.length; ++i) {
						var field = page.fields[i];
						if (field.default) {
							instance.values.push({field: field._id, value: field.default});
						}
					}
					request.instances.push(instance._id);
					async.parallel([
						function(next) {instance.save(next);},
						function(next) {request.save(next);}
					], function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/PageInstanceEdit?sessionId='+res.locals.session._id+'&instanceId='+instance._id});
						res.end();
					});
				});
		});
	});
}