var util = require('util');

module.exports = {
	log: function(object){
		console.log(util.inspect(object, {showHidden: false, depth: null}));
	}
};