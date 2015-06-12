var AlexaReply = require('./alexaReply'),
	AlexaRequest = require('./alexaRequest');

var alexa={ };

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
	
	this.requestHandler = function(req,reply) {
		var key;
		var response = new AlexaReply();
		
		try {
			var request = new AlexaRequest(req.payload);

			//validate that this is the correct application
			if (request.sessionDetails.applicationId != self.applicationId) {
				response.say("The application id specified is incorrect for this application.");
				reply(response.body);
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
						//if(intent != undefined && typeof intent.done == 'function') intent.done();
					}
					else {
						response.say("Sorry, the application didn't know what to do with that intent");
					}
				} catch(e) { }
			}
			else if ("LaunchRequest"===requestType) {
				if (typeof self.launchFunc=="function") {
					self.launchFunc(request,response,req,reply);
					//if(launch != undefined && typeof launch.done == 'function') launch.done();
				}
				else {
					response.say("Try telling the application what to do instead of opening it");
				}
			}
			else if ("SessionEndedRequest"===requestType) {
				if (typeof self.sessionEndedFunc=="function") {
					self.sessionEndedFunc(request,response,req,reply);
					//if(end != undefined && typeof end.done == 'function') end.done();
				}
			}
			else {
				response.say("Error: not a valid request.");
			}
			
		} catch(e) {
			console.log(e);
			response.say("Sorry, the application encountered an error.");
		}
		
		reply(response.body);
		
//		response.promise.then(function () {
//			console.log("DONE");
//			console.log(response.body);
//			return response.body;
//		}).catch(function (err) {
//			console.log("ERROR DONE");
//			console.log(err);
//			response.say(err);
//			return response.body;
//		})
//		.done(reply);
	};
	this.test = function(req,res) {
		res.render('test',{"json":self});
	};
	alexa.apps[name] = this;
}

module.exports = alexa;
