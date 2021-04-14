// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const ytlist = require("yt-list");
const search = require("ytdl-core");

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Hey Tube. ask to play a video to start listening';
        const repromptOutput = 'You can say, play the Whitesnake, to begin.'
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
    }
};

const GetVideoIntentHandler = {
    async canHandle(handlerInput) {
        return(
            Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === "GetVideoIntent"
        );
    },
    handle(handlerInput) {
        console.log("GetVideo")
        const speechText = 
        handlerInput.requestEnvelope.request.intent.slots.videoQuery.value;
        if (speechText) {
            return controller.search(handlerInput, speechText);
        } else {
            return handlerInput.responseBuilder
            .speak("You can say, play Whitesnake, to begin.")
            .getResponse();
        }
    }
};

const controller = {
    async search(handlerInput, query) {
        console.log(query);
        const data = await searchForVideos(query);
        return this.play(handlerInput, data.items[0]);
    },
    async play(handlerInput, audioInfo) {
        const {responseBuilder} = handlerInput;
        const playBehaviour = "REPLACE_ALL";
        console.log("play");
        console.log("audioInfo");
        const audioFormat = await getAudioUrl(audioInfo.id.videoId);
        responseBuilder
            .speak(`Playing ${audioInfo.snippet.title}`)
            .withShouldEndSession(true)
            .addAudioPlayerPlayDirective(
                playBehaviour,
                audioFormat.url,
                audioInfo.id.videoId,
                0,
                null
            );
        return responseBuilder.getResponse();
    },
    async stop(handlerInput, message) {
        return handlerInput.responseBuilder
        .speak(message)
        .addAudioPlayerStopDirective()
        .getResponse();
    }
}
const searchForVideos = async (searchQuery, nextPageToken, amount) => {
    return await ytlist.searchVideos(searchQuery, nextPageToken, amount);

}
const getAudioUrl = async (videoId) => {
    const audioInfo = await ytdl.getInfo(videoId, {});
    const audioFormat = await ytdl.chooseFormat(audioInfo.formats, {
        quality: "140",
    });
    return audioFormat;
}
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')||
                    Alexa.getIntentName(handlerInput.requestEnvelope) ===
                     "AMAZON.PauseIntent";
    },
    handle(handlerInput) {
        console.log("CancelAndStopIntentHandler")
        const speakOutput = 'Goodbye!';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetVideoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
