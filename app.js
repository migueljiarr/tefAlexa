var express = require('express');
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var morgan       = require('morgan');
var requested = require('request');

var routes = require('./routes.js');

var app = express();

// view engine setup
app.set('views', 'frontend');              /*"las vistas (doc html) estan en la carpeta public (carpeta raiz)"*/

app.set('view engine', 'ejs');           /*app.set(que quieres setear, donde lo vas a setear)*/

app.use(morgan('dev'));                 /*vamos a usar morgan y logger cuando estemos en modo developer*/
app.use(logger('dev'));                 /*morgan y logger nos recopilan datos en console*/
app.use(bodyParser.json());             /*trabajamos en formato .json*/
app.use(bodyParser.urlencoded({ extended: false }));      /*falso que trabajaremos con rutas encriptadas*/
app.use(express.static('frontend'));       /*todos los archivos estaticos (assets) se ponen en public*/

app.use(function (req, res, next) {
    req.gw_ip= 'http://95.121.168.104:1234/';
    next()
});

app.use(routes);

module.exports = app;

