///<references path='_references.js' />

var alexa = require('./alexa-app');
var app = new alexa.app('game-guide');
var express = require('express')();
var bodyParser = require('body-parser');
var promise = require('promise');
var NFL = require('./nfl/schedule');

express.use(bodyParser.json());

app.pre = function(request,response,type) {
    if (request.sessionDetails.application.applicationId!="amzn1.echo-sdk-ams.app.b52af693-bd89-4263-9f29-29f019d7d9a4") {
        // Fail ungracefully
        response.fail("Invalid applicationId");
    }
};

app.intent('Team', function(request,response) {
	var schedule = new NFL();

  var teamName = request.slot('Teams', 'not found');
	if(teamName != 'not found'){
		var error = function(err){
			response.say("I could not find a game channel for this weeks game.").send();
		};
		schedule.findChannel(teamName)
			.then(function(channel){
				
				if(channel.channel == -1){
					//game over, wait till next week.
					response.say("This weeks game has already been played. Please ask again in a few days.").send();
					return;
				}
				
				response.say("The " + teamName + " will be playing on ");
				if(channel.spellOut){
					response.say("<say-as interpret-as='spell-out'>" + channel.name + "</say-as>,");
				}
				else{
					response.say(channel.name);
				}
				
				if(channel.channel != 0){
					response.say(" channel " + channel.channel);
				}
				
				response.say(" this week.").send();
			}, error);
			return false;
	}
	else{
		response.reprompt('I did not understand your request. What team would you like to find the game channel for?');
	}
});

app.error = function(exception, request, response) {
	console.log('error');
    response.say("Sorry, something bad happened");
};

app.launch(function(request,response) {
	console.log('launch');
    response.say("Hello World");
});

express.post('/',function(req,res) {
  app.request(req.body)        // connect express to alexa-app
    .then(function(response) { // alexa-app returns a promise with the response
      res.json(response);      // stream it to express' output
    });
});

express.get('/testNFL', function(req, res){
	var NFL = require('./nfl/schedule');
	var schedule = new NFL();
	
	var error = function(err) { debugger; };
	
	schedule.findChannel('saints')
		//must use full function here, because express doesn't like piping from a promise.
		.then(function(channel){
			res.json(channel);
		}, error)
		.catch(error);
});

var server = express.listen(process.env.PORT || 8833, function() {
	console.log("Listening on: " + server.address().address + server.address().port);
});