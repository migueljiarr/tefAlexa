var express = require('express');
var router = express.Router();
var path = require('path');
var _ = require('underscore');
var requested = require('request');
var qs = require('querystring');
var alexa_app = require('alexa-app');
var alexa = new alexa_app.app('test');
var fs = require('fs');

var state = "";
var prevState = "";

 alexa.messages.NO_INTENT_FOUND = "Sorry, can you repeat?";

 alexa.launch(function(request,response) {
	console.log("launching alexa\n");
	response.say("Hello, welcome to Telefonica's assistance services.");
	response.say("What can I do for you?");
	response.shouldEndSession(false);
	response.reprompt("Sorry, I didn't catch that. Could you repeat?");
 });

 alexa.intent('InformGeneralStateIntent',
     	{
         "slots":{
             "name":"NAME",
             "value":"VALUE"
         }
     	},
	function(request,response) {
		response.reprompt("Sorry, I didn't catch that. Could you repeat?");
		console.log('Estoy en InformGeneralStateINTENT');
		var time = request.slot("time");
		prevState=state;
		if(time == "today"){
			state="InformGeneralStateToday";
			response.say("Today your doors have been opened five times, there has been movement in your home ten times and there are two new recordings.");
		}
		else if(time == "now"){
			state="InformGeneralStateNow";
			response.say("Right now two doors are open, there is not movement detected by the sensors and the cameras are not recording.");
		}
		else{
			response.say("Sorry I didn't recognized the time, can you repeat?.");
		}
		response.say("Do you need anything else?");
		response.shouldEndSession(true);
	}
 );

 alexa.intent('DeviceIntent',
     	{
         "slots":{
             "name":"NAME",
             "value":"VALUE"
         }
     	},
	function(request,response) {
		response.reprompt("Sorry, I didn't catch that. Could you repeat?");
		console.log('Estoy en deviceINTENT');
		var sensor = request.slot("sensor_name");
		var time = request.slot("time");
		prevState=state;
		if(time == "now"){
			if(sensor == "motion sensor"){
				state="MotionSensorNow";
				response.say("Right now there is not movement detected by the sensors.");
			}
			else if(sensor == "door sensor"){
				state="DoorSensorNow";
				response.say("Right now there two doors open.");
			}
			else if(sensor == "camera"){
				state="CameraNow";
				response.say("Right now the cameras are not recording.");
			}
			else{
				state="RepeatNow";
				response.say("Sorry I didn't recognized the device, can you repeat?.");
			}
		}
		else if(time == "today"){
			if(sensor == "motion sensor"){
				state="MotionSensorToday";
				response.say("Today your there has been movement in your home ten times.");
			}
			else if(sensor == "door sensor"){
				state="DoorSensorToday";
				response.say("Today your doors have been opened five times.");
			}
			else if(sensor == "camera"){
				state="CameraToday";
				response.say("Today your camera has two new recordings.");
			}
			else{
				state="RepeatToday";
				response.say("Sorry I didn't recognized the device, can you repeat?.");
			}
		}
		else{
			response.say("Sorry I didn't recognized the time, can you repeat?.");
		}
		response.say("Do you need anything else?");
		response.shouldEndSession(false);
	}
 );







 alexa.intent('TurnOnTVIntent',
     	{
     	},
     	function(request,response) {
       		console.log('Estoy en status INTENT');
		prevState=state;
		state="tvTurningOn";
		response.say("Ok, now your TV is ON.");
		response.say("What do you want to do next?");
		response.reprompt("Sorry, I didn't catch that. Could you repeat?");
		response.shouldEndSession(false);
     }
 );

 alexa.intent('TurnOffTVIntent',
     	{
     	},
     	function(request,response) {
       		console.log('Estoy en status INTENT');
		revState=state;
		state="tvTurningOff";
		response.say("Ok, I've turned off your TV.");
		response.say("Do you need anything else?");
		response.shouldEndSession(false);
     	}
 );

 alexa.intent('StatusIntent',
     	{
     	},
     	function(request,response) {
       	 console.log('Estoy en status INTENT');
		prevState=state;
		state="tvMainPage";
		response.say("Ok. Now you can see the state of your home on you TV.");
		response.say("Do you need anything else?");
		response.reprompt("Sorry, I didn't catch that. Could you repeat?");
		response.shouldEndSession(false);
     	}
 );

 alexa.intent('LastVideosIntent',
     	{
     	},
     	function(request,response) {
       		console.log('Estoy en last videos INTENT');
		revState=state;
		state="tvLastVideos";
        	response.say("Here you have your last videos.");
		response.say("Do you need anything else?");
		response.reprompt("Sorry, I didn't catch that. Could you repeat?");
		response.shouldEndSession(false);
     	}
 );

 alexa.intent('LastEventsIntent',
     	{
	},
	function(request,response) {
        	console.log('Estoy en last events INTENT');
		prevState=state;
		state="tvLastEvents";
 	       	response.say("Here you have your last events.");
        	response.say("Your door has been opened twice from the time you went to work.");
	        response.say(". . There has been an accident in Cercanias trains and all trains are delayed twenty minutes.");
       		response.say(". . And your door sensor is running out of battery.");
		response.say("Do you need anything else?");
		response.reprompt("Sorry, I didn't catch that. Could you repeat?");
		response.shouldEndSession(false);
     	}
 );

 alexa.intent('DevicesStatusIntent',
     	{
     	},
     	function(request,response) {
        	console.log('Estoy en devices status INTENT');
		prevState=state;
		state="tvDevices";
        	response.say("Here you can see the state of your devices.");
        	response.say("Your door sensor is running out of battery.");
		response.say("Do you need anything else?");
		response.reprompt("Sorry, I didn't catch that. Could you repeat?");
		response.shouldEndSession(false);
     	}
 );

 alexa.intent('PlayIntent',
     	{
     	},
     	function(request,response) {
        	console.log('Estoy en devices status INTENT');
		prevState=state;
		state="tvPlayVideo";
        	response.say("Playing yesterday's video.");
		response.shouldEndSession(true);
     	}
 );

 alexa.intent('EndIntent',
     	{
     	},
     	function(request,response) {
        	console.log('Estoy en devices status INTENT');
        	response.say("I hope I have helped you. Bye!");
		response.shouldEndSession(true);
     	}
 );

 alexa.intent('YesIntent',
     	{
     	},
     	function(request,response) {
        	console.log('Estoy en devices status INTENT');
        	response.say("Ok, what else can I do for you?");
		response.shouldEndSession(false);
     	}
 );

 alexa.intent('NoIntent',
     	{
     	},
     	function(request,response) {
        	console.log('Estoy en devices status INTENT');
        	response.say("Ok. I hope I have have been of assistance. Good bye!");
		response.shouldEndSession(true);
     	}
 );






router.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

router.post('/', function(req, res, next) {
    res.render('index.html');
});

router.get('/alexa/test', function(req, res, next) {
	/* Turns on TV and shows the main page 
	 */
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/tvTurningOn.html'));
});


router.post('/alexa/test',function(req,res) {
    console.log(JSON.stringify(req.body));
    alexa.request(req.body)        // connect express to alexa-app
        .then(function(response) { // alexa-app returns a promise with the response
            res.json(response);      // stream it to express' output
        });
});

module.exports = router;
