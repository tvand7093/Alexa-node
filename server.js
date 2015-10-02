
var alexa = require('./alexa-app');
var app = new alexa.app('italian-parser');
var express = require('express')();
var bodyParser = require('body-parser');
var https = require('https');

express.use(bodyParser.json());

app.pre = function(request,response,type) {
    if (request.sessionDetails.application.applicationId!="amzn1.echo-sdk-ams.app.b52af693-bd89-4263-9f29-29f019d7d9a4") {
        // Fail ungracefully
        response.fail("Invalid applicationId");
    }
};

app.intent('Pick', function(request,response) {
	console.log('intent Pick');
    var data = request.slot('Shows', 'not found');
    response.say("You picked the show "+data);
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

var server = https.createServer(express).listen(process.env.PORT || 8833);
console.log("Listening on: " + server.address().address + server.address().port);
