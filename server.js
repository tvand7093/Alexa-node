
var alexa = require('alexa-app');
var app = new alexa.app('italian-parser');
var express = require('express')();

app.pre = function(request,response,type) {
    if (request.sessionDetails.application.applicationId!="amzn1.echo-sdk-ams.app.b52af693-bd89-4263-9f29-29f019d7d9a4") {
        // Fail ungracefully
        response.fail("Invalid applicationId");
    }
};

app.post = function(request,response,type,exception) {
    // Always turn an exception into a successful response
    response.clear().say("An error occured: "+exception).send();
};

app.intent('Pick', function(request,response) {
    var number = request.slot('Shows');
    response.say("You picked the show "+number);
  }
);

app.error = function(exception, request, response) {
    response.say("Sorry, something bad happened");
};

app.launch(function(request,response) {
    response.say("Hello World");
});

express.post('/',function(req,res) {
  app.request(req.body)        // connect express to alexa-app
    .then(function(response) { // alexa-app returns a promise with the response
      res.json(response);      // stream it to express' output
    });
});

express.get('/',function(req,res) {
  app.request(req.body)        // connect express to alexa-app
    .then(function(response) { // alexa-app returns a promise with the response
      res.json(response);      // stream it to express' output
    });
});

var server = express.listen(process.env.PORT, function() {
	console.log("Listening on: " + server.address().address + server.address().port);
});