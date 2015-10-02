
var alexa = require('./alexa-app');
var app = new alexa.app('italian-parser');
var express = require('express')();
var bodyParser = require('body-parser');

express.use(bodyParser.json());

app.pre = function(request,response,type) {
    if (request.sessionDetails.application.applicationId!="amzn1.echo-sdk-ams.app.b52af693-bd89-4263-9f29-29f019d7d9a4") {
        // Fail ungracefully
        response.fail("Invalid applicationId");
    }
};

app.intent('Pick', function(request,response) {
	console.log('intent Pick');
    var movieName = request.slot('Shows', 'not found');
    response.say("<p>Here is the English phrase: I <w role='ivona:VB'>like</w> watching <w role='ivona:NN'>" + movieName + ".</w></p>");
		response.say("<p>Now, here is the Italian phrase: ");
		//mi pjatʃe ɡwardando iron man.
		var mi = "miː";
		var piace = "piːjatʃe";
		var guardando = "ɡwɑrdɑndoʊ";
		var italian = "<phoneme alphabet='ipa' ph='" + mi + "'>I</phoneme> <phoneme alphabet='ipa' ph='" + piace + "'>like</phoneme>" +
			"<phoneme alphabet='ipa' ph='" + guardando + "'>watching</phoneme> <w role='ivona:NN'>" + movieName + ".</w>";
		response.say(italian + "</p>");
  }
);

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

var server = express.listen(process.env.PORT || 8833, function() {
	console.log("Listening on: " + server.address().address + server.address().port);
});