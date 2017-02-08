// Dependencies.
var express = require('express');
var router = express.Router();
var path = require('path');
var _ = require('underscore');
var requested = require('request');
var qs = require('querystring');
var alexa_app = require('alexa-app');
var alexa = new alexa_app.app('test');
var fs = require('fs');

// Global variables of the current state of the server.
var state = "tvOff";
var prevState = "tvOff";
var stSocket="off";
var prevStSocket="off";

var tefDevicesData  = {}; // Raw data from Huawei.
var tefDevicesStates = {multisensors:[],contactsensors:[],cameras:[],sockets:[]}; // Useful data to give Alexa.

 alexa.messages.NO_INTENT_FOUND = "Sorry, can you repeat?";

// This executes everytime the skill is launched.
 alexa.launch(function(request,response) {
	console.log("launching alexa\n");
	response.say("Hello, welcome to Telefonica's assistance services.");
	response.say("What can I do for you?");
	response.shouldEndSession(false);
	response.reprompt("Sorry, I didn't catch that. Could you repeat?");
 });

// Beginning of intents for the real demo (integration with Huawei).

// How many devices are currently detected.
// This intent is launched when asked "How many devices do you detect?"
 alexa.intent('InformSetupIntent',
	{
	},
	function(request,response){
		response.reprompt("Sorry, I didn't catch that. Could you repeat?");
		console.log('Estoy en InformSetupINTENT');
		prevState=state;
		state="InformGeneralStateToday";
		var numMS, numCS, numC, numS;
		numMS = tefDevicesStates.multisensors.length;
		numCS = tefDevicesStates.contactsensors.length;
		numC = tefDevicesStates.cameras.length;
		numS = tefDevicesStates.sockets.length;
		response.say("Currently Telefonica detects " + numMS + " multisensor, " + numCS + " contact sensor, " + numC + " camera and " + numS + " socket.");
		response.say("Do you need anything else?");
		response.shouldEndSession(false);
	}
 );

// Intent so Alexa tells you the most important data gathered by your devices.
// This intent is launched when asked "How is my home?"
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
			var ok = true;
			/* Right now we don't support different times, because we are not sure 
			 * wether it is an important use case or not. 
			 * We just give the data from "Right now".
		     */
			//if(time == "now"){
				state="InformGeneralStateNow";
				//response.say("Right now two doors are open, there is not movement detected by the sensors and the cameras are not recording.");
				temp = tefDevicesStates.multisensors[0].data.temperature.temperature;
				response.say("The temperature in your home right now is " + temp + " degrees celsius.");
				t = tefDevicesStates.multisensors[0].data.motion.startTime;
				console.log("startTime: " + t);
				t = t.substr(0, 4) + "-" + t.substr(4);
				t = t.substr(0, 7) + "-" + t.substr(7);
				t = t.substr(0, 13) + ":" + t.substr(13);
				t = t.substr(0, 16) + ":" + t.substr(16);
				console.log("startTime: " + t);
				t = new Date(t);
				console.log("parsed: " + t);
				today = new Date();
				today = today.getDate();
				day = t.getDate();
				console.log("day: " + day);
				console.log("today: " + today);
				day = today - day;
				console.log("day: " + day);
				minu = t.getMinutes()+"";
				if(t.getMinutes() < 10){
					minu = minu.substr(0, 0) + "0" + minu.substr(0);
				}
				if(day == 0)
					response.say("Last time movement was detected was today at "+t.getHours()+" "+minu+". .");
				else if(day == 1)
					response.say("Last time movement was detected was yesterday at "+t.getHours()+" "+minu+". .");
				else
					response.say("Last time movement was detected was "+day+" days ago at "+t.getHours()+" "+minu+". .");
				st = tefDevicesStates.contactsensors[0].data.status.status;
				response.say("Your door is " + st + " at the moment.");
				/* Camera: WIP
				response.say(".");
				*/
				networkSt = tefDevicesStates.sockets[0].status;
				if(networkSt != "OFFLINE"){
					response.say("Your socket is " + tefDevicesStates.sockets[0].data.status.status + ".");
				}
				else
					response.say("And your socket is offline.");
			/*
			}
			if(time == "today"){
				state="InformGeneralStateToday";
				response.say("Fake. Today your doors have been opened five times, there has been movement in your home ten times and there are two new recordings.");
			}
			else 
			else{
				response.say("Sorry I didn't recognized the time, can you repeat?.");
				ok = false;
			}
			*/
			if (ok){
				response.say("Do you need anything else?");
			}
			response.shouldEndSession(false);
		}
 );

