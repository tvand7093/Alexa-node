/// <reference path="typings/node/node.d.ts"/>
var hapi = require('hapi'),
	controller = ('./alexa/controller'),
	Boom = require('boom'),
	server = new hapi.Server();

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

//register all routes
server.route([
	{
		method: 'POST',
		path: '/alexa',
		config: {
			handler: function (request, reply) {
				var result = null;
				try {
					var alexa = request.body;
					
					if (alexa.application.applicationId != alexaConfig.applicationId) {
						return Boom("The application id specified is incorrect for this application.", alexa);
					}

					var data = alexa.request;

					if (alexa.request.type == alexaResponses.end)
						result = controller.end(data);
					else if (alexa.request.type == alexaResponses.intent)
						result = controller.intent(data);
					else if (alexa.request.type == alexaResponses.launch)
						result = controller.launch(data);
					else
						result = Boom("Unknown request type recieved.");

				}
				catch (e) {
					result = Boom.badRequest(e, {
						route: "/alexa",
						body: request.body
					});
				}
				reply(result);
			}
		}
	}
]);

server.start(function () {
	console.log('Server running at:', server.info.uri);
});
