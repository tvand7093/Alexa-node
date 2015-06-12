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


var alexa = new alexaApp.App('CookBook', alexaConfig.applicationId);

alexa.launch(function (request, reply) {
	reply.say("What would you like to know?");
	reply.say("You may ask me questions like: how many episodes are in a series?");
	reply.shouldEndSession(false);
});

alexa.intent('Open', function (request, reply) {
	var showName = request.slot('ShowName');
	console.log("Searching...");
	imdb.searchForShow(showName)
		.then(function(result){
			//found the one show we wanted!
			if(!Array.isArray(result)){
				imdb.getEpisodeCount(result.id)
					.then(function(result){
						console.log(result);
						reply.say("The show " + showName + " has approximatly " + result + " episodes.");
						reply.shouldEndSession(true);
					});
			}
			else{
				//multiple shows, have them pick.
				var names = "";
				for(var i = 0; i < result.length; i++){
					names += " " + result[i].name;
				}
				console.log(names);
				reply.say("Which show should I check? " + names);
			}
		})
		.catch(function(err){
			reply.say("I could not find that for you.");
			reply.shouldEndSession(true);
		});
});

alexa.sessionEnded(function (request, reply) {
	reply.say("Goodbye, enjoy your dinner.");
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
