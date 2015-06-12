/// <reference path="typings/node/node.d.ts"/>
var hapi = require('hapi'),
	controller = require('./alexa/controller'),
	helper = require('./alexa/helper'),
	Boom = require('boom'),
	util = require('util'),
	server = new hapi.Server(),
	alexaApp = require('./alexa/alexa');

var alexaConfig = {
	applicationId: 'amzn1.echo-sdk-ams.app.ffa2f852-7629-49a6-8c89-c7295a1f4e7e'
};

var alexaResponses = {
	launch: "LaunchRequest",
	end: "SessionEndRequest",
	intent: "IntentRequest"
};

//create the server connection on the configuration port.
server.connection({ port: process.env.port || 8080 });


var alexa = new alexaApp.App('CookBook', alexaConfig.applicationId);


alexa.launch(function(request,reply) {
  reply.say("Hello Kelly, you are my best friend!");
});

alexa.intent('number',function(request,reply) {
  var number = request.slot('number');
  reply.say("You asked for the number "+number);
});

alexa.sessionEnded(function(request,reply) {

});

//register all routes
server.route([
	{
		method: 'POST',
		path: '/alexa',
		config: {
			handler: function (request, reply) {
				
				try {
					alexa.request(request, reply);
				}
				catch (e) {
					var result = Boom.badRequest(e, {
						route: "/alexa",
						payload: request.payload
					});
					helper.log(util.inspect(result, {showHidden: false, depth: null})); 
					reply(result);
				}
			}
		}
	}
]);

server.start(function () {
	console.log('Server running at:', server.info.uri);
});
