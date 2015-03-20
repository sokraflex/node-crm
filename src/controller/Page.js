var Page = require('../model/Page.js');

exports.setup = function(app) {
	app.get('/PageList', function(req, res, jump) {
		res.locals.session.hasPermission('page.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie besitzen nicht die notwendigen Berechtigungen, um alle Seiten auflisten zu können.']});

			Page.find()
				.populate('department')
				.populate('fields')
				.exec(function(err, pages) {
					if (err) return jump(err);

					res.send({template: 'PageList', data: {pages: pages}});
				});
		});
	});
}