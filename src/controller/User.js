var async = require('async'),
	config = require('../config/config.js'),
	Session = require('../model/Session.js'),
	User = require('../model/User.js');

exports.setup = function(app) {
	app.get('/UserAdd', function(req, res, jump) {res.send({template: 'UserAdd'});});
	app.get('/UserLogin', function(req, res, jump) {res.send({template: 'UserLogin'})});

	app.post('/UserAdd', function(req, res, jump) {
		console.log(req.body);
		if (!req.param('username')) return res.send({template: 'UserAdd', status: 'error', errors: ['Du musst einen Benutzernamen wählen!']});
		if (!req.param('email')) return res.send({template: 'UserAdd', status: 'error', errors: ['Du musst eine E-Mail Adresse wählen!']});
		if (!req.param('password')) return res.send({template: 'UserAdd', status: 'error', errors: ['Du musst ein Passwort angeben.']});
		if (req.param('password').length < config.PASSWORD_MIN_LENGTH) return res.send({template: 'UserAdd', status: 'error', errors: ['Dein Passwort muss mindestens '+config.PASSWORD_MIN_LENGTH+' Zeichen lang sein.']});
		var user = new User({
			username: req.param('username'),
			name: req.param('name'),
			surname: req.param('surname'),
			email: req.param('email'),
			password: req.param('password')
		});

		User.findOne({$or: [{username: user.username}, {email: user.email}]})
			.exec(function(err, entry) {
				if (err) return jump(err);
				if (entry) {
					if (entry.username == user.username) return res.send({status: 'error', template: 'UserAdd', errors: ['Benutzername ist bereits vergeben!']});
					return res.send({status: 'error', template: 'UserAdd', errors: ['E-Mail Adresse bereits vergeben!']});
				}

				var session = new Session({user: user._id});
				async.parallel([
					function(next) {user.save(next);},
					function(next) {session.save(next);}
				], function(err) {
					if (err) return jump(err);

					res.send({status: 'success', data: {sessionId: session._id}, template: 'UserHome'});
				});
			});
	});

	app.post('/UserLogin', function(req, res, jump) {
		User.findOne({$or: [{username: req.param('username')}, {email: req.param('username')}]})
			.exec(function(err, user) {
				if (err) return jump(err);
				if (!user) return res.send({status: 'error', template: 'UserLogin', errors: ['Die Kombination aus Benutzername und Passwort ist uns nicht bekannt.']});

				user.comparePassword(req.param('password'), function(err, isMatch) {
					if (err) return jump(err);
					if (!isMatch) return res.send({status: 'error', template: 'UserLogin', errors: ['Die Kombination aus Benutzername und Passwort ist uns nicht bekannt.']});

					res.send({status: 'success', template: 'UserHome', data: {user: user}});
				});
			});
	});
};