// Intent so Alexa tells you the state of the device sent in the slot.
// This intent is launched when asked "What's the state of my {sensor_name}"
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
		var ok = true;
		/* Right now we don't support different times, because we are not sure 
		 * wether it is an important use case or not.
		 * Alexa just answers with the current state of the device.
		 */
		//if(time == "now"){
			if(sensor == "multi sensor"){
				state="MultiSensorNow";

				temp = tefDevicesStates.multisensors[0].data.temperature.temperature;
				//response.say("The temperature right now in your home is " + Math.round(temp) + " degrees celsius. ");
				response.say("The temperature right now in your home is " + temp + " degrees celsius. ");

				hum = tefDevicesStates.multisensors[0].data.humidity.humidity;
				response.say("The humidity in your home is " + hum + " percent. ");

				mov = tefDevicesStates.multisensors[0].data.motion.motion;
				t = tefDevicesStates.multisensors[0].data.motion.startTime;
				console.log("startTime: " + t);
				t = t.substr(0, 4) + "-" + t.substr(4);
				t = t.substr(0, 7) + "-" + t.substr(7);
				t = t.substr(0, 13) + ":" + t.substr(13);
				t = t.substr(0, 16) + ":" + t.substr(16);
				console.log("startTime: " + t);
				t = new Date(t);
				console.log("parsed: " + t);
				today = new Date();
				today = today.getDate();
				day = t.getDate();
				console.log("day: " + day);
				console.log("today: " + today);
				day = today - day;
				console.log("day: " + day);
				minu = t.getMinutes()+"";
				if(t.getMinutes() < 10){
					minu = minu.substr(0, 0) + "0" + minu.substr(0);
				}
				if(mov == "DETECTED")
					if(day == 0)
						response.say("There has been motion detected today "+" at "+t.getHours()+" "+minu+".");
					else if(day == 1)
						response.say("There has been motion detected yesterday "+" at "+t.getHours()+" "+minu+".");
					else
						response.say("There has been motion detected "+day+" days ago at "+t.getHours()+" "+minu+".");
				else
					response.say("There hasn't been motion detected.");

				bat = tefDevicesStates.multisensors[0].data.batteryLevel.batteryLevel;
				response.say("And the battery of the multisensor is " + bat + " percent. ");
			}
			else if(sensor == "door sensor" || sensor == "contact sensor"){
				state="DoorSensorNow";

				st = tefDevicesStates.contactsensors[0].data.status.status;
				if(st == "CLOSED"){
					response.say("Your door is close.");
				}
				else{
					response.say("Your door is open.");
				}

				bat = tefDevicesStates.contactsensors[0].data.batteryLevel.batteryLevel;
				response.say("And the battery of the door sensor is " + bat + " percent. ");
			}
			else if(sensor == "camera"){
				state="CameraNow";
				response.say("I'm sorry but right now the cameras are not supported.");
			}
			else if(sensor == "socket"){
				state="SocketNow";
				st = tefDevicesStates.sockets[0].data.status.status;
				networkSt = tefDevicesStates.sockets[0].status;
				if(networkSt != "OFFLINE"){
					response.say("Your socket is " + st + ".");
				}
				else
					response.say("Your socket is offline at the moment.");
			}
			else{
				state="RepeatNow";
				response.say("Sorry I didn't recognized the device, can you repeat?.");
				ok=false;
			}
		/*
		}
		else if(time == "today"){
			if(sensor == "multi sensor"){
				state="MotionSensorToday";
				response.say("Fake. Today your there has been movement in your home ten times.");
			}
			else if(sensor == "door sensor"){
				state="DoorSensorToday";
				response.say("Fake. Today your doors have been opened five times.");
			}
			else if(sensor == "camera"){
				state="CameraToday";
				response.say("Fake. Today your camera has two new recordings.");
			}
			else{
				state="RepeatToday";
				response.say("Fake. Sorry I didn't recognized the device, can you repeat?.");
				ok=false;
			}
		}
		else{
			response.say("Sorry I didn't recognized the time, can you repeat?.");
			ok=false;
		}
		*/
		if(ok){
			response.say("Do you need anything else?");
		}
		response.shouldEndSession(false);
	}
 );

