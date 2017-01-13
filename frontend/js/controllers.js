var _ = require('underscore');
module.exports = function (app) {
    app.controller('mainPage', function ($scope,$http,$interval) {
        $scope.selectedIndex = 0;
        $scope.client=null;
		$scope.tefDevicesData = {};
        $scope.init= function () {
            console.log("init");
            $scope.socket = null;
            $scope.motionSensor = null;
            $scope.doorSensor = null;
            $scope.camera = null;
            $scope.socketStatus = null;
            $scope.toggling = 0;
            client = HuaweiSmarthome.Client("IFTTT-TEF",
                {
                    INFO_LOG_ON: true,
                    SHOW_HEARTBEAT: false,
                    NA_SERVER_HOST: '62.14.234.69',
                    NA_SERVER_PORT: '8443',
                    IS_SERVER_HOST: '',
                    IS_SERVER_PORT: ''
                });

            var userCredentials = {
                key: "0034123456789",
                //key: "987654321",
                secret: "Aa123456"
            };

            var deviceCollection = {};

            // Manejador del evento de forma que reconozca el SmartPlug.
            // Reconoce primero el gateway y de ahi recoge los dispositivos
            // utilizados por este.
            client.on(client.event.deviceReadyEvent, function (response) {
                var deviceDetails = JSON.parse(response);
				
				console.log("New device: " + JSON.stringify(deviceDetails));
				$scope.tefDevicesData[deviceDetails.deviceId] = deviceDetails;

                if ("GATEWAY" !== deviceDetails.deviceInfo.deviceType.toLocaleUpperCase() && !deviceCollection[deviceDetails.deviceId]) {
                    document.getElementById("userOut").innerHTML = "Estado: Conectado.";
                    deviceCollection[deviceDetails.deviceId] = client.Device(deviceDetails.deviceInfo.nodeId).fit(deviceDetails);
                    $scope.socketStatus=null;
                    toggling=0;
                }
                if ("MULTISENSOR" === deviceDetails.deviceInfo.deviceType.toLocaleUpperCase()) {
                    let multiSensorData = {};
                    for (let index in deviceDetails.services) {
                        if (deviceDetails.services[index].data !== null && deviceDetails.services[index].data.temperature) {
                            multiSensorData.temperature = deviceDetails.services[index].data.temperature;
                        }
                        if (deviceDetails.services[index].data !== null && deviceDetails.services[index].data.humidity) {
                            multiSensorData.humidity = deviceDetails.services[index].data.humidity;
                        }
                        if (deviceDetails.services[index].data !== null && deviceDetails.services[index].data.motion) {
                            multiSensorData.motion = deviceDetails.services[index].data.motion;
                        }
						console.log("New multiSensor: " + JSON.stringify(multiSensorData));
                    }
                }
                if ("DOORWINDOW" === deviceDetails.deviceInfo.deviceType.toLocaleUpperCase()) {
                    let doorWindowSensorData = {};
                    if (deviceDetails.services[0].data !== null && deviceDetails.services[0].data.batteryLevel) {
                        doorWindowSensorData.batteryLevel = deviceDetails.services[index].data.batteryLevel;
                    }
                    if (deviceDetails.services[1].data !== null && deviceDetails.services[1].data.status) {
                        doorWindowSensorData.status = deviceDetails.services[index].data.status;
                    }
					console.log("New DoorWindowSensor: " + JSON.strigify(doorWindowSensorData));
                }
                if ("CAMERA" === deviceDetails.deviceInfo.deviceType.toLocaleUpperCase()) {
					console.log("New Camera: " + JSON.stringify(deviceDetails));
/*
                    let doorWindowSensorData = {};
                    if (deviceDetails.services[0].data !== null && deviceDetails.services[0].data.batteryLevel) {
                        doorWindowSensorData.batteryLevel = deviceDetails.services[index].data.batteryLevel;
                    }
                    if (deviceDetails.services[1].data !== null && deviceDetails.services[1].data.status) {
                        doorWindowSensorData.status = deviceDetails.services[index].data.status;
                    }
*/
                }

                // Socket
                if ("Socket".toLocaleUpperCase() === deviceDetails.deviceInfo.deviceType.toLocaleUpperCase() && $scope.socketStatus==null) {
                    console.log("Socket: " + deviceDetails);
                    document.getElementById("userOut").innerHTML = "Estado: Smartplug detectado.";
                    $scope.socketStatus=deviceDetails.services[0].data.status;
                    console.log("socketStatus: " + $scope.socketStatus);
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


                    $scope.socket = deviceCollection[deviceDetails.deviceId];

                }
                if ("Socket".toLocaleUpperCase() === deviceDetails.deviceInfo.deviceType.toLocaleUpperCase() && $scope.socketStatus!=null && toggling==1) {
                    console.log("Socket: " + deviceDetails);
                    $scope.socketStatus=deviceDetails.services[0].data.status;
                    console.log("socketStatus: " + $scope.socketStatus);
                    console.log("toggling...");
                    if($scope.socketStatus=="OFF"){
                        document.getElementById("userOut").innerHTML = "Estado: smartplug encendido.";
                        $scope.socket.buttons.SocketON.pressAndRelease();
                    }
                    if($scope.socketStatus=="ON"){
                        document.getElementById("userOut").innerHTML = "Estado: smartplug apagado.";
                        $scope.socket.buttons.SocketOFF.pressAndRelease();
                    }
                    toggling=0;
                }

            })
            client.signInWithCredentials(userCredentials);
            console.log("end init");
        }

        $scope.init();

        $scope.turnOn= function () {
            document.getElementById("userOut").innerHTML = "Estado: smartplug encendido.";
            $scope.socket.buttons.SocketON.pressAndRelease();
        }

        $scope.turnOff= function () {
            document.getElementById("userOut").innerHTML = "Estado: smartplug apagado.";
            $scope.socket.buttons.SocketOFF.pressAndRelease();
        };

        $scope.toggle= function () {
            console.log("Retrieving socket info from server");
            toggling=1;
            client.getDeviceDetails($scope.socket.deviceId);
            console.log("Retrieved");
        };

        $scope.updateTef = function () {
		$http.post('/UpdateTef',$scope.tefDevicesData)
                .then(function (data) {
                	console.log('During /UpdateTef: ');
	                console.log(JSON.stringify(data));
       			console.log('End /UpdateTef treatment.');
                });
	};
        var interval = $interval($scope.updateTef,5000);

        // var stopTime = $interval(setSmartplug, 1000);
        function setSmartplug() {
            //console.log('Im ready to send the request');
            $http.get('/api/smartplug/status')
                .success(function (data) {
                    if(data.state == true){
						console.log("state is true");
						alert("Ha llegado un evento de IFTTT");
                        if(data.light == true){
                            //lo que tengas que hacer para encender smartplug aqui
							console.log("YayON!!");
                            $scope.turnOn()
                        }
                        else{
                            //lo que tengas que hacer para apagar smartplug aqui
							console.log("YayOFF!!");
                            $scope.turnOff()
                        }
					}
					else{
						console.log("state is false");
					}
				})
				.error(function(data){
					console.log("error");
				})
        }

        //var interval = $interval(setSmartplug,5000);

        $scope.contactWithGW = function () {
            $scope.pepe = {};
            console.log('hey!');
            $http.get("/api/test")                            /*get: coger datos de un url*/
                .success(function(data){
                    $scope.pepe = data;
                })
                .error(function (error) {
                    $scope.pepe = error;
                })
        };

        $scope.updateLight = function (light) {
            $http.post('/api/update/light', light)
                .success(function (data) {
                    console.log('all is right');
                    console.log(data);
                })
                .error(function (error) {
                    console.log(error);
                })
        };

        $scope.next = function (){
            console.log('pepe');
            $scope.selectedIndex = Math.max($scope.selectedIndex +1, 2);
        };
        $scope.previous= function(){
            console.log('popo');
            $scope.selectedIndex = Math.min($scope.selectedIndex -1, 0);
        }
    });
    app.controller('mainCtrl', function ($scope,$http) {

    })
};
