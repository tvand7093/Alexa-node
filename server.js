/// <reference path="typings/node/node.d.ts"/>
var hapi = require('hapi'),
	controller = require('./alexa/controller'),
	helper = require('./alexa/helper'),
	Boom = require('boom'),
	util = require('util'),
	server = new hapi.Server(),
	alexaApp = require('./alexa/alexa'),
	alexa = new alexaApp.App('CookBook');

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

alexa.launch(function(request,response) {
  response.say("Hello World");
  response.card("Hello World","This is an example card");
});

alexa.intent('number',function(request,response) {
  var number = request.slot('number');
  response.say("You asked for the number "+number);
});

alexa.sessionEnded(function(request,response) {
    //logout( request.userId );
    // No response necessary
});

//register all routes
server.route([
	{
		method: 'POST',
		path: '/alexa',
		config: {
			handler: function (request, reply) {
				
				var result = null;
				try {
					
					if (request.payload.session.application.applicationId != alexaConfig.applicationId) {
						return Boom("The application id specified is incorrect for this application.", alexa);
					}
					
					alexa.request(request, reply);

//					if (alexa.request.type == alexaResponses.end){
//						console.log("END");
//						result = controller.end(data);
//					}
//					else if (alexa.request.type == alexaResponses.intent){
//						console.log("INTENT");
//						result = controller.intent(data);
//					}
//					
//					else if (alexa.request.type == alexaResponses.launch){
//						console.log("LAUNCH");
//						result = controller.launch(data);
//					}
//					else
//						result = Boom("Unknown request type recieved.");
				}
				catch (e) {
					result = Boom.badRequest(e, {
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
