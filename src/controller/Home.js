var User = require('../model/User.js');

exports.setup = function(app) {
	app.get('/', function(req, res, jump) {
		res.send({template: 'Home'});
	});
	app.get('/Home', function(req, res, jump) {
		res.send({template: 'Home'});
	});
	app.get('/UserHome', function(req, res, jump) {
		if (!res.locals.session.user) return res.send({status: 'error', template: 'PermissionError', error: 'Du musst angemeldet sein.'});
		User.findById(res.locals.session.user)
			.exec(function(err, user) {
				res.send({template: 'UserHome', data: {user: user}});
			});
	});
};