var bodyParser = require('body-parser'),
	config = require('./config/config.js'),
	db = require('mongoose'),
	encryption = require('encryption'),
	express = require('express'),
	fs = require('fs'),
	jade = require('jade'),
	multer = require('multer'),
	File = require('./model/File.js'),
	Session = require('./model/Session.js');

// configurate encryption
encryption.config('SALT_WORK_FACTOR', config.PASSWORD_SALT_WORK_FACTOR);

// configure database connection
db.connect('mongodb://'+config.db.IP+':'+config.db.PORT+'/'+config.db.NAME);

// initialise webserver
var app = express();

// serve static css files
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use("/css", express.static("./template/css"));
app.use('/js', express.static('./template/js'));
app.use(multer({
	dest: './files/',
	rename: function(fieldname, filename, req, res) {
		res.locals.file = new File();
		return res.locals.file._id;
	}
}));

// enable autorendering templates
app.use(function(req, res, next) {
	var send = res.send.bind(res);
	res.send = function(content) {
		if (typeof content === 'string') return send(content);
		if (content.errors) content.status = 'error';
		if (content.status == 'error' && !content.template) content.template = 'Error';
		if (!content.template) return send(content);
		if (!content.hasOwnProperty('data')) content.data = {};
		if (content.status == 'success' && !content.data.hasOwnProperty('status')) content.data.status = 'success';
		if (req.query.sessionId && res.locals.session && !content.data.hasOwnProperty('sessionId')) content.data.sessionId = req.query.sessionId;
		if (res.locals.session && !content.sessionId) content.sessionId = res.locals.session._id;
		if (res.locals.session && res.locals.session.user && !content.userId) content.userId = res.locals.session.user;

		fs.readFile('./template/'+content.template+'.jade', function(err, tpl) {
			if (err) {
				console.log(err);
				return res.send(JSON.stringify(content));
			}

			var fn = jade.compile(tpl, {filename: './template/'+content.template+'.jade'});
			var response = fn(content);
			send(response);
		});
	};
	next();
});

// handle sessionId field
app.all('*', function(req, res, callback) {
	if (!req.query.sessionId) return callback();

	Session.findOne({_id: req.query.sessionId})
		.exec(function(err, session) {
			if (err) return res.send(err);

			res.locals.session = session;
			callback();
		});
});

// add controllers
[
	'ChangeRequest',
	'Customer',
	'Department',
	'File',
	'Home',
	'Page',
	'PageField',
	'PageInstance',
	'Permission',
	'User',
	'Usergroup'
].map(function(controllerName) {
	require('./controller/'+controllerName+'.js').setup(app);
});

// start webserver
require('./router/ErrorRouter.js').setup(app);

var server = app.listen(2000, function() {
	var host = server.address().host;
	var port = server.address().port;

	console.log('started server on http://'+host+':'+port);
});