var async = require('async'),
	config = require('./config/config.js'),
	db = require('mongoose'),
	Department = require('./model/Department.js'),
	Page = require('./model/Page.js'),
	PageField = require('./model/PageField.js');

var t1 = Date.now();
// connect to db
db.connect('mongodb://'+config.db.IP+':'+config.db.PORT+'/'+config.db.NAME);

// create data
var departments = {
	'KAM': {},
	'BM': {},
	'E2E-PM': {},
	'PPM-PV': {},
	'PPM-SN': {},
	'PPM-ZV': {}
};
var pages = {
	'P1S1': {
		department: 'KAM',
		fields: {
			'Titel': 'TEXT',
			'Mandant': ['Postbank', 'DeuBa', 'HSH', 'HSV', 'BHW', 'IGSA'],
			'CR-Steller': ['Mandant', 'BCB'],
			'CR-Nr Mandant': 'TEXT',
			'Regulatorisch': 'BOOLEAN',
			'Status': ['Angelegt', 'Abgewiesen', 'Zurückgezogen', 'Rückfrage an Mandant', 'An PPM'],
			'Anmerkung KAM': 'LONGTEXT',
			'Link': 'TEXT'
		},
		mails: {
			'Neuer CR ({{=it.get("CR-Nr Mdt")}} {{=it.get("Titel")}})': {
				addressFields: {
					'Status': {
						'An PPM': 'martin.bories@megatherium.to'//'fma.coo-ppm-e2e@postbank.de'
					}
				}
			}
		}
	},
	'P1S2': {
		department: 'E2E-PM',
		fields: {
			'Status': ['Zurück an KAM', 'In Bearbeitung', 'Abgeschlossen'],
			'CR-Nr BCB': 'TEXT',
			'CR vom': 'DATE',
			'Termin': 'DATE',
			'Kurzbeschreibung': 'LONGTEXT',
			'Kategorie': ['Projekt IT', 'Projekt Ops', 'Prozess', 'Kontosp. Weisg'],
			'Anm. PPM': 'TEXT',
			'Weiter an': {
				type: 'SELECTMULTI',
				selectables: ['KAM', 'PPM E2E', 'PPM PV', 'PPM ZV', 'PPM SN']
			},
			'E-Mail Mandant': 'MAIL'
		},
		mails: {
			'CR zur Bearbeitung ({{=it.get("CR-Nr BCB")}})': {
				addressFields: {
					'Weiter an': {
						'PPM PV': 'martin.bories@megatherium.to',//'fma.coo-ppm-pv@postbank.de',
						'PPM ZV': 'martin.bories@megatherium.to',//'fma.coo-ppm-zv@postbank.de',
						'PPM SN': 'martin.bories@megatherium.to'//'fma.coo-ppm-sn@postbank.de'
					},
					_all: ['E-Mail Mandant']
				}
			}
		}
	},
	'P2S1': {
		headline: {
			'P1S1': ['Titel', 'Mandant', 'CR-Steller', 'CR-Nr Mandant'],
			'P1S2': ['CR-Nr BCB', 'Kurzbeschreibung', 'CR vom', 'Termin', 'Kategorie']
		},
		fields: {
			'Status': ['In Bearbeitung', 'Anfrage an PBS', 'Anfrage an Ops', 'Rückfrage an Mandant', 'zur Prüfung an BM', 'Abgeschlossen'],
			'Aufwand': 'COSTS',
			'Empfehlung Ops': 'BOOLEAN',
			'Leistbar Ops': 'BOOLEAN',
			'Name Abteilung': 'TEXT',
			'Empfehlung PPM': 'BOOLEAN',
			'Anmerkungen PPM': 'LONGTEXT',
			'Früheste Umsetzung': 'DATE',
			'Benachrichtigung an': 'MAIL',
			'Benachrichtigung': 'LONGTEXT'
		},
		mails: {
			'FTE prüfen ({{=it.get("CR-Nr BCB")}})': {
				textField: 'Benachrichtigung',
				addressFields: {
					'Status': {
						'zur Prüfung an BM': 'martin.bories@megatherium.to'
					}
				}
			},
			'{{=it.get("CR-Nr BCB")}}': {
				textField: 'Benachrichtigung',
				addressFields: ['Benachrichtigung an']
			}
		}
	},
	'P3S1': {
		department: 'BM',
		headline: {
			'P2S1': 'Aufwand'
		},
		fields: {
			'Status': ['In Bearbeitung BM', 'Abgeschlossen'],
			'Leistbar': 'BOOLEAN',
			'Leistbar ab': 'DATE',
			'Anmerkungen BM': 'LONGTEXT',
			'Benachrichtigung an': 'MAIL',
			'Benachrichtigung': 'TEXT'
		},
		mails: {
			'{{=it.get("CR-Nr BCB")}}': {
				textField: 'Benachrichtigung',
				addressFields: ['Benachrichtigung an']
			},
			'CR-Bearbeitung abgeschlossen ({{=it.get("CR-Nr BCB")}})': {
				address: 'martin.bories@megatherium.to'//'fma.coo-ppm-e2e@postbank.de'
			}
		}
	},
	'P4S1': {
		department: 'E2E-PM',
		headline: {
			'P3S1': ['Status', 'Leistbar', 'Leistbar ab', 'Anmerkungen BM']
		},
		fields: {
			'Status': ['In Bearbeitung E2E-PM', 'an COO-SB', 'an MC', 'COO-SB genehmigt', 'COO-SB abgelehnt', 'MC genehmigt', 'MC abgelehnt', 'COO-SB/MC nicht erforderlich'],
			'Anmerkungen COO-SB': 'LONGTEXT',
			'Datum COO-SB': 'DATE',
			'Anmerkungen MC': 'LONGTEXT',
			'Datum MC': 'LONGTEXT',
			'Benachrichtigung an': 'MAIL',
			'Benachrichtigung': 'LONGTEXT'
		},
		mails: {
			'{{=it.get("CR-Nr BCB")}}': {
				textField: 'Benachrichtigung',
				addressFields: ['Benachrichtigung an']
			},
			'{{=it.get("Status")}} {{=it.get("CR-Nr BCB")}}': {
				addressFields: {
					'Status': {
						'MC genehmigt': 'martin.bories@megatherium.to',
						'MC abgelehnt': 'martin.bories@megatherium.to',
						'COO-SB/MC nicht erforderlich': 'martin.bories@megatherium.to'
					}
				}
			}
		}
	},
	'P5S1': {
		department: 'KAM',
		headline: {
			'P3S1': ['Status', 'Leistbar', 'Leistbar ab', 'Anmerkungen BM'],
			'P4S1': ['Status']
		},
		fields: {
			'Status': ['In Bearbeitung KAM', 'Angebot an Mandant', 'Angebot angenommen', 'Angebot abgelehnt', 'Rückfrage an PPM', 'Rückfrage an Mandant', 'Rückfrage an BM', 'CR umgesetzt'],
			'Angebotsdaten': 'COSTS',
			'Basket': ['ja', 'nein', 'teilweise'],
			'Euro Basket': 'MONEY',
			'Anmerkungen KAM': 'LONGTEXT',
			'Benachrichtigung an': 'MAIL',
			'Benachrichtigung': 'LONGTEXT'
		},
		mails: {
			'{{=it.get("CR-Nr BCB")}}': {
				textField: 'Benachrichtigung',
				addressFields: ['Benachrichtigung an']
			}
		}
	}
};

