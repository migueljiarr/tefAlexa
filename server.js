var express = require('express');
var app = express();

var https = require('https');
var fs = require('fs');

var router = require('./app');

//app.set('port', process.env.PORT || 8000);
//var port = process.env.PORT || 8000;

//var sslPath = '/etc/letsencrypt/live/becsmarthome.dnsdynamic.com/';
var sslPath = '/etc/letsencrypt/live/becsmarthome.tk/';
//var sslPath = '/home/migueljiarr/Projects/Work/tk/';

var options = {  
    key: fs.readFileSync(sslPath + 'privkey.pem'),
    cert: fs.readFileSync(sslPath + 'fullchain.pem'),
    requestCert:true // Solves reliability issues. Thanks to: https://github.com/sushilks/alexaHarmonyApp/blob/master/server.js
};


app.use(router);

server = https.createServer(options, app);  
io = require('socket.io').listen(server);  

// Production.
var port = 8443;  

// Test.
//var port = 8444;  

server.listen(port);  

console.log('servidor funcionando por el puerto ' + port);
