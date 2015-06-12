var Promise = require('promise');

module.exports = function() {
	var isWaiting = false;
	var resolve, reject;
	var prom = new Promise(function (_resolve, _reject) {
		resolve = _resolve;
		reject = _reject;
	});
	
	prom.then(function () {
		isWaiting = false;
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
	this.shouldEndSession = function(bool) {
		this.body.response.shouldEndSession = bool;
	};
	this.session = function(key,val) {
		this.body.sessionAttributes[key] = val;
	};
	this.waitUntil = function () {
		isWaiting = true;
		return resolve;
	}
	this.isWaiting = function () {
		return isWaiting;
	};
	this.cancel = function (reason) {
		isWaiting = false;
		reject(reason);
	};
	this.done = function () {
		return prom;
	};
};