// Temperature of your home.
// This intent is launched when asked "What's the temperature in my home right now?"
 alexa.intent('TemperatureIntent',
	{
	},
	function(request,response){
		response.reprompt("Sorry, I didn't catch that. Could you repeat?");
		console.log("Estoy en TemperatureIntent");
		prevState=state;
		state="Temperature";
		temp = tefDevicesStates.multisensors[0].data.temperature.temperature;
		response.say("The temperature right now in your home is " + temp + " degrees celsius. ");
		response.say("Do you need anything else?");
		response.shouldEndSession(false);
	}
 );

// Humidity of your home.
// This intent is launched when asked "What's the humidity in my home right now?"
 alexa.intent('HumidityIntent',
	{
	},
	function(request,response){
		response.reprompt("Sorry, I didn't catch that. Could you repeat?");
		console.log("Estoy en TemperatureIntent");
		prevState=state;
		state="Temperature";
		hum = tefDevicesStates.multisensors[0].data.humidity.humidity;
		response.say("The humidity in your home is " + hum + " percent. ");
		response.say("Do you need anything else?");
		response.shouldEndSession(false);
	}
 );

// Turn on/off the socket.
// This intent is launched when asked "Turn my socket {state}"
 alexa.intent('TurnXSocketIntent',
        {
         "slots":{
             "name":"NAME",
             "value":"VALUE"
         }
        },
    function(request,response) {
        response.reprompt("Sorry, I didn't catch that. Could you repeat?");
        console.log('Estoy en TurnXSocketIntent');
        stSocket = request.slot("state");
        prevState=state;
		state="TurnXSocket";
		response.say("Now your socket is " + stSocket + ".");
		response.say("Do you need anything else?");
		response.shouldEndSession(false);
 	}
 );

// Intent to finish the communication with Alexa.
 alexa.intent('EndIntent',
     	{
     	},
     	function(request,response) {
        	console.log('Estoy en devices status INTENT');
        	response.say("I hope I have helped you. Bye!");
		response.shouldEndSession(true);
     	}
 );

// Intent to make communication with Alexa more natural.
 alexa.intent('YesIntent',
     	{
     	},
     	function(request,response) {
        	console.log('Estoy en devices status INTENT');
        	response.say("Ok, what else can I do for you?");
		response.shouldEndSession(false);
     	}
 );

// Intent to make communication with Alexa more natural and end it.
 alexa.intent('NoIntent',
     	{
     	},
     	function(request,response) {
        	console.log('Estoy en devices status INTENT');
        	response.say("Ok. I hope I have have been of assistance. Good bye!");
		response.shouldEndSession(true);
     	}
 );

// End of intents for the real demo.
// Beginning of faked intents for the TV demo.

// Intent showing the UX for future development of what could happen when asked
// "What's happenned in my home since I left?"
 alexa.intent('UpdateIntent',
     	{
     	},
        function(request,response) {
                console.log('Estoy en UPDATE INTENT');
                if(prevState!="tvOff"){
                        prevState=state;
                        state="tvLastEvents";
                }
                else{
                        prevState=state;
                        state="updateUser";
                }
        	/*
        	response.say("Your door has been opened twice from the time you went to work.");
        	response.say(". . There has been an accident in the subway and all trains are delayed twenty minutes.");
        	response.say(". . And your door sensor is running out of battery.");
        	response.say(". . You can seen this and more in your TV.");
        	response.say("Do you need anything else?");
        	*/
        	response.say("Yesterday while you weren't at home a new video was recorded.");
        	//response.say(". . Today your door sensor is running out of battery and you should leave early because there has been an accident in the subway and all trains are delayed twenty minutes.");
        	response.say(". . Today your door sensor is running out of battery and you should leave early because there is higher traffic than usual due to an incident in the train network.");
        	response.say(". . You can seen this and more in your TV.");
        	response.say("Do you need anything else?");
        	response.reprompt("Sorry, I didn't catch that. Could you repeat?");
        	response.shouldEndSession(false);
        }
 );

