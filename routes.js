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
var stSocket="off";
var prevStSocket="off";

var tefDevicesData  = {}; // Raw data from Huawei.
var tefDevicesStates = {multisensors:[],contactsensors:[],cameras:[],sockets:[]}; // Useful data to give Alexa.

 alexa.messages.NO_INTENT_FOUND = "Sorry, can you repeat?";

 alexa.launch(function(request,response) {
	console.log("launching alexa\n");
	response.say("Hello, welcome to Telefonica's assistance services.");
	response.say("What can I do for you?");
	response.shouldEndSession(false);
	response.reprompt("Sorry, I didn't catch that. Could you repeat?");
 });

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
				response.say("Right now the cameras are not recording.");
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
