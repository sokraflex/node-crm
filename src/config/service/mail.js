var nodemailer = require('nodemailer'),
	smtp = require('nodemailer-smtp-transport');

var transporter = nodemailer.transport(smtp({
	host: "dressiety-de.netcup-mail.de",
	port: 587,
	auth: {
		user: 'app@dressiety.de',
		pass: 'WoR4LppWLVAjgX69ueXSwgJKLnmcT8'
	},
	debug: true
}));

module.exports = transporter;