// Intent showing the UX for future development of what could happen when asked
// to turn on the TV and show you the state of your home.
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

// Intent showing the UX for future development of what could happen when asked
// to turn off the TV and show you the state of your home.
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

// Intent showing the UX for future development of what could happen when asked
// to show you the state of your home.
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

// Intent showing the UX for future development of what could happen when asked
// to show you the last recorded videos.
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

// Intent showing the UX for future development of what could happen when asked
// to show you the last events.
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

// Intent showing the UX for future development of what could happen when asked
// to show you the devices in your home.
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

// Intent showing the UX for future development of what could happen when asked
// to play the last video recorded.
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
 
// End of faked intents.
// Begining of helper functions.

// Here we filter the data sent from the client of Huawei's platform.
// The client code is on frontend/js/controllers.js
function dataTreatment(){
	console.log("New data. Weeeeee!");
	var name, status, data;
	Object.keys(tefDevicesData).forEach(function (key){
		console.log(key);
		console.log(JSON.stringify(tefDevicesData[key].deviceInfo));
		if(tefDevicesData[key].deviceInfo.deviceType == "MultiSensor"){
			name = tefDevicesData[key].deviceInfo.name;
			status = tefDevicesData[key].deviceInfo.status;
			data = {};
			data.temperature = tefDevicesData[key].services[0].data;
			data.humidity    = tefDevicesData[key].services[1].data;
			data.batteryLevel= tefDevicesData[key].services[2].data;
			data.motion      = tefDevicesData[key].services[3].data;
			if(tefDevicesStates.multisensors.length == 0)
				tefDevicesStates.multisensors.push({"key":key,"name":name,"status":status,"data":data});
			else{
				tefDevicesStates.multisensors.forEach(function (d, index, erray){
					if(d.key != key){
						tefDevicesStates.multisensors.push({"key":key,"name":name,"status":status,"data":data});
					}
					else{
						// Currently we don't check if the data has changed. We just overwrite the previous data.
						tefDevicesStates.multisensors[index] = {"key":key,"name":name,"status":status,"data":data};
						console.log("The multisensor " + d.name + " already exists. Updated.");
					}
				});
			}
		}
		if(tefDevicesData[key].deviceInfo.deviceType == "ContactSensor"){
			console.log(key + "ContactSensor");
			name = tefDevicesData[key].deviceInfo.name;
			status = tefDevicesData[key].deviceInfo.status;
			data = {};
			data.batteryLevel= tefDevicesData[key].services[0].data;
			data.status		 = tefDevicesData[key].services[1].data;
			if(tefDevicesStates.contactsensors.length == 0)
				tefDevicesStates.contactsensors.push({"key":key,"name":name,"status":status,"data":data});
			else{
				tefDevicesStates.contactsensors.forEach(function (d, index, array){
					if(d.key != key){
						tefDevicesStates.contactsensors.push({"key":key,"name":name,"status":status,"data":data});
					}
					else{
						// Currently we don't check if the data has changed. We just overwrite the previous data.
						tefDevicesStates.contactsensors[index] = {"key":key,"name":name,"status":status,"data":data};
						console.log("The contactsensor" + d.name + " already exists. Updated.");
					}
				});
			}
		}
		if(tefDevicesData[key].deviceInfo.deviceType == "Camera"){
			console.log(key + "Camera");
			name = tefDevicesData[key].deviceInfo.name;
			status = tefDevicesData[key].deviceInfo.status;
			data = {};
			data.PROVISIONAL = tefDevicesData[key].services[0].data;
			if(tefDevicesStates.cameras.length == 0)
				tefDevicesStates.cameras.push({"key":key,"name":name,"status":status,"data":data});
			else{
				tefDevicesStates.cameras.forEach(function (d, index, array){
					if(d.key != key){
						tefDevicesStates.cameras.push({"key":key,"name":name,"status":status,"data":data});
					}
					else{
						// Currently we don't check if the data has changed. We just overwrite the previous data.
						tefDevicesStates.cameras[index] = {"key":key,"name":name,"status":status,"data":data};
						console.log("The camera" + d.name + " already exists. Updated.");
					}
				});
			}
		}
		if(tefDevicesData[key].deviceInfo.deviceType == "Socket"){
			console.log(key + "Socket");
			name = tefDevicesData[key].deviceInfo.name;
			status = tefDevicesData[key].deviceInfo.status;
			data = {};
			data.status = tefDevicesData[key].services[0].data;
			if(tefDevicesStates.sockets.length == 0)
				tefDevicesStates.sockets.push({"key":key,"name":name,"status":status,"data":data});
			else{
				tefDevicesStates.sockets.forEach(function (d, index, array){
					if(d.key != key){
						tefDevicesStates.sockets.push({"key":key,"name":name,"status":status,"data":data});
					}
					else{
						// Currently we don't check if the data has changed. We just overwrite the previous data.
						tefDevicesStates.sockets[index] = {"key":key,"name":name,"status":status,"data":data};
						console.log("The socket" + d.name + " already exists. Updated.");
					}
				});
			}
		}
	});
	console.log("tefDevicesStates: " + JSON.stringify(tefDevicesStates));
}

