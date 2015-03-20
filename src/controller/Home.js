var async = require('async'),
	ChangeRequestReply = require('../model/ChangeRequestReply.js'),
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
		
		res.locals.session.populate('user', function(err) {
			if (err) return jump(err);

			res.locals.session.user.populate('department', function(err) {
				if (err) return jump(err);

				res.send({template: 'UserHome', data: {user: res.locals.session.user}});
			});
		});
	});
};