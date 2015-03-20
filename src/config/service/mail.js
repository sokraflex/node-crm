var nodemailer = require('nodemailer'),
	smtp = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(smtp({
	host: "megatherium-to.netcup-mail.de",
	port: 587,
	auth: {
		user: 'app@megatherium.to',
		pass: 'LQrxxFiUGEWLnIhPKtprKJrih9ybUz'
	},
	debug: true
}));

module.exports = transporter;