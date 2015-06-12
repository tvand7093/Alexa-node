var alexa={};

alexa.Response = function() {
	this.response = {
		"version": "1.0",
		"sessionAttributes":{},
		"response": {
			"shouldEndSession": true
		}
	};
	this.say = function(str) {
		if (typeof this.response.response.outputSpeech=="undefined") {
			this.response.response.outputSpeech = {"type":"PlainText","text":str};
		}
		else {
			this.response.response.outputSpeech.text+=str;
		}
	};
	this.card = function(title,content,subtitle) {
		this.response.response.card = {"type":"Simple","content":content,"title":title,"subtitle":subtitle};
	};
	this.shouldEndSession = function(bool) {
		this.response.response.shouldEndSession = bool;
	};
	this.session = function(key,val) {
		this.response.sessionAttributes[key] = val;
	};
};

alexa.Request = function(json) {
	this.data = json;
	this.slot = function(slot_name,default_value) {
		try {
			return this.data.request.intent.slots[slot_name].value;
		} catch(e) {}
		return default_value;
	};
	this.type = function() {
		try {
			return this.data.request.type;
		} catch(e) { }
		return null;
	};
	this.sessionDetails = {
		"new":this.data.session.new,
		"sessionId":this.data.session.sessionId,
		"userId":this.data.session.userId,
		"attributes":this.data.session.attributes
	};
	this.userId = this.data.session.userId;
	this.sessionId = this.data.session.sessionId;
	this.sessionAttributes = this.data.session.attributes;
	this.isSessionNew = (true===this.data.session.new);
	this.session = function(key) {
		try {
			return this.data.session.attributes[key];
		} catch(e) { }
		return;
	};
};

alexa.apps = {};

alexa.App = function(name, applicationId, endpoint) {
	var self = this;
	this.endpoint = endpoint;
	this.intents = {};
	this.intent = function(intentName,schema,func) {
		if (typeof schema=="function") { 
			func = schema;
			schema = null;
		}
		this.intents[intentName] = {"function":func};
		if (schema) {
			this.intents[intentName].schema = schema;
		}
	};
	this.launchFunc = null;
	this.launch = function(func) {
		this.launchFunc = func;
	};
	this.sessionEndedFunc = null;
	this.sessionEnded = function(func) {
		this.sessionEndedFunc = func;
	};
	this.applicationId = applicationId;
	
	this.request = function(req,reply) {
		try {
			var key;
			var response = new alexa.Response();

			var request = new alexa.Request(req.payload);
			
			//validate that this is the correct application
			if (request.payload.session.application.applicationId != self.applicationId) {
				response.say("The application id specified is incorrect for this application.");
				reply(response.response);
				return;
			}
			
			// Copy all the session attributes from the request into the response so they persist.
			// This should happen by default, but it seems to be a bug in the Alexa API (?)
			if (request.sessionAttributes) {
				for (key in request.sessionAttributes) {
					response.session(key, request.sessionAttributes[key]);
				}
			}
			var requestType = request.type();
			if ("IntentRequest"===requestType) {
				try {
					var func = self.intents[req.payload.request.intent.name]['function'];
					if (typeof func=="function") {
						func(request,response,req,reply);
					}
					else {
						response.say("Sorry, the application didn't know what to do with that intent");
					}
				} catch(e) { }
			}
			else if ("LaunchRequest"===requestType) {
				if (typeof self.launchFunc=="function") {
					self.launchFunc(request,response,req,reply);
				}
				else {
					response.say("Try telling the application what to do instead of opening it");
				}
			}
			else if ("SessionEndedRequest"===requestType) {
				if (typeof self.sessionEndedFunc=="function") {
					self.sessionEndedFunc(request,response,req,reply);
				}
			}
			else {
				response.say("Error: not a valid request");
			}
			
		} catch(e) {
			response.say("Sorry, the application encountered an error");
		}
		reply(response.response);
	};
	this.test = function(req,res) {
		res.render('test',{"json":self});
	};
	alexa.apps[name] = this;
}

module.exports = alexa;
