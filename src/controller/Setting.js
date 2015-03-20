var async = require('async'),
	Setting = require('../model/Setting.js');

exports.setup = function(app) {
	app.get('/SettingEdit', function(req, res, jump) {
		res.locals.session.hasPermission('setting.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um Einstellungen bearbeiten zu können.']});

			Setting.findOne({default: true})
				.exec(function(err, setting) {
					if (err) return jump(err);
					
					async.parallel([
						function(next) {
							if (setting) return next();

							setting = new Setting({default: true, notificationTimeout: 720000000});
							setting.save(next);
						}
					], function(err) {
						if (err) return jump(err);

						res.send({template: 'SettingEdit', data: {setting: setting}});
					});
				});
		});
	});

	app.post('/SettingEdit', function(req, res, jump) {
		res.locals.session.hasPermission('setting.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um Einstellungen bearbeiten zu können.']});

			Setting.findOne({default: true})
				.exec(function(err, setting) {
					if (err) return jump(err);

					setting.notificationTimeout = parseFloat(req.body.notificationTimeout) * 86400000;
					setting.save(function(err) {
						if (err) return jump(err);

						res.send({template: 'SettingEdit', data: {setting: setting}});
					});
				});
		});
	})
}