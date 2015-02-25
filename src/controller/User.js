var async = require('async'),
	config = require('../config/config.js'),
	Session = require('../model/Session.js'),
	User = require('../model/User.js');

exports.setup = function(app) {
	app.get('/UserAdd', function(req, res, jump) {res.send({template: 'UserAdd'});});
	app.get('/UserLogin', function(req, res, jump) {res.send({template: 'UserLogin'})});

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
		User.findOne({$or: [{username: req.body.username}, {email: req.body.username}]})
			.exec(function(err, user) {
				if (err) return jump(err);
				if (!user) return res.send({status: 'error', template: 'UserLogin', errors: ['Die Kombination aus Benutzername und Passwort ist uns nicht bekannt.']});

				user.comparePassword(req.body.password, function(err, isMatch) {
					if (err) return jump(err);
					if (!isMatch) return res.send({status: 'error', template: 'UserLogin', errors: ['Die Kombination aus Benutzername und Passwort ist uns nicht bekannt.']});

					var session = new Session({user: user._id});
					session.save(function(err) {
						if (err) return jump(err);
						res.writeHead(302, {'Location': '/UserHome?sessionId='+session._id});
						res.end();
					});
				});
			});
	});
};