
//{
//  "version": "string",
//  "sessionAttributes": {
//    "string": object
//  },
//  "response": {
//    "outputSpeech": {
//      "type": "string",
//      "text": "string"
//    },
//    "card": {
//      "type": "string",
//      "title": "string",
//      "content": "string"
//    },
//    "reprompt": {
//      "outputSpeech": {
//        "type": "string",
//        "text": "string"
//      }
//    },
//    "shouldEndSession": true
//  }
//}
var helper = require('./helper');

var speech = {
	outputSpeech: {
		type: "PlainText",
		text: ""
	}
};
var responseBase = {
	version: "1.0",
	response: {
		shouldEndSession: false
	}
};

var defaultBase = {
	version: "1.0",
	response: {
		shouldEndSession: false
	}
};

function generateResponse(text, reprompt, endSession){
	var response = responseBase;
	
	response.shouldEndSession = endSession;
	
	if(text){
		response.response.speech = speech;
		response.response.speech.outputSpeech.text = text;
	}
	
	if(reprompt){
		response.response.reprompt = speech;
		response.response.reprompt.outputSpeech.text = reprompt;
	}
	
	responseBase = defaultBase;
	
	console.log("REPLYING");
	helper.log(response);
	
	return response;
}

module.exports = {
	launch: function(data) {
		console.log("Launching application from alexa!");
		helper.log(data);
		return generateResponse("Hello world!", null, false);
	},
	intent: function(data) {
		console.log("Intent from alexa!");
		console.log("Intent: " + data.intent.name);
		console.log("Slots!!!!");
		
		return generateResponse("Hello Tyler. I know you love kelly!", null, false);
	},
	end: function(data) {
		console.log("Session ended from alexa!");
		return generateResponse(null, null, true);
	}
};

//"request": {
//    "type": "IntentRequest",
//    "requestId": " amzn1.echo-api.request.0000000-0000-0000-0000-00000000000",
//    "timestamp": "2015-05-13T12:34:56Z",
//    "intent": {
//      "name": "GetZodiacHoroscopeIntent",
//      "slots": {
//        "ZodiacSign": {
//          "name": "ZodiacSign",
//          "value": "virgo"
//        }
//      }
//    }