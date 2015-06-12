/// <reference path="typings/node/node.d.ts"/>
var hapi = require('hapi'),
	helper = require('./alexa/helper'),
	Boom = require('boom'),
	util = require('util'),
	server = new hapi.Server(),
	imdb = require('./imdb/controller'),
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


var alexa = new alexaApp.App('MyShows', alexaConfig.applicationId);

alexa.launch(function (request, reply) {
	console.log("START LAUNCH");
	reply.say("What would you like to know?");
	reply.say("You may ask me questions like: how many episodes are in a series?");
	reply.shouldEndSession(false);
	console.log("END LAUNCH");
});

alexa.intent('Open', function (request, reply) {
	var showName = request.slot('ShowName');
	console.log("Searching...");
	return imdb.searchForShow(showName)
		.then(function(result){
			console.log("Found shows.\n");
			
			//found the one show we wanted!
			if(!Array.isArray(result)){
				console.log(result);
				imdb.getEpisodeCount(result.id)
					.then(function(result){
						console.log(result);
						reply.say("The show " + showName + " has around " + result + " episodes.");
						reply.shouldEndSession(true);
					});
			}
			else{
				//multiple shows, have them pick.
				var names = result.join(', ');
				console.log(names);
				reply.say("I found a few shows with that name, pick one of the following: " + names + '?');
			}
		})
		.catch(function(err){
			reply.say("I could not find that for you.");
			reply.shouldEndSession(true);
		})
		.done();
});

alexa.sessionEnded(function (request, reply) {

});

//register all routes
server.route([
	{
		method: 'POST',
		path: '/alexa',
		config: {
			handler: function (request, reply) {

				try {
					alexa.requestHandler(request, reply);
				}
				catch (e) {
					var result = Boom.badRequest(e, {
						route: "/alexa",
						payload: request.payload
					});
					helper.log(util.inspect(result, { showHidden: false, depth: null }));
					reply(result);
				}
			}
		}
	}
]);

server.start(function () {
	console.log('Server running at:', server.info.uri);
});
