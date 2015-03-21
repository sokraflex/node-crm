var calendar = {};

calendar.workToFullDays = function(amount) {
	var day = new Date().getDay(),
		totalDays = amount;
	--day;
	for (var i = day; amount > 0; --i) {
		if (i < 0) i = 6;
		if (i == 6 || i == 0) {
			++amount;
			++totalDays;
		}
		--amount;
	}
	return totalDays;
};

calendar.toString = function(timestamp) {
	var date = new Date(timestamp);
	var str = (date.getDate() < 10 ? '0' : '')+date.getDate()+'.'+(date.getMonth() < 9 ? '0' : '')+(date.getMonth()+1)+'.'+date.getFullYear()+' ';
	str += (date.getHours() < 10) ? '0' : '' +date.getHours()+':';
	str += (date.getMinutes() < 10 ? '0' : '') +date.getMinutes();
	return str;
};

module.exports = calendar;