// End of helper functions.
// Beginning of routing for real demo.

// Where the client posts the data from Huawei.
router.post('/UpdateTef', function(req, res, next){
    console.log("Here is tefDevicesData: " + JSON.stringify(req.body));
	tefDevicesData = req.body;
	dataTreatment();
    res.status(200);
	var s;
	if(prevStSocket == stSocket){
		s = "unchanged";
	}
	else{
		prevStSocket=stSocket;
		s = stSocket;
	}
	res.json({"stSocket":s});
});

// Needed for Tizen's webapp to work as client for TV demo.
router.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

// To load the client for real demo.
router.post('/', function(req, res, next) {
    res.render('index.html');
});

// Alexa posts here when an intent is initiated.
router.post('/alexa/test',function(req,res) {
    console.log(JSON.stringify(req.body));
    alexa.request(req.body)        // connect express to alexa-app
        .then(function(response) { // alexa-app returns a promise with the response
            res.json(response);      // stream it to express' output
        });
});

// End of routing for the real demo.
// Beginning of routing for faked demo.

/*
router.get('/alexa/test', function(req, res, next) {
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/tvTurningOn.html'));
});
*/

// Change state of the server to TV demo.
router.get('/tvAlexa', function(req, res, next) {
    console.log("Apagando la TV");
    state = "tvOff";
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/tv.html'));
});

// Change state of TV to update intent.
router.get('/updateState', function(req, res, next) {
        console.log("updateState"); 
        console.log("prevState: " + prevState + " state: " + state);
        if(state != prevState){
                prevState=state;
                console.log("updateState: turning On...");
                res.status(200).send(state);
                //res.sendFile(path.join(__dirname+'/frontend/views/' + state + '.html'));
        }
        else {
                console.log("updateState: NOT turning ON...");
                res.status(200).send("nothingChanged");
        }
});

// Change state of TV to off.
router.get('/tvOff', function(req, res, next) {
    state = "tvOff";
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/tvOff.html'));
});

// Change state of TV to on.
router.get('/tvTurningOn', function(req, res, next) {
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/tvTurningOn.html'));
});

// Change state of TV to main menu.
router.get('/tvMainPage', function(req, res, next) {
    state="tvMainPage";
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/tvMainPage.html'));
});

// Change state of TV to main menu.
router.get('/updateUser', function(req, res, next) {
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/updateUser.html'));
});

// Change state of TV to play the video.
router.get('/tvPlayVideo', function(req, res, next) {
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/tvPlayVideo.html'));
});

// Change state of TV to videos menu.
router.get('/tvLastVideos', function(req, res, next) {
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/tvLastVideos.html'));
});

// Change state of TV to main menu.
router.get('/tvLastEvents', function(req, res, next) {
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/tvLastEvents.html'));
});

// Change state of TV to devices menu.
router.get('/tvDevices', function(req, res, next) {
    res.status(200);
    res.sendFile(path.join(__dirname+'/frontend/views/tvDevices.html'));
});

// End of routing for faked demo.

module.exports = router;
