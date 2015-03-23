var async = require('async'),
	Session = require('../model/Session.js'),
	User = require('../model/User.js'),
	Usergroup = require('../model/Usergroup.js');

exports.setup = function(app) {
	app.get('/UserLogin', function(req, res, jump) {
		res.send({template: 'UserLogin'});
	});

	app.post('/UserLogin', function(req, res, jump) {
		User.findOne({username: req.param('username')})
			.exec(function(err, user) {
				if (err) return jump(err);
				if (!user) return res.send({status: 'error', errors: ['Login fehlgeschlagen.']});

				user.comparePassword(req.param('password'), function(err, isMatch) {
					if (err) return jump(err);
					if (!isMatch) return res.send({status: 'error', errors: ['Login fehlgeschlagen.']});

					res.locals.session.user = user._id;
					res.locals.session.save(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/UserHome?sessionId='+res.locals.session._id});
						res.end();
						//res.send({status: 'success', template: 'UserLogin'});
					});
				});
			});
	});

	app.get('/UserAdd', function(req, res, jump) {
		res.send({template: 'UserAdd'});
	});

	app.post('/UserAdd', function(req, res, jump) {
		var user = new User({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			name: req.body.name,
			surname: req.body.surname
		});

		if (!user.username) return res.send({status: 'error', errors: ['Benutzer ohne Benutzernamen machen wohl wenig Sinn.']});
		if (!user.email) return res.send({status: 'error', errors: ['Srsly. Du musst ne E-Mail angeben. Sorry.']});
		if (!user.password) return res.send({status: 'error', errors: ['Wieviel Sicherheit steckt in dem Password "" ?']});
		user.save(function(err) {
			if (err) return jump(err);

			console.log(res.locals);
			res.locals.session.user = user._id;
			res.locals.session.save(function(err) {
				if (err) return jump(err);

				res.writeHead(302, {'Location': '/UserHome?sessionId='+res.locals.session._id});
				res.end();
				//res.send({status: 'success', template: 'UserAdd', data: {user: user._id}});
			});
		});
	});

	app.get('/UserList', function(req, res, jump) {
		User.find({})
			.sort('username')
			.exec(function(err, users) {
				if (err) return jump(err);

				res.send({template: 'UserList', data: {users: users}});
			});
	});

	app.get('/UserEdit', function(req, res, jump) {
		var user = null,
			usergroups = [];
		async.parallel([
			function(next) {
				User.findById(req.query.userId)
					.exec(function(err, item) {
						if (err) return next(err);
						user = item;
						next();
					});
			},

			function(next) {
				Usergroup.find({})
					.sort('name')
					.exec(function(err, items) {
						if (err) return next(err);
						usergroups = items;
						next();
					});
			}
		], function(err) {
			if (err) return jump(err);
			if (!user) return res.send({status: 'error', template: 'Error', errors: ['Der angeforderte Nutzer konnte nicht gefunden werden.']});

			res.send({template: 'UserEdit', data: {user: user, usergroups: usergroups}});
		});
	});

	app.post('/UserEdit', function(req, res, jump) {
		async.parallel([
			function(next) {
				User.findById(req.body.userId)
					.exec(function(err, item) {
						if (err) return next(err);
						if (!item) return res.send({status: 'error', template: 'Error', errors: ['Der angeforderte Nutzer konnte nicht gefunden werden.']});
						user = item;

						user.username = req.body.username;
						user.name.first = req.body.nameFirst;
						user.name.last = req.body.nameLast;
						user.email = req.body.email;
						user.usergroups = req.body.usergroups;
						user.save(next);
					});
			},

			function(next) {
				Usergroup.find({})
					.sort('name')
					.exec(function(err, items) {
						if (err) return next(err);
						usergroups = items;
						next();
					})
			}
		], function(err) {
			if (err) return jump(err);

			res.send({status: 'success', template: 'UserEdit', data: {user: user, usergroups: usergroups}});
		});
	});
}