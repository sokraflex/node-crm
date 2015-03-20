var template = function(content) {
	return function(data, callback) {
		var regex = /[ ]*\[[a-zA-Z]+\]/g;
		var compile = function() {
			var match = regex.exec(content);
			console.log(match);
			if (match != null) {
				data.get(match[0].substring(1, match[0].length-1), function(err, result) {
					if (err) return callback(err);
					content = content.substring(0, match.index)+result+content.substring(match.index+match[0].length);
					//match.index += result.length - match[0].length;
					console.log(content);
					compile();
				});
			} else callback(false, content);
		}
		compile();
	};
};

module.exports = template;