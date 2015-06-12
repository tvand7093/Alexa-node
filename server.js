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

alexa.launch(function (req, alexa, request, reply) {
	alexa.say("What would you like to know?");
	alexa.say("You may ask questions like: how many episodes are in a series?");
	alexa.shouldEndSession(false);
	reply(alexa.body);
});

alexa.intent('Open', function (req, alexa, request, reply) {
	var showName = req.slot('ShowName');
	
	if(showName != undefined && showName != null) 
		showName = showName.toLowerCase();
	else{
		alexa.say('I could not understand you.', 'What did you say?');
	}
		
	return imdb.searchForShow(showName, alexa)
		.then(function(result){
			
			//found the one show we wanted!
			if(!Array.isArray(result)){
				helper.log(result);
				imdb.getEpisodeCount(result.id)
					.then(function(count){
						console.log(count);
						alexa.say("The show " + result.name + " has around " + count + " episodes.");
						alexa.shouldEndSession(true);
						return alexa.body;
					})
					.done(reply);
			}
			else{
				alexa.shouldEndSession(false);
				var names = "";
				//multiple shows, have them pick.
				for(var i = 0; i < result.length; i++){
					if(i == 0){
						//skip adding 
						names += result[i].name;
						continue;
					}
					
					names += ", ";
					
					if(i == result.length - 1){
						names += "or ";
					}
					
					names += result[i].name;
				}
				
				helper.log(names);
				alexa.say("I found a few shows with that name, pick one of the following: " + names + '?');
				reply(alexa.body);
			}
		})
		.catch(function(err){
			alexa.say("I could not find that for you.");
			alexa.shouldEndSession(true);
			reply(alexa.body);
		});
});

alexa.sessionEnded(function (req, alexa, request, reply) {
	reply(alexa.body);
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
					helper.log(result);
					reply(result);
				}
			}
		}
	}
]);

server.start(function () {
	console.log('Server running at:', server.info.uri);
});
