var hapi = require('hapi'),
	controller = new ('./alexa/controller'),
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
server.connection({ port: 8080 });

//register all routes
server.route([
{
	method: 'POST',
	path: '/alexa',
	config: {
		handler: function(request, result){
			var alexa = request.body;
			if(alexa.application.applicationId != alexaConfig.applicationId){
				return Boom("ApplicationId is incorrect.");
			}
			
			var data = alexa.request;
			
			if(alexa.request.type == alexaResponses.end)
				return controller.end(data);
			else if(alexa.request.type == alexaResponses.intent)
				return controller.intent(data);
			else if(alexa.request.type == alexaResponses.launch)
				return controller.launch(data);
			else
				return Boom("Unknown request type recieved.");
			
		}
	}
}
]);

server.start(function () {
	console.log('Server running at:', server.info.uri);
});
