var bodyParser = require('body-parser'),
	config = require('./config/config.js'),
	db = require('mongoose'),
	encryption = require('encryption'),
	express = require('express'),
	fs = require('fs'),
	jade = require('jade');

// configurate encryption
encryption.config('SALT_WORK_FACTOR', config.PASSWORD_SALT_WORK_FACTOR);

// configure database connection
db.connect('mongodb://'+config.db.IP+':'+config.db.PORT+'/'+config.db.NAME);

// initialise webserver
var app = express();

// serve static css files
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use("/css", express.static("./template/css"));

// enable autorendering templates
app.use(function(req, res, next) {
	var send = res.send.bind(res);
	res.send = function(content) {
		console.log(content);
		if (typeof content === 'string') return send(content);
		if (!content.template) return send(content);

		fs.readFile('./template/'+content.template+'.jade', function(err, tpl) {
			if (err) {
				console.log(err);
				return send('bambambam... error, sry pplz');
			}

			var fn = jade.compile(tpl, {filename: './template/'+content.template+'.jade'});
			var response = fn(content.errors ? content : content.data);
			send(response);
		});
	};
	next();
});

// add controllers
[
	'User'
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