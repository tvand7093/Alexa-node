
module.exports.AlexaResponse = function() {
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
};