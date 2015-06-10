// ALEXA RESPONSE
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

// ALEXA REQUEST
//	{
//  "version": "string",
//  "session": {
//    "new": boolean,
//    "sessionId": "string",
//    "application": {
//      "applicationId": "string"
//    },
//	LAUNCH
//    "request": {
//	    "type": "LaunchRequest",
//	    "requestId": "request.id.string",
//	    "timestamp": "string"
//	  }
// 	INTENT
//		{
//		  "type": "IntentRequest",
//		  "requestId": "string",
//		  "timestamp": "string",
//		  "intent": {
//		    "name": "string",
//		    "slots": {
//		      "string": {
//		        "name": "string",
//		        "value": "string"
//		      }
//		    }
//		  }
//		}
// 	END SESSION
//		{
//		  "type": "SessionEndedRequest",
//		  "requestId": "string",
//		  "timestamp": "string",
//		  "reason": "string"
//		}
//		//  }
//}