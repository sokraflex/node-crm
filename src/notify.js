var async = require('async'),
	config = require('./config/config.js'),
	db = require('mongoose'),
	mail = require('./config/service/mail.js'),
	Department = require('./model/Department.js'),
	Page = require('./model/Page.js'),
	PageInstance = require('./model/PageInstance.js'),
	Setting = require('./model/Setting.js');

// configure database connection
db.connect('mongodb://'+config.db.IP+':'+config.db.PORT+'/'+config.db.NAME);

Setting.findOne({default: true})
	.exec(function(err, setting) {
		if (err) throw err;
		if (!setting) throw 'Could not find settings with timeout';

		var timeout = setting.notificationTimeout;
		setInterval(function() {
			PageInstance.find({editedAt: {$elemMatch: {$lt: new Date(Date.now()-timeout)}}, finished: false, notified: false})
				.populate('page')
				.exec(function(err, instances) {
					if (err) throw err;

					async.each(instances, function(instance, next) {
						instance.page.populate('nextPage', function(err) {
							if (err) return next(err);
							instance.page.nextPage.populate('department', function(err) {
								if (err) return next(err);

								var latest = instance.editedAt[instance.editedAt.length-1];
								var age = Date.now()-latest.getTime();
								age /= 86400000;

								async.parallel([
									function(next2) {
										mail.sendMail({
											from: 'app@megatherium.to',
											to: instance.page.nextPage.department.email,
											subject: 'Friendly reminder',
											text: 'Der Change Request wurde seit mehr als '+parseInt(age)+' Tagen nicht mehr bearbeitet.'
										}, next2);
									},
									function(next2) {
										instance.notified = true;
										instance.save(next2);
									}
								], next);
							});
						});
					}, function(err) {
						if (err) throw err;
					});
				});
		}, 10000);
	});