exports.setup = function(app) {
	app.use(function(err, req, res, next) {
		if (!err && res.status == 200) {
			console.log('BODY=>'+res.body);
			return next();
		}

		// respond
		res.send({status: 'error', errors: ['Ein unbekannter Serverfehler ist passiert.']});

		// write error message to file
		var text = '';
		var date = new Date();
		text += date.getDate()+'.'+(date.getMonth()+1)+'.'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
		text += '   \t'+err.message+'\r\n';
		text += '\r\n'+err.stack+'\r\n\r\n';
		console.log(text);
	});
}