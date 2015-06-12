var Promise = require('promise');

module.exports = function() {
	var resolve, reject;
	var prom = new Promise(function (_resolve, _reject) {
		resolve = _resolve;
		reject = _reject;
	});
			
	this.body = {
		version: "1.0",
		sessionAttributes:{},
		response: {
			shouldEndSession: true
		}
	};
	this.say = function(str) {
		if (typeof this.body.response.outputSpeech=="undefined") {
			this.body.response.outputSpeech = {
				type:"PlainText",
				text:str
			};
		}
		else {
			this.body.response.outputSpeech.text+=str;
		}
	};
	this.card = function(title,content,subtitle) {
		this.body.response.card = {
			type: "Simple",
			content: content,
			title: title,
			subtitle: subtitle
		};
	};
	
	this.cache = function() {
		return this.body.sessionAttributes;
	}
	
	this.shouldEndSession = function(bool) {
		this.body.response.shouldEndSession = bool;
	};
	this.session = function(key,val) {
		this.body.sessionAttributes[key] = val;
	};
	this.cancel = function (data) {
		reject(data);
		return prom;
	};
	this.done = function(data) {
		resolve(data);
		return prom;
	}
	this.promise = function () {
		return prom;
	};
};