var _ = require('underscore');
module.exports = function (app) {
    app.controller('mainPage', function ($scope,$http,$interval) {
        $scope.selectedIndex = 0;
        $scope.client=null;
        $scope.init= function () {
            console.log("init");
            $scope.socket = null;
            $scope.socketStatus = null;
            $scope.toggling = 0;
            console.log("init1");
            client = HuaweiSmarthome.Client("IFTTT-TEF",
                {
                    INFO_LOG_ON: true,
                    SHOW_HEARTBEAT: false,
                    NA_SERVER_HOST: '62.14.234.67',
                    NA_SERVER_PORT: '8443',
                    IS_SERVER_HOST: '',
                    IS_SERVER_PORT: ''
                });
            console.log("init2");

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

                if ("GATEWAY" !== deviceDetails.deviceInfo.deviceType.toLocaleUpperCase() && !deviceCollection[deviceDetails.deviceId]) {
                    document.getElementById("userOut").innerHTML = "Estado: Conectado.";
                    deviceCollection[deviceDetails.deviceId] = client.Device(deviceDetails.deviceInfo.nodeId).fit(deviceDetails);
                    $scope.socketStatus=null;
                    toggling=0;
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
            console.log("init3");
            client.signInWithCredentials(userCredentials);
            console.log("init4");
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

        // $http.get('/api/lights')
        //     .success(function (data) {
        //         console.log('print1');
        //         console.log(data);
        //         $scope.lights = data;
        //         $scope.lights.map(function (light) {
        //             console.log('estoy aqui');
        //             light.hex = rgbToHex(light.r, light.g, light.b);
        //         });
        //         console.log('print2');
        //         console.log($scope.lights);
        //     })
        //     .error(function (error) {
        //         console.log(error);
        //     });

        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }

        $scope.convertHexToRGB = function(light) {
            console.log(light);
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(light.hex);
            console.log(result);
            light.r = parseInt(result[1], 16);
            light.g = parseInt(result[2], 16);
            light.b = parseInt(result[3], 16);
            console.log(light);
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
