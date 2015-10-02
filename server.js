///<reference path="alexa/alexa-client.js" />

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

app.intent('Pick',
  {
    "slots":{"number":"NUMBER"}
    ,"utterances":[ "say the number {1-100|number}" ]
  },
  function(request,response) {
    var number = request.slot('Show');
    response.say("You picked the show "+number);
  }
);

app.launch(function(request,response) {
    response.say("Hello World");
});

app.express(express, "/echo/", false );

var server = express.listen(process.env.PORT, function() {
	console.log("Listening on: " + server.address().address + server.address().port);
});