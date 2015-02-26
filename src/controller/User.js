var async = require('async'),
	config = require('../config/config.js'),
	Session = require('../model/Session.js'),
	User = require('../model/User.js'),
	Usergroup = require('../model/Usergroup.js');

exports.setup = function(app) {
	app.get('/UserAdd', function(req, res, jump) {res.send({template: 'UserAdd'});});
	app.get('/UserLogin', function(req, res, jump) {res.send({template: 'UserLogin'})});

	app.get('/UserLogout', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'success', template: 'UserLogout'});
		res.locals.session.remove(function(err) {
			if (err) return jump(err);
			delete res.locals.session;
			res.send({status: 'success', template: 'UserLogout'});
		});
	});

	app.post('/UserAdd', function(req, res, jump) {
		if (!req.body.username) return res.send({template: 'UserAdd', status: 'error', errors: ['Du musst einen Benutzernamen wählen!']});
		if (!req.body.email) return res.send({template: 'UserAdd', status: 'error', errors: ['Du musst eine E-Mail Adresse wählen!']});
		if (!req.body.password) return res.send({template: 'UserAdd', status: 'error', errors: ['Du musst ein Passwort angeben.']});
		if (req.body.password.length < config.PASSWORD_MIN_LENGTH) return res.send({template: 'UserAdd', status: 'error', errors: ['Dein Passwort muss mindestens '+config.PASSWORD_MIN_LENGTH+' Zeichen lang sein.']});
		var user = new User({
			username: req.body.username,
			name: req.body.name,
			surname: req.body.surname,
			email: req.body.email,
			password: req.body.password
		});

		User.findOne({$or: [{username: user.username}, {email: user.email}]})
			.exec(function(err, entry) {
				if (err) return jump(err);
				if (entry) {
					if (entry.username == user.username) return res.send({status: 'error', template: 'UserAdd', errors: ['Benutzername ist bereits vergeben!']});
					return res.send({status: 'error', template: 'UserAdd', errors: ['E-Mail Adresse bereits vergeben!']});
				}

				Usergroup.findOne({default: true})
					.exec(function(err, group) {
						if (err) return jump(err);
						if (group) user.usergroups = [group._id];

						var session = new Session({user: user._id});
						async.parallel([
							function(next) {user.save(next);},
							function(next) {session.save(next);}
						], function(err) {
							if (err) return jump(err);

							res.send({status: 'success', data: {sessionId: session._id, user: user}, template: 'UserHome'});
						});
					});
			});
	});

	app.post('/UserLogin', function(req, res, jump) {
		User.findOne({$or: [{username: req.body.username}, {email: req.body.username}]})
			.exec(function(err, user) {
				if (err) return jump(err);
				if (!user) return res.send({status: 'error', template: 'UserLogin', errors: ['Die Kombination aus Benutzername und Passwort ist uns nicht bekannt.']});

				user.comparePassword(req.body.password, function(err, isMatch) {
					if (err) return jump(err);
					if (!isMatch) return res.send({status: 'error', template: 'UserLogin', errors: ['Die Kombination aus Benutzername und Passwort ist uns nicht bekannt.']});

					var session = new Session({user: user._id});
					async.parallel([
						function(next) {Session.remove({user: user._id}, next);},
						function(next) {session.save(next);}
					], function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/UserHome?sessionId='+session._id});
						res.end();
					});
				});
			});
	});

	app.get('/UserList', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('user.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um alle Benutzer auflisten zu können.']});

			User.find({})
				.sort('username')
				.exec(function(err, users) {
					if (err) return jump(err);

					res.send({template: 'UserList', data: {users: users}});
				});
		});
	});

	app.get('/UserEdit', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('user.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Benutzer bearbeiten zu können.']});
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
						.exec(function(err, items) {
							if (err) return next(err);
							usergroups = items;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);
				if (!user) return res.send({status: 'error', template: 'Error', errors: ['Der Benutzer konnte nicht gefunden werden.']});

				res.send({template: 'UserEdit', data: {user: user, usergroups: usergroups}});
			});
		});
	});

	app.post('/UserEdit', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('usergroup.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Benutzer bearbeiten zu können.']});

			var user = null,
				usergroups = [];

			async.parallel([
				function(next) {
					User.findById(req.body.userId)
						.exec(function(err, item) {
							if (err) return next(err);
							if (!item) return res.send({status: 'error', template: 'Error', errors: ['Der Benutzer konnte nicht gefunden werden.']});

							user = item;
							user.username = req.body.username;
							user.name = req.body.name;
							user.surname = req.body.surname;
							user.email = req.body.email;
							user.usergroups = req.body.usergroups;
							user.save(next);
						});
				},

				function(next) {
					Usergroup.find({})
						.exec(function(err, items) {
							if (err) return next(err);
							usergroups = items;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'UserEdit', data: {user: user, usergroups: usergroups}});
			});
		});
	})
};