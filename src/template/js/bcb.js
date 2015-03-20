var bcb = {};

/**
 * AKtualisiert die Summe der Kosten in einem Laufzettel / ChangeRequestReply.
 */
bcb.updateSum = function(sequence) {
	var fields = ['Materials', 'It', 'FTEOps', 'FTEPPM'];
	if (sequence != 'ongoing') fields = ['Materials', 'ItPT', 'PTOps', 'PTPPM'];

	var sum = 0;
	for (var i = 0; i < fields.length; ++i) {
		var value = parseInt(document.getElementById(sequence+fields[i]).value);
		if (!isNaN(value)) sum += value;
	}

	sum += ' €';
	document.getElementById('sum'+sequence.substring(0, 1).toUpperCase()+sequence.substring(1)).innerHTML = sum;
}