async.parallel([
	function(next) {
		async.each(Object.keys(departments), function(departmentName, next2) {
			var department = new Department({name: departmentName});
			for (var propertyName in departments[departmentName])
				if (departments[departmentName].hasOwnProperty(propertyName)) department[propertyName] = departments[departmentName][propertyName];

			departments[departmentName] = department._id;
			department.save(next2);
		}, function(err) {
			if (err) return next(err);

			async.eachSeries(Object.keys(pages), function(name, next2) {
				var page = {obj: new Page(), fields: [], headlines: [], mails: [], name: name};
				var fields = {};
				if (pages[name].department) page.department = departments[pages[name].department];

				for (var pageName in pages[name].headline) {
					page.headlines.push(pages[pageName]._id);
				}

				async.each(Object.keys(pages[name].fields), function(fieldName, next3) {
					var obj = pages[name].fields[fieldName];
					var field = new PageField({
						page: page.obj._id,
						label: fieldName
					});
					page.fields.push(field._id);
					if (Array.isArray(obj)) {
						field.type = 'SELECT';
						field.selectables = obj;
					} else if (typeof obj === 'string') field.type = obj;
					else {
						for (var propertyName in obj)
							if (obj.hasOwnProperty(propertyName)) field[propertyName] = obj[propertyName];
					}

					fields[fieldName] = field._id;
					field.save(next3);
				}, function(err) {
					if (err) return next2(err);
					
					for (var title in pages[name].mails) {
						var obj = pages[name].mails[title];
						var mail = {title: title, addressFields: [], addressConditions: []};
						if (obj.textField) mail.textField = fields[obj.textField];
						if (Array.isArray(obj.addressFields)) {
							for (var i = 0; i < obj.addressFields.length; ++i)
								mail.addressFields.push(fields[obj.addressFields[i]]);
						} else {
							for (var fieldName in obj.addressFields) {
								if (fieldName == '_all')
									for (var i = 0; i < obj.addressFields[fieldName].length; ++i)
										mail.addressFields.push(fields[obj.addressFields[fieldName][i]]);
								else for (var value in obj.addressFields[fieldName])
									mail.addressConditions.push({
										field: fields[fieldName],
										value: value,
										address: obj.addressFields[fieldName][value]
									});
							}
						}
						page.mails.push(mail);
					}

					pages[name] = page.obj;
					delete page.obj;
					for (var propertyName in page)
						if (page.hasOwnProperty(propertyName))
							pages[name][propertyName] = page[propertyName];
					pages[name].save(next2);
				});
			}, next);
		});
	}
], function(err) {
	if (err) throw err;

	console.log('Setup finished in '+(Date.now()-t1)+'ms');
});