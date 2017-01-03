// Este fichero no se esta utilizando.
// Se ejecuta directamente el codigo de /frontend/dist/app.js
module.export {
	init: init(),
	turnOn: turnOn(),
	turnOff: turnOff();
};

	function init(){
		var socket = null;
		var client = HuaweiSmarthome.Client("IFTTT-TEF",
		{
			INFO_LOG_ON: true,
			SHOW_HEARTBEAT: false,
			NA_SERVER_HOST: '62.14.234.69',
			NA_SERVER_PORT: '8443',
			IS_SERVER_HOST: '',
			IS_SERVER_PORT: ''
		});

		var userCredentials = {
			key: "0034600000000",
			secret: "CCpruebas_1"
		};

		var deviceCollection = {};

		// Manejador del evento de forma que reconozca el SmartPlug.
		// Reconoce primero el gateway y de ahi recoge los dispositivos 
		// utilizados por este.
		client.on(client.event.deviceReadyEvent, function (response) {
			var deviceDetails = JSON.parse(response);
            
			if ("GATEWAY" !== deviceDetails.deviceInfo.deviceType.toLocaleUpperCase() && !deviceCollection[deviceDetails.deviceId]) {
				deviceCollection[deviceDetails.deviceId] = client.Device(deviceDetails.deviceInfo.nodeId).fit(deviceDetails);
			}
            // Socket
            if ("Socket".toLocaleUpperCase() === deviceDetails.deviceInfo.deviceType.toLocaleUpperCase()) {
				console.log("Weeee!");
				console.log("Socket: " + deviceDetails.stringify());
				deviceCollection[deviceDetails.deviceId].addButton('SocketON', {  // commandObjectDefinition
					description: 'This is the button to turn on the socket.',
				    deviceId: deviceDetails.deviceId,
                    serviceId: "Switch",
                    header: {
                        from: "/users/" + userCredentials.key,
                        method: "SWITCH",
                        mode: "NOACK"
                    },
                    body: {
                        status: "ON"
                    }
                    }, [function () {
                        this.do(this.buttons.SocketON.command, client.access_token);
                    }]
				);

				deviceCollection[deviceDetails.deviceId].addButton('SocketOFF', {  // commandObjectDefinition
				    description: 'This is the button to turn off the socket.',
				    deviceId: deviceDetails.deviceId,
				    serviceId: "Switch",
				    header: {
				        from: "/users/" + userCredentials.key,
				        method: "SWITCH",
				        mode: "NOACK"
				    },
				    body: {
				        status: "OFF"
				    }
                    }, [function () {
                        this.do(this.buttons.SocketOFF.command, client.access_token);
                    }]
				);

               
				socket = deviceCollection[deviceDetails.deviceId];

            }
        })
        client.signInWithCredentials(userCredentials);
	}


	function turnOn(){
		socket.buttons.SocketON.pressAndRelease();
    }

	function turnOff(){
		socket.buttons.SocketOFF.pressAndRelease